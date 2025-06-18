const { query } = require("@/lib/util/db");

async function findContaByNumeroAndCliente(numero_conta, id_cliente) {
  const contas = await query(
    `SELECT id_conta, numero_conta
     FROM conta
     WHERE numero_conta = ? AND id_cliente = ? AND status = 'ATIVA'`,
    [numero_conta, id_cliente]
  );
  return contas.length > 0 ? contas[0] : null;
}

async function findContaByNumero(numero_conta) {
  const contas = await query(
    `SELECT id_conta, numero_conta
     FROM conta
     WHERE numero_conta = ? AND status = 'ATIVA'`,
    [numero_conta]
  );
  return contas.length > 0 ? contas[0] : null;
}

async function createTransacao({
  id_conta_origem,
  id_conta_destino,
  tipo_transacao,
  valor,
  descricao,
}) {
  const result = await query(
    `INSERT INTO transacao (id_conta_origem, id_conta_destino, tipo_transacao, valor, descricao, data_hora)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [
      id_conta_origem,
      id_conta_destino || null,
      tipo_transacao,
      valor,
      descricao,
    ]
  );
  return { insertId: result.insertId };
}

async function logAuditoria(id_usuario, acao, detalhes) {
  await query(
    `INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora)
     VALUES (?, ?, ?, NOW())`,
    [id_usuario, acao, detalhes]
  );
}

async function getExtrato(id_cliente) {
  const transacoes = await query(
    `SELECT t.id_transacao, c.numero_conta, t.tipo_transacao, t.valor, t.data_hora, t.descricao
     FROM vw_movimentacoes_recentes t
     JOIN conta c ON t.id_conta_origem = c.id_conta
     WHERE c.id_cliente = ?
     ORDER BY t.data_hora DESC
     LIMIT 50`,
    [id_cliente]
  );
  return transacoes;
}

async function checkSaldoLimite(id_conta, valor_saque) {
  const contas = await query(
    `SELECT c.saldo, COALESCE(cc.limite, 0) AS limite
     FROM conta c
     LEFT JOIN conta_corrente cc ON c.id_conta = cc.id_conta
     WHERE c.id_conta = ? AND c.status = 'ATIVA'`,
    [id_conta]
  );

  if (contas.length === 0) {
    console.log(`Conta não encontrada para id_conta: ${id_conta}`);
    return false;
  }

  const { saldo, limite } = contas[0];
  const saldoNumerico = parseFloat(saldo);
  const limiteNumerico = parseFloat(limite);
  const valorSaqueNumerico = parseFloat(valor_saque);
  const saldoDisponivel = saldoNumerico + limiteNumerico;

  console.log(
    `Saldo: ${saldoNumerico.toFixed(2)}, Limite: ${limiteNumerico.toFixed(
      2
    )}, ` +
      `Saldo Disponível: ${saldoDisponivel.toFixed(
        2
      )}, Valor Saque: ${valorSaqueNumerico.toFixed(2)}`
  );

  const isSuficiente = saldoDisponivel >= valorSaqueNumerico;
  console.log(`Saldo suficiente: ${isSuficiente}`);

  return isSuficiente;
}

async function listarContas(id_cliente) {
  const contas = await query(
    `SELECT numero_conta, tipo_conta, saldo
     FROM conta
     WHERE id_cliente = ? AND status = 'ATIVA' AND tipo_conta = 'CORRENTE'`,
    [id_cliente]
  );
  return contas;
}

async function getLimiteEProjecao(id_usuario, numero_conta) {
  // Buscar id_cliente
  const clientes = await query(
    "SELECT id_cliente, score_credito FROM cliente WHERE id_usuario = ?",
    [id_usuario]
  );
  if (clientes.length === 0) return null;
  const { id_cliente, score_credito } = clientes[0];

  // Buscar conta e limite
  const contas = await query(
    `SELECT c.id_conta, c.numero_conta, COALESCE(cc.limite, 0) AS limite
     FROM conta c
     LEFT JOIN conta_corrente cc ON c.id_conta = cc.id_conta
     WHERE c.numero_conta = ? AND c.id_cliente = ? AND c.status = 'ATIVA' AND c.tipo_conta = 'CORRENTE'`,
    [numero_conta, id_cliente]
  );
  if (contas.length === 0) return null;

  const { limite } = contas[0];
  let projecao = limite;
  let periodo_projecao = "sem aumento previsto";

  // Calcular projeção com base no score de crédito
  if (score_credito >= 700) {
    projecao = limite * 1.2; // +20%
    periodo_projecao = "em 3 meses";
  } else if (score_credito >= 500) {
    projecao = limite * 1.1; // +10%
    periodo_projecao = "em 6 meses";
  }

  return {
    limite: parseFloat(limite),
    projecao: parseFloat(projecao.toFixed(2)),
    periodo_projecao,
  };
}

module.exports = {
  findContaByNumeroAndCliente,
  findContaByNumero,
  createTransacao,
  logAuditoria,
  getExtrato,
  checkSaldoLimite,
  listarContas,
  getLimiteEProjecao,
};
