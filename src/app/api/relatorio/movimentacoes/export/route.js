import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";
import jwt from "jsonwebtoken";
import { exportToExcel } from "@/lib/util/export";

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

    // Buscar auditoria
    const auditoria = await query(
      "SELECT id_auditoria, id_usuario, acao, detalhes, data_hora FROM auditoria ORDER BY data_hora DESC"
    );

    // Formatando data_hora para string legível
    const formattedAuditoria = auditoria.map((item) => ({
      id_auditoria: item.id_auditoria,
      id_usuario: item.id_usuario,
      acao: item.acao,
      detalhes: item.detalhes,
      data_hora: new Date(item.data_hora).toLocaleString("pt-BR"),
    }));

    // Gerar Excel
    const { buffer, filename } = await exportToExcel(
      formattedAuditoria,
      "relatorio_auditoria"
    );

    // Registrar na auditoria
    await query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
      [
        decoded.id_usuario,
        "EXPORTAR_RELATORIO",
        "Exportou relatório de auditoria em Excel",
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
