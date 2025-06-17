import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";
import jwt from "jsonwebtoken";

export async function GET(request) {
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

    const funcionario = await query(
      "SELECT cargo FROM funcionario WHERE id_usuario = ?",
      [decoded.id_usuario]
    );
    if (!funcionario.length) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, cargo: funcionario[0].cargo });
  } catch (error) {
    console.error("Erro ao obter perfil:", error);
    return NextResponse.json(
      { error: "Erro ao obter perfil" },
      { status: 500 }
    );
  }
}
