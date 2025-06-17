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

    // Buscar movimentações
    const movimentacoes = await query(
      "SELECT * FROM vw_movimentacoes_recentes"
    );

    // Registrar na auditoria
    await query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
      [
        decoded.id_usuario,
        "CONSULTA_RELATORIO",
        "Consulta de movimentações recentes",
      ]
    );

    return NextResponse.json({ success: true, movimentacoes });
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar movimentações" },
      { status: 500 }
    );
  }
}
