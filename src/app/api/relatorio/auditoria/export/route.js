import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";
import jwt from "jsonwebtoken";
import { exportToPDF } from "@/lib/util/export";

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
      "SELECT id_usuario, acao, detalhes, data_hora FROM auditoria ORDER BY data_hora DESC"
    );

    // Gerar PDF
    const { buffer, filename } = await exportToPDF(
      auditoria,
      "Relatório de Auditoria - Banco Malvader",
      "relatorio_auditoria"
    );

    // Registrar na auditoria
    await query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
      [
        decoded.id_usuario,
        "EXPORTAR_RELATORIO",
        "Exportou relatório de auditoria em PDF",
      ]
    );

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar relatório:", error);
    return NextResponse.json(
      { error: "Erro ao exportar relatório" },
      { status: 500 }
    );
  }
}
