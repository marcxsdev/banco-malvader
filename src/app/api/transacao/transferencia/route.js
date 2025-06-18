import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/lib/util/db";
import {
  createTransacao,
  findContaByNumeroAndCliente,
  findContaByNumero,
  checkSaldoLimite,
  logAuditoria,
} from "@/lib/dao/transacaoDAO";

export async function POST(request) {
  try {
    // Obter o token do header Authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }
    const token = authHeader.split(" ")[1];

    // Verificar o token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.tipo_usuario !== "CLIENTE") {
        return NextResponse.json(
          { error: "Acesso negado: apenas clientes" },
          { status: 403 }
        );
      }
    } catch (err) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const id_usuario = decoded.id_usuario;

    // Obter o payload da requisição
    const { valor, numero_conta_origem, numero_conta_destino } =
      await request.json();
    if (!valor || !numero_conta_origem || !numero_conta_destino) {
      await logAuditoria(
        id_usuario,
        "TRANSFERENCIA",
        "Falha: campos obrigatórios ausentes"
      );
      return NextResponse.json(
        { error: "Valor, conta de origem e conta de destino são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar valor
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      await logAuditoria(
        id_usuario,
        "TRANSFERENCIA",
        `Falha: valor inválido (${valor})`
      );
      return NextResponse.json(
        { error: "Valor deve ser positivo" },
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
        "TRANSFERENCIA",
        "Falha: cliente não encontrado"
      );
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }
    const id_cliente = clientes[0].id_cliente;

    // Verificar se a conta de origem pertence ao cliente
    const contaOrigem = await findContaByNumeroAndCliente(
      numero_conta_origem,
      id_cliente
    );
    if (!contaOrigem) {
      await logAuditoria(
        id_usuario,
        "TRANSFERENCIA",
        `Falha: conta de origem ${numero_conta_origem} inválida ou não pertence ao cliente`
      );
      return NextResponse.json(
        { error: "Conta de origem inválida ou não pertence ao cliente" },
        { status: 404 }
      );
    }

    // Verificar se a conta de destino existe e está ativa
    const contaDestino = await findContaByNumero(numero_conta_destino);
    if (!contaDestino) {
      await logAuditoria(
        id_usuario,
        "TRANSFERENCIA",
        `Falha: conta de destino ${numero_conta_destino} inválida`
      );
      return NextResponse.json(
        { error: "Conta de destino inválida" },
        { status: 404 }
      );
    }

    // Verificar saldo suficiente na conta de origem
    const saldoSuficiente = await checkSaldoLimite(
      contaOrigem.id_conta,
      valorNumerico
    );
    if (!saldoSuficiente) {
      await logAuditoria(
        id_usuario,
        "TRANSFERENCIA",
        `Falha: saldo insuficiente na conta ${numero_conta_origem}`
      );
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      );
    }

    // Inserir a transação
    const transacao = await createTransacao({
      id_conta_origem: contaOrigem.id_conta,
      id_conta_destino: contaDestino.id_conta,
      tipo_transacao: "TRANSFERENCIA",
      valor: valorNumerico,
      descricao: `Transferência de R$${valorNumerico.toFixed(
        2
      )} para conta ${numero_conta_destino}`,
    });

    // Registrar na auditoria
    await logAuditoria(
      id_usuario,
      "TRANSFERENCIA",
      `Sucesso: transferência de R$${valorNumerico.toFixed(
        2
      )} de ${numero_conta_origem} para ${numero_conta_destino}`
    );

    return NextResponse.json({
      success: true,
      message: "Transferência realizada com sucesso",
      transacao: {
        id_transacao: transacao.insertId,
        valor: valorNumerico,
        data_hora: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro na API de transferência:", error);
    await logAuditoria(null, "TRANSFERENCIA", `Erro: ${error.message}`);
    return NextResponse.json(
      { error: "Erro ao processar transferência" },
      { status: 500 }
    );
  }
}
