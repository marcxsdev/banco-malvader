import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    // Validar token
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

    // Obter dados da auditoria
    const auditoria = await query(
      "SELECT id_auditoria, id_usuario, acao, detalhes, data_hora FROM auditoria ORDER BY data_hora DESC"
    );

    return NextResponse.json({ success: true, auditoria });
  } catch (error) {
    console.error("Erro ao carregar auditoria:", error);
    return NextResponse.json(
      { error: "Erro ao carregar auditoria" },
      { status: 500 }
    );
  }
}
