import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/lib/util/db";
import { exportToExcel, exportToPDFExtrato } from "@/lib/util/export";
import { logAuditoria } from "@/lib/dao/transacaoDAO";

export async function POST(request) {
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
    if (decoded.tipo_usuario !== "CLIENTE") {
      return NextResponse.json(
        { error: "Acesso negado: apenas clientes" },
        { status: 403 }
      );
    }

    const id_usuario = decoded.id_usuario;

    // Obter formato do payload
    const { format } = await request.json();
    if (!["excel", "pdf"].includes(format)) {
      await logAuditoria(
        id_usuario,
        "EXPORTAR_EXTRATO",
        "Falha: formato inválido"
      );
      return NextResponse.json(
        { error: "Formato inválido. Use 'excel' ou 'pdf'" },
        { status: 400 }
      );
    }

    // Buscar id_cliente
    const clientes = await query(
      "SELECT id_cliente FROM cliente WHERE id_usuario = ?",
      [id_usuario]
    );
    if (clientes.length === 0) {
      await logAuditoria(
        id_usuario,
        "EXPORTAR_EXTRATO",
        "Falha: cliente não encontrado"
      );
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }
    const id_cliente = clientes[0].id_cliente;

    // Buscar transações
    const transacoes = await query(
      `SELECT t.id_transacao, c.numero_conta, t.tipo_transacao, t.valor, t.data_hora, t.descricao
       FROM vw_movimentacoes_recentes t
       JOIN conta c ON t.id_conta_origem = c.id_conta
       WHERE c.id_cliente = ?
       ORDER BY t.data_hora DESC
       LIMIT 50`,
      [id_cliente]
    );

    // Preparar dados para exportação
    const dadosExportacao = transacoes.map((t) => ({
      id_transacao: t.id_transacao,
      numero_conta: t.numero_conta,
      tipo_transacao: t.tipo_transacao,
      valor: t.valor,
      data_hora: new Date(t.data_hora).toLocaleString("pt-BR"),
      descricao: t.descricao,
    }));

    // Gerar arquivo
    let buffer, filename;
    if (format === "excel") {
      ({ buffer, filename } = await exportToExcel(dadosExportacao, "extrato"));
    } else {
      ({ buffer, filename } = await exportToPDFExtrato(
        dadosExportacao,
        "Extrato - Banco Malvader",
        "extrato"
      ));
    }

    // Registrar na auditoria
    await logAuditoria(
      id_usuario,
      "EXPORTAR_EXTRATO",
      `Sucesso: extrato exportado em ${format.toUpperCase()}`
    );

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar extrato:", error);
    await logAuditoria(null, "EXPORTAR_EXTRATO", `Erro: ${error.message}`);
    return NextResponse.json(
      { error: "Erro ao exportar extrato" },
      { status: 500 }
    );
  }
}
