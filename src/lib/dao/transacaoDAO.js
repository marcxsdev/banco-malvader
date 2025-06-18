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

module.exports = {
  findContaByNumeroAndCliente,
  createTransacao,
  logAuditoria,
  getExtrato,
};
