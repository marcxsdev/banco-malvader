import { NextResponse } from "next/server";
import { query, getConnection } from "@/lib/util/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(request) {
  let connection;
  try {
    const body = await request.json();
    const {
      codigo_funcionario,
      cargo,
      nome,
      cpf,
      data_nascimento,
      telefone,
      endereco,
      senha,
      id_supervisor,
    } = body;
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    // 1. Validar token JWT
    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.tipo_usuario !== "FUNCIONARIO") {
        return NextResponse.json(
          { error: "Acesso negado: apenas funcionários" },
          { status: 403 }
        );
      }
      const userResults = await query(
        `SELECT f.cargo 
         FROM funcionario f 
         JOIN usuario u ON f.id_usuario = u.id_usuario 
         WHERE u.id_usuario = ?`,
        [decoded.id_usuario]
      );
      if (!userResults.length || userResults[0].cargo !== "GERENTE") {
        return NextResponse.json(
          {
            error:
              "Acesso negado: apenas gerentes podem cadastrar funcionários",
          },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // 2. Validar campos obrigatórios
    if (
      !codigo_funcionario ||
      !cargo ||
      !nome ||
      !cpf ||
      !data_nascimento ||
      !telefone ||
      !endereco ||
      !senha
    ) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // 3. Validar CPF
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }
    const existingUser = await query(
      "SELECT id_usuario FROM usuario WHERE cpf = ?",
      [cpfLimpo]
    );
    if (existingUser.length) {
      return NextResponse.json({ error: "CPF já cadastrado" }, { status: 400 });
    }

    // 4. Validar codigo_funcionario
    const existingCodigo = await query(
      "SELECT id_funcionario FROM funcionario WHERE codigo_funcionario = ?",
      [codigo_funcionario]
    );
    if (existingCodigo.length) {
      return NextResponse.json(
        { error: "Código de funcionário já cadastrado" },
        { status: 400 }
      );
    }

    // 5. Validar senha
    let senhaHash;
    try {
      await query("CALL validar_senha(?)", [senha]);
      senhaHash = await bcrypt.hash(senha, 10);
    } catch (error) {
      return NextResponse.json(
        { error: "Senha não atende aos requisitos" },
        { status: 400 }
      );
    }

    // 6. Validar cargo
    if (!["ESTAGIARIO", "ATENDENTE", "GERENTE"].includes(cargo)) {
      return NextResponse.json({ error: "Cargo inválido" }, { status: 400 });
    }

    // 7. Validar endereço
    const { cep, local, numero_casa, bairro, cidade, estado, complemento } =
      endereco;
    if (!cep || !local || !numero_casa || !bairro || !cidade || !estado) {
      return NextResponse.json(
        {
          error:
            "Todos os campos de endereço são obrigatórios, exceto complemento",
        },
        { status: 400 }
      );
    }

    // 8. Validar id_supervisor, se fornecido
    if (id_supervisor) {
      const supervisor = await query(
        "SELECT id_funcionario FROM funcionario WHERE id_funcionario = ? AND cargo = 'GERENTE'",
        [id_supervisor]
      );
      if (!supervisor.length) {
        return NextResponse.json(
          { error: "Supervisor inválido ou não é gerente" },
          { status: 400 }
        );
      }
    }

    // 9. Inserir dados com transação
    connection = await getConnection();
    await connection.beginTransaction();

    // Inserir na tabela usuario
    const [userResult] = await connection.query(
      `INSERT INTO usuario (nome, cpf, data_nascimento, telefone, senha_hash, tipo_usuario) 
       VALUES (?, ?, ?, ?, ?, 'FUNCIONARIO')`,
      [nome, cpfLimpo, data_nascimento, telefone, senhaHash]
    );
    const id_usuario = userResult.insertId;

    // Inserir na tabela endereco
    await connection.query(
      `INSERT INTO endereco (id_usuario, cep, local, numero_casa, bairro, cidade, estado, complemento) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_usuario,
        cep,
        local,
        parseInt(numero_casa),
        bairro,
        cidade,
        estado,
        complemento || null,
      ]
    );

    // Inserir na tabela funcionario
    await connection.query(
      `INSERT INTO funcionario (id_usuario, codigo_funcionario, cargo, id_supervisor) 
       VALUES (?, ?, ?, ?)`,
      [id_usuario, codigo_funcionario, cargo, id_supervisor || null]
    );

    // 10. Registrar na auditoria
    await connection.query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
      [
        decoded.id_usuario,
        "CADASTRAR_FUNCIONARIO",
        `Cadastrou funcionário com CPF ${cpfLimpo} e código ${codigo_funcionario}`,
      ]
    );

    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Erro ao cadastrar funcionário:", error);
    return NextResponse.json(
      { error: "Erro ao processar cadastro" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
