import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { cpf, senha, otp, tipoUsuario } = await request.json();

    // Validação de campos obrigatórios
    if (!cpf || !senha || !otp || !tipoUsuario) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [null, "LOGIN", "Falha: campos obrigatórios ausentes"]
      );
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Validação do CPF
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [null, "LOGIN", `Falha: CPF inválido (${cpf})`]
      );
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    // Validar senha forte usando a procedure
    try {
      await query("CALL validar_senha(?)", [senha]);
    } catch (error) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [null, "LOGIN", "Falha: senha não atende aos requisitos"]
      );
      return NextResponse.json(
        { error: "Senha não atende aos requisitos" },
        { status: 400 }
      );
    }

    // Buscar usuário
    const users = await query(
      "SELECT * FROM usuario WHERE cpf = ? AND tipo_usuario = ?",
      [cpfLimpo, tipoUsuario]
    );

    if (users.length === 0) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [null, "LOGIN", `Falha: usuário com CPF ${cpf} não encontrado`]
      );
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    const usuario = users[0];

    // Validar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [usuario.id_usuario, "LOGIN", "Falha: senha incorreta"]
      );
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    // Validar OTP
    if (
      usuario.otp_ativo !== otp ||
      new Date(usuario.otp_expiracao) < new Date()
    ) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [usuario.id_usuario, "LOGIN", "Falha: OTP inválido ou expirado"]
      );
      return NextResponse.json(
        { error: "OTP inválido ou expirado" },
        { status: 401 }
      );
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, tipo_usuario: tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Registrar login bem-sucedido na auditoria
    await query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
      [usuario.id_usuario, "LOGIN", "Sucesso"]
    );

    // Retornar resposta
    return NextResponse.json({
      success: true,
      token,
      user: { id: usuario.id_usuario, nome: usuario.nome, tipo: tipoUsuario },
    });
  } catch (error) {
    console.error("Erro na API de autenticação:", error);
    await query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
      [null, "LOGIN", `Erro no servidor: ${error.message}`]
    );
    return NextResponse.json(
      { error: "Erro ao conectar ao servidor" },
      { status: 500 }
    );
  }
}
