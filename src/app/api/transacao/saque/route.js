import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/lib/util/db";
import {
  createTransacao,
  findContaByNumeroAndCliente,
  logAuditoria,
  checkSaldoLimite,
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
    const { valor, numero_conta } = await request.json();
    if (!valor || !numero_conta) {
      await logAuditoria(
        id_usuario,
        "SAQUE",
        "Falha: campos obrigatórios ausentes"
      );
      return NextResponse.json(
        { error: "Valor e número da conta são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar valor
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      await logAuditoria(
        id_usuario,
        "SAQUE",
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
      await logAuditoria(id_usuario, "SAQUE", "Falha: cliente não encontrado");
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }
    const id_cliente = clientes[0].id_cliente;

    // Verificar se a conta pertence ao cliente
    const conta = await findContaByNumeroAndCliente(numero_conta, id_cliente);
    if (!conta) {
      await logAuditoria(
        id_usuario,
        "SAQUE",
        `Falha: conta ${numero_conta} inválida ou não pertence ao cliente`
      );
      return NextResponse.json(
        { error: "Conta inválida ou não pertence ao cliente" },
        { status: 404 }
      );
    }

    // Verificar saldo suficiente
    console.log(
      `Verificando saldo para conta ${numero_conta}, valor: ${valorNumerico}`
    );
    const saldoSuficiente = await checkSaldoLimite(
      conta.id_conta,
      valorNumerico
    );
    if (!saldoSuficiente) {
      await logAuditoria(
        id_usuario,
        "SAQUE",
        `Falha: saldo insuficiente na conta ${numero_conta}`
      );
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      );
    }

    // Inserir a transação
    const transacao = await createTransacao({
      id_conta_origem: conta.id_conta,
      tipo_transacao: "SAQUE",
      valor: valorNumerico,
      descricao: `Saque de R$${valorNumerico.toFixed(2)}`,
    });

    // Registrar na auditoria
    await logAuditoria(
      id_usuario,
      "SAQUE",
      `Sucesso: saque de R$${valorNumerico.toFixed(2)} na conta ${numero_conta}`
    );

    return NextResponse.json({
      success: true,
      message: "Saque realizado com sucesso",
      transacao: {
        id_transacao: transacao.insertId,
        valor: valorNumerico,
        data_hora: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro na API de saque:", error);
    await logAuditoria(null, "SAQUE", `Erro: ${error.message}`);
    return NextResponse.json(
      { error: "Erro ao processar saque" },
      { status: 500 }
    );
  }
}
