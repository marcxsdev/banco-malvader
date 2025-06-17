import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";

export async function GET() {
  try {
    const contas = await query(`
      SELECT c.numero_conta, c.tipo_conta, c.saldo, u.nome AS cliente
      FROM conta c
      JOIN cliente cl ON c.id_cliente = cl.id_cliente
      JOIN usuario u ON cl.id_usuario = u.id_usuario
      WHERE c.status = 'ATIVA'
    `);
    return NextResponse.json({ success: true, contas });
  } catch (error) {
    console.error("Erro ao listar contas:", error);
    return NextResponse.json(
      { error: "Erro ao listar contas" },
      { status: 500 }
    );
  }
}
