import { NextResponse } from "next/server";
import pool from "../../../lib/util/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { cpf, senha, otp, tipoUsuario } = await request.json();
    const [rows] = await pool.query(
      "SELECT * FROM usuario WHERE cpf = ? AND tipo_usuario = ?",
      [cpf, tipoUsuario]
    );

    if (rows.length === 0) {
      await pool.query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)",
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
      await pool.query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)",
        [usuario.id_usuario, "LOGIN", "Falha: senha incorreta"]
      );
      return NextResponse.json(
        { success: false, message: "Senha incorreta" },
        { status: 401 }
      );
    }

    if (usuario.otp_ativo !== otp || usuario.otp_expiracao < new Date()) {
      await pool.query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)",
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

    await pool.query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)",
      [usuario.id_usuario, "LOGIN", "Sucesso"]
    );

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error(error);
    await pool.query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)",
      [null, "LOGIN", `Erro no servidor: ${error.message}`]
    );
    return NextResponse.json(
      { success: false, message: "Erro no servidor" },
      { status: 500 }
    );
  }
}
