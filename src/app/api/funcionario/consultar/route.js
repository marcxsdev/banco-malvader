import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { tipo, numero_conta, cpf } = await request.json();
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    // 1. Validar token JWT
    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      );
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.tipo_usuario !== "FUNCIONARIO") {
        return NextResponse.json(
          { error: "Acesso negado: apenas funcionários" },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // 2. Validar tipo de consulta
    if (!["CONTA", "CLIENTE", "FUNCIONARIO"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de consulta inválido" },
        { status: 400 }
      );
    }

    // 3. Processar consulta
    if (tipo === "CONTA") {
      if (!numero_conta) {
        return NextResponse.json(
          { error: "Número da conta é obrigatório" },
          { status: 400 }
        );
      }

      // Buscar dados da conta
      const conta = await query(
        `SELECT 
          c.numero_conta,
          c.tipo_conta AS tipo,
          c.saldo,
          u.nome,
          u.cpf,
          cc.limite,
          cc.data_vencimento
        FROM conta c
        JOIN cliente cl ON c.id_cliente = cl.id_cliente
        JOIN usuario u ON cl.id_usuario = u.id_usuario
        LEFT JOIN conta_corrente cc ON c.id_conta = cc.id_conta
        WHERE c.numero_conta = ?`,
        [numero_conta]
      );

      if (!conta.length) {
        return NextResponse.json(
          { error: "Conta não encontrada" },
          { status: 404 }
        );
      }

      // Buscar histórico de transações
      const historico = await query(
        `SELECT 
          tipo_transacao AS tipo,
          valor,
          DATE_FORMAT(data_hora, '%d/%m/%Y %H:%i') AS data
        FROM transacao
        WHERE id_conta_origem = (SELECT id_conta FROM conta WHERE numero_conta = ?)
          AND data_hora >= DATE_SUB(NOW(), INTERVAL 90 DAY)
        ORDER BY data_hora DESC`,
        [numero_conta]
      );

      // Mockar projeção de rendimentos (procedure não existe)
      const rendimentoPrevisto = ["POUPANCA", "INVESTIMENTO"].includes(
        conta[0].tipo
      )
        ? 0
        : null;

      return NextResponse.json({
        success: true,
        data: {
          tipo: conta[0].tipo,
          nome: conta[0].nome,
          cpf: conta[0].cpf,
          saldo: parseFloat(conta[0].saldo || 0).toFixed(2),
          limite: conta[0].limite
            ? parseFloat(conta[0].limite).toFixed(2)
            : "0.00",
          vencimento: conta[0].data_vencimento || "N/A",
          rendimentoPrevisto: rendimentoPrevisto
            ? rendimentoPrevisto.toFixed(2)
            : "N/A",
          historico,
        },
      });
    }

    if (tipo === "CLIENTE") {
      if (!cpf) {
        return NextResponse.json(
          { error: "CPF é obrigatório" },
          { status: 400 }
        );
      }

      // Buscar dados do cliente
      const cliente = await query(
        `SELECT 
          u.nome,
          u.cpf,
          DATE_FORMAT(u.data_nascimento, '%d/%m/%Y') AS nascimento,
          u.telefone,
          e.cep,
          e.local,
          e.numero_casa,
          e.bairro,
          e.cidade,
          e.estado,
          e.complemento
        FROM cliente cl
        JOIN usuario u ON cl.id_usuario = u.id_usuario
        LEFT JOIN endereco e ON u.id_usuario = e.id_usuario
        WHERE u.cpf = ?`,
        [cpf.replace(/\D/g, "")]
      );

      if (!cliente.length) {
        return NextResponse.json(
          { error: "Cliente não encontrado" },
          { status: 404 }
        );
      }

      // Buscar contas do cliente
      const contas = await query(
        `SELECT 
          numero_conta,
          tipo_conta AS tipo,
          status
        FROM conta
        WHERE id_cliente = (SELECT cl.id_cliente FROM cliente cl JOIN usuario u ON cl.id_usuario = u.id_usuario WHERE u.cpf = ?)`,
        [cpf.replace(/\D/g, "")]
      );

      // Calcular score de crédito
      let score = 0;
      try {
        const scoreResult = await query("CALL calcular_score_credito(?)", [
          cpf.replace(/\D/g, ""),
        ]);
        score = scoreResult[0]?.score || 0;
      } catch (error) {
        console.error("Erro ao calcular score de crédito:", error);
        score = 0;
      }

      return NextResponse.json({
        success: true,
        data: {
          nome: cliente[0].nome,
          cpf: cliente[0].cpf,
          nascimento: cliente[0].nascimento,
          telefone: cliente[0].telefone,
          endereco: {
            cep: cliente[0].cep,
            local: cliente[0].local,
            numero_casa: cliente[0].numero_casa,
            bairro: cliente[0].bairro,
            cidade: cliente[0].cidade,
            estado: cliente[0].estado,
            complemento: cliente[0].complemento,
          },
          score: parseFloat(score).toFixed(2),
          contas,
        },
      });
    }

    if (tipo === "FUNCIONARIO") {
      if (!cpf) {
        return NextResponse.json(
          { error: "CPF é obrigatório" },
          { status: 400 }
        );
      }

      // Buscar dados do funcionário
      const funcionario = await query(
        `SELECT 
          f.id_funcionario AS codigo,
          f.cargo,
          u.nome,
          u.cpf,
          DATE_FORMAT(u.data_nascimento, '%d/%m/%Y') AS nascimento,
          u.telefone,
          e.cep,
          e.local,
          e.numero_casa,
          e.bairro,
          e.cidade,
          e.estado,
          e.complemento,
          (SELECT COUNT(*) FROM conta WHERE id_funcionario_abertura = f.id_funcionario) AS contas_abertas,
          (SELECT COALESCE(AVG(t.valor), 0) FROM transacao t 
           JOIN conta c ON t.id_conta_origem = c.id_conta 
           WHERE c.id_funcionario_abertura = f.id_funcionario) AS desempenho
        FROM funcionario f
        JOIN usuario u ON f.id_usuario = u.id_usuario
        LEFT JOIN endereco e ON u.id_usuario = e.id_usuario
        WHERE u.cpf = ?`,
        [cpf.replace(/\D/g, "")]
      );

      if (!funcionario.length) {
        return NextResponse.json(
          { error: "Funcionário não encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          codigo: funcionario[0].codigo,
          cargo: funcionario[0].cargo,
          nome: funcionario[0].nome,
          cpf: funcionario[0].cpf,
          nascimento: funcionario[0].nascimento,
          telefone: funcionario[0].telefone,
          endereco: {
            cep: funcionario[0].cep,
            local: funcionario[0].local,
            numero_casa: funcionario[0].numero_casa,
            bairro: funcionario[0].bairro,
            cidade: funcionario[0].cidade,
            estado: funcionario[0].estado,
            complemento: funcionario[0].complemento,
          },
          contasAbertas: funcionario[0].contas_abertas,
          desempenho: parseFloat(funcionario[0].desempenho || 0).toFixed(2),
        },
      });
    }
  } catch (error) {
    console.error("Erro na consulta:", error);
    return NextResponse.json(
      { error: "Erro ao conectar ao servidor" },
      { status: 500 }
    );
  }
}
