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

async function createTransacao({
  id_conta_origem,
  tipo_transacao,
  valor,
  descricao,
}) {
  const result = await query(
    `INSERT INTO transacao (id_conta_origem, tipo_transacao, valor, descricao, data_hora)
     VALUES (?, ?, ?, ?, NOW())`,
    [id_conta_origem, tipo_transacao, valor, descricao]
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
     WHERE id_cliente = ? AND status = 'ATIVA'`,
    [id_cliente]
  );
  return contas;
}

module.exports = {
  findContaByNumeroAndCliente,
  createTransacao,
  logAuditoria,
  getExtrato,
  checkSaldoLimite,
  listarContas,
};
