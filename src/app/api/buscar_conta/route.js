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
        "LISTAR_CONTAS",
        "Falha: cliente não encontrado"
      );
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }
    const id_cliente = clientes[0].id_cliente;

    // Buscar contas ativas
    const contas = await query(
      `SELECT numero_conta, tipo_conta, saldo
       FROM conta
       WHERE id_cliente = ? AND status = 'ATIVA'`,
      [id_cliente]
    );

    // Registrar na auditoria
    await logAuditoria(
      id_usuario,
      "LISTAR_CONTAS",
      "Sucesso: lista de contas obtida"
    );

    return NextResponse.json({ success: true, contas });
  } catch (error) {
    console.error("Erro ao listar contas:", error);
    await logAuditoria(null, "LISTAR_CONTAS", `Erro: ${error.message}`);
    return NextResponse.json(
      { error: "Erro ao listar contas" },
      { status: 500 }
    );
  }
}
