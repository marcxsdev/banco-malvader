import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";

export async function POST(request) {
  try {
    const { cpf, tipoUsuario } = await request.json();

    if (!cpf || !tipoUsuario) {
      return NextResponse.json(
        { error: "CPF e tipo de usuário são obrigatórios" },
        { status: 400 }
      );
    }

    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    const users = await query(
      "SELECT id_usuario FROM usuario WHERE cpf = ? AND tipo_usuario = ?",
      [cpfLimpo, tipoUsuario]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    const id_usuario = users[0].id_usuario;
    const [result] = await query("CALL gerar_otp(?)", [id_usuario]);
    const otp = result[0].otp;

    return NextResponse.json({ success: true, otp });
  } catch (error) {
    console.error("Erro ao gerar OTP:", error);
    return NextResponse.json({ error: "Erro ao gerar OTP" }, { status: 500 });
  }
}
