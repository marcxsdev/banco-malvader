import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tipo_usuario !== "FUNCIONARIO") {
      return NextResponse.json(
        { error: "Acesso negado: apenas funcionários" },
        { status: 403 }
      );
    }

    const gerente = await query(
      "SELECT cargo FROM funcionario WHERE id_usuario = ?",
      [decoded.id_usuario]
    );
    if (!gerente.length || gerente[0].cargo !== "GERENTE") {
      return NextResponse.json(
        { error: "Acesso negado: apenas gerentes" },
        { status: 403 }
      );
    }

    const { nome, cpf, data_nascimento, telefone, senha, cargo, id_agencia } =
      await request.json();

    if (
      !nome ||
      !cpf ||
      !data_nascimento ||
      !telefone ||
      !senha ||
      !cargo ||
      !id_agencia
    ) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    const usuarioExistente = await query(
      "SELECT id_usuario FROM usuario WHERE cpf = ?",
      [cpfLimpo]
    );
    if (usuarioExistente.length) {
      return NextResponse.json({ error: "CPF já cadastrado" }, { status: 400 });
    }

    try {
      await query("CALL validar_senha(?)", [senha]);
    } catch (error) {
      return NextResponse.json(
        { error: "Senha não atende aos requisitos" },
        { status: 400 }
      );
    }

    const agenciaExistente = await query(
      "SELECT id_agencia FROM agencia WHERE id_agencia = ?",
      [id_agencia]
    );
    if (!agenciaExistente.length) {
      return NextResponse.json(
        { error: "Agência não encontrada" },
        { status: 400 }
      );
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await query(
      "INSERT INTO usuario (nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash) VALUES (?, ?, ?, ?, ?, ?)",
      [nome, cpfLimpo, data_nascimento, telefone, "FUNCIONARIO", senhaHash]
    );
    const id_usuario = (await query("SELECT LAST_INSERT_ID() AS id"))[0].id;

    await query(
      "INSERT INTO funcionario (id_usuario, id_agencia, cargo) VALUES (?, ?, ?)",
      [id_usuario, id_agencia, cargo]
    );

    await query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
      [
        decoded.id_usuario,
        "CADASTRO_FUNCIONARIO",
        `Cadastrou funcionário com CPF ${cpfLimpo}`,
      ]
    );

    return NextResponse.json({ success: true, id_usuario });
  } catch (error) {
    console.error("Erro ao cadastrar funcionário:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar funcionário" },
      { status: 500 }
    );
  }
}
