import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";
import { exportToExcel } from "@/lib/util/export";
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

    // Gerar Excel
    const { buffer, filename } = await exportToExcel(
      movimentacoes,
      "relatorio_movimentacoes"
    );

    // Registrar na auditoria
    await query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
      [
        decoded.id_usuario,
        "EXPORTACAO_RELATORIO",
        "Exportação de movimentações recentes em Excel",
      ]
    );

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}
