import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/lib/util/db";
import { logAuditoria } from "@/lib/dao/transacaoDAO";

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
    if (decoded.tipo_usuario !== "CLIENTE") {
      return NextResponse.json(
        { error: "Acesso negado: apenas clientes" },
        { status: 403 }
      );
    }

    const id_usuario = decoded.id_usuario;

    // Buscar id_cliente
    const clientes = await query(
      "SELECT id_cliente FROM cliente WHERE id_usuario = ?",
      [id_usuario]
    );
    if (clientes.length === 0) {
      await logAuditoria(
        id_usuario,
        "CONSULTA_EXTRATO",
        "Falha: cliente não encontrado"
      );
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }
    const id_cliente = clientes[0].id_cliente;

    // Buscar transações (últimas 50), corrigindo o WHERE para usar c.id_cliente
    const transacoes = await query(
      `SELECT t.id_transacao, c.numero_conta, t.tipo_transacao, t.valor, t.data_hora, t.descricao
       FROM vw_movimentacoes_recentes t
       JOIN conta c ON t.id_conta_origem = c.id_conta
       WHERE c.id_cliente = ?
       ORDER BY t.data_hora DESC
       LIMIT 50`,
      [id_cliente]
    );

    // Registrar na auditoria
    await logAuditoria(
      id_usuario,
      "CONSULTA_EXTRATO",
      "Sucesso: consulta de extrato realizada"
    );

    return NextResponse.json({ success: true, transacoes });
  } catch (error) {
    console.error("Erro ao consultar extrato:", error);
    await logAuditoria(null, "CONSULTA_EXTRATO", `Erro: ${error.message}`);
    return NextResponse.json(
      { error: "Erro ao consultar extrato" },
      { status: 500 }
    );
  }
}
