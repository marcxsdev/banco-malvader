import { NextResponse } from "next/server";
import pool from "../../../lib/util/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  let connection;
  try {
    connection = await pool.getConnection();

    const { cpf, senha, otp, tipoUsuario } = await request.json();

    if (!cpf || !senha || !otp || !tipoUsuario) {
      await connection.query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [null, "LOGIN", "Falha: campos obrigatórios ausentes"]
      );
      return NextResponse.json(
        { success: false, message: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }
    if (cpf.replace(/\D/g, "").length !== 11) {
      await connection.query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [null, "LOGIN", `Falha: CPF inválido (${cpf})`]
      );
      return NextResponse.json(
        { success: false, message: "CPF inválido" },
        { status: 400 }
      );
    }

    const [rows] = await connection.query(
      "SELECT * FROM usuario WHERE cpf = ? AND tipo_usuario = ?",
      [cpf.replace(/\D/g, ""), tipoUsuario]
    );

    if (rows.length === 0) {
      await connection.query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [null, "LOGIN", `Falha: usuário com CPF ${cpf} não encontrado`]
      );
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    const usuario = rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      await connection.query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [usuario.id_usuario, "LOGIN", "Falha: senha incorreta"]
      );
      return NextResponse.json(
        { success: false, message: "Senha incorreta" },
        { status: 401 }
      );
    }

    if (usuario.otp_ativo !== otp || usuario.otp_expiracao < new Date()) {
      await connection.query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [usuario.id_usuario, "LOGIN", "Falha: OTP inválido ou expirado"]
      );
      return NextResponse.json(
        { success: false, message: "OTP inválido ou expirado" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, tipo_usuario: tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await connection.query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
      [usuario.id_usuario, "LOGIN", "Sucesso"]
    );

    return NextResponse.json(
      { success: true, token },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Erro na API de autenticação:", error);
    try {
      if (connection) {
        await connection.query(
          "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
          [null, "LOGIN", `Erro no servidor: ${error.message}`]
        );
      }
    } catch (auditError) {
      console.error("Erro ao registrar na auditoria:", auditError);
    }
    return NextResponse.json(
      { success: false, message: "Erro ao conectar ao servidor" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
