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
      const [conta] = await query(
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

      if (!conta) {
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
        conta.tipo
      )
        ? 0
        : null;

      return NextResponse.json({
        success: true,
        data: {
          tipo: conta.tipo,
          nome: conta.nome,
          cpf: conta.cpf,
          saldo: parseFloat(conta.saldo || 0).toFixed(2), // Garantir número
          limite: conta.limite ? parseFloat(conta.limite).toFixed(2) : "0.00",
          vencimento: conta.data_vencimento || "N/A",
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
      const [cliente] = await query(
        `SELECT 
      u.nome,
      u.cpf,
      DATE_FORMAT(u.data_nascimento, '%d/%m/%Y') AS nascimento,
      u.telefone,
      u.endereco
    FROM cliente cl
    JOIN usuario u ON cl.id_usuario = u.id_usuario
    WHERE u.cpf = ?`,
        [cpf.replace(/\D/g, "")]
      );

      if (!cliente) {
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
        const [scoreResult] = await query("CALL calcular_score_credito(?)", [
          cpf.replace(/\D/g, ""),
        ]);
        score = scoreResult[0]?.score || 0;
      } catch (error) {
        console.error("Erro ao calcular score de crédito:", error);
        // Retornar score 0 em caso de erro para não quebrar a consulta
        score = 0;
      }

      return NextResponse.json({
        success: true,
        data: {
          nome: cliente.nome,
          cpf: cliente.cpf,
          nascimento: cliente.nascimento,
          telefone: cliente.telefone,
          endereco: cliente.endereco,
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
      const [funcionario] = await query(
        `SELECT 
          f.id_funcionario AS codigo,
          f.cargo,
          u.nome,
          u.cpf,
          DATE_FORMAT(u.data_nascimento, '%d/%m/%Y') AS nascimento,
          u.telefone,
          u.endereco,
          (SELECT COUNT(*) FROM conta WHERE id_funcionario_abertura = f.id_funcionario) AS contas_abertas,
          (SELECT COALESCE(AVG(t.valor), 0) FROM transacao t 
           JOIN conta c ON t.id_conta_origem = c.id_conta 
           WHERE c.id_funcionario_abertura = f.id_funcionario) AS desempenho
        FROM funcionario f
        JOIN usuario u ON f.id_usuario = u.id_usuario
        WHERE u.cpf = ?`,
        [cpf.replace(/\D/g, "")]
      );

      if (!funcionario) {
        return NextResponse.json(
          { error: "Funcionário não encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          codigo: funcionario.codigo,
          cargo: funcionario.cargo,
          nome: funcionario.nome,
          cpf: funcionario.cpf,
          nascimento: funcionario.nascimento,
          telefone: funcionario.telefone,
          endereco: funcionario.endereco,
          contasAbertas: funcionario.contas_abertas,
          desempenho: parseFloat(funcionario.desempenho || 0).toFixed(2),
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
