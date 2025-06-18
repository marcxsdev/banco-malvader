import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
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
    if (decoded.tipo_usuario !== "FUNCIONARIO") {
      return NextResponse.json(
        { error: "Acesso negado: apenas funcionários" },
        { status: 403 }
      );
    }

    // Obter id_funcionario do funcionário autenticado
    const [funcionario] = await query(
      "SELECT id_funcionario FROM funcionario WHERE id_usuario = ?",
      [decoded.id_usuario]
    );
    if (!funcionario) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }
    const id_funcionario = funcionario.id_funcionario;

    // Obter dados do formulário
    const body = await request.json();
    console.log("Dados recebidos:", body);

    const {
      nome,
      cpf,
      data_nascimento,
      telefone,
      senha,
      endereco,
      agencia,
      numero_conta,
      tipo_conta,
      taxa_rendimento,
      limite_credito,
      taxa_manutencao,
      perfil_investidor,
    } = body;

    // Validar campos obrigatórios
    const camposFaltando = [];
    if (!agencia) camposFaltando.push("agencia");
    if (!numero_conta) camposFaltando.push("numero_conta");
    if (!tipo_conta) camposFaltando.push("tipo_conta");
    if (!nome) camposFaltando.push("nome");
    if (!cpf) camposFaltando.push("cpf");
    if (!data_nascimento) camposFaltando.push("data_nascimento");
    if (!telefone) camposFaltando.push("telefone");
    if (!senha) camposFaltando.push("senha");
    if (
      !endereco ||
      !endereco.cep ||
      !endereco.local ||
      !endereco.numero_casa ||
      !endereco.bairro ||
      !endereco.cidade ||
      !endereco.estado
    ) {
      camposFaltando.push("endereco ou subcampos de endereco");
    }

    if (camposFaltando.length > 0) {
      return NextResponse.json(
        { error: `Campos obrigatórios faltando: ${camposFaltando.join(", ")}` },
        { status: 400 }
      );
    }

    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    // Validar senha
    try {
      await query("CALL validar_senha(?)", [senha]);
    } catch (error) {
      return NextResponse.json(
        { error: "Senha não atende aos requisitos" },
        { status: 400 }
      );
    }

    // Verificar se agência existe
    const agenciaExistente = await query(
      "SELECT id_agencia FROM agencia WHERE id_agencia = ?",
      [agencia]
    );
    if (!agenciaExistente.length) {
      return NextResponse.json(
        { error: "Agência não encontrada" },
        { status: 400 }
      );
    }

    // Verificar se número da conta já existe
    const contaExistente = await query(
      "SELECT id_conta FROM conta WHERE numero_conta = ?",
      [numero_conta]
    );
    if (contaExistente.length) {
      return NextResponse.json(
        { error: "Número da conta já existe" },
        { status: 400 }
      );
    }

    // Verificar se cliente existe
    let id_usuario = await query(
      "SELECT id_usuario FROM usuario WHERE cpf = ?",
      [cpfLimpo]
    );
    let id_cliente;
    if (!id_usuario.length) {
      // Cadastrar cliente
      const senhaHash = await bcrypt.hash(senha, 10);

      // Inserir usuário
      await query(
        "INSERT INTO usuario (nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash) VALUES (?, ?, ?, ?, ?, ?)",
        [nome, cpfLimpo, data_nascimento, telefone, "CLIENTE", senhaHash]
      );
      id_usuario = (await query("SELECT LAST_INSERT_ID() AS id"))[0].id;

      // Inserir endereço com id_usuario
      await query(
        "INSERT INTO endereco (id_usuario, cep, local, numero_casa, bairro, cidade, estado, complemento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id_usuario,
          endereco.cep,
          endereco.local,
          endereco.numero_casa,
          endereco.bairro,
          endereco.cidade,
          endereco.estado,
          endereco.complemento || null,
        ]
      );

      // Inserir cliente e obter id_cliente
      await query(
        "INSERT INTO cliente (id_usuario, score_credito) VALUES (?, 0)",
        [id_usuario]
      );
      id_cliente = (await query("SELECT LAST_INSERT_ID() AS id"))[0].id;
    } else {
      id_usuario = id_usuario[0].id_usuario;
      // Obter id_cliente existente
      const clienteExistente = await query(
        "SELECT id_cliente FROM cliente WHERE id_usuario = ?",
        [id_usuario]
      );
      if (!clienteExistente.length) {
        // Se o usuário existe, mas não é cliente, criar cliente
        await query(
          "INSERT INTO cliente (id_usuario, score_credito) VALUES (?, 0)",
          [id_usuario]
        );
        id_cliente = (await query("SELECT LAST_INSERT_ID() AS id"))[0].id;
      } else {
        id_cliente = clienteExistente[0].id_cliente;
      }
    }

    // Criar conta na tabela conta
    const insertContaQuery =
      "INSERT INTO conta (id_cliente, id_agencia, numero_conta, saldo, tipo_conta, id_funcionario_abertura) VALUES (?, ?, ?, ?, ?, ?)";
    const contaParams = [
      id_cliente,
      agenciaExistente[0].id_agencia,
      numero_conta,
      0.0,
      tipo_conta,
      id_funcionario,
    ];
    await query(insertContaQuery, contaParams);
    const id_conta = (await query("SELECT LAST_INSERT_ID() AS id"))[0].id;

    // Inserir dados específicos na tabela correspondente
    if (tipo_conta === "POUPANCA") {
      if (!taxa_rendimento) {
        return NextResponse.json(
          { error: "Taxa de rendimento obrigatória para conta poupança" },
          { status: 400 }
        );
      }
      await query(
        "INSERT INTO conta_poupanca (id_conta, taxa_rendimento) VALUES (?, ?)",
        [id_conta, taxa_rendimento]
      );
    } else if (tipo_conta === "CORRENTE") {
      if (!limite_credito || !taxa_manutencao) {
        return NextResponse.json(
          {
            error:
              "Limite de crédito e taxa de manutenção obrigatórios para conta corrente",
          },
          { status: 400 }
        );
      }
      // Gerar data_vencimento (1 mês a partir de hoje)
      const dataVencimento = new Date();
      dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      const dataVencimentoFormatada = dataVencimento
        .toISOString()
        .split("T")[0];
      await query(
        "INSERT INTO conta_corrente (id_conta, limite, data_vencimento, taxa_manutencao) VALUES (?, ?, ?, ?)",
        [id_conta, limite_credito, dataVencimentoFormatada, taxa_manutencao]
      );
    } else if (tipo_conta === "INVESTIMENTO") {
      if (!perfil_investidor) {
        return NextResponse.json(
          { error: "Perfil de investidor obrigatório para conta investimento" },
          { status: 400 }
        );
      }
      // Definir valores padrão para campos obrigatórios
      const valorMinimo = 1000.0; // Valor padrão
      const taxaRendimentoBase = 1.0; // Valor padrão
      await query(
        "INSERT INTO conta_investimento (id_conta, perfil_risco, valor_minimo, taxa_rendimento_base) VALUES (?, ?, ?, ?)",
        [id_conta, perfil_investidor, valorMinimo, taxaRendimentoBase]
      );
    } else {
      return NextResponse.json(
        { error: "Tipo de conta inválido" },
        { status: 400 }
      );
    }

    // Registrar na auditoria
    await query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
      [
        decoded.id_usuario,
        "ABRIR_CONTA",
        `Abriu conta ${tipo_conta} para cliente com CPF ${cpfLimpo}`,
      ]
    );

    return NextResponse.json({ success: true, id_conta });
  } catch (error) {
    console.error("Erro ao abrir conta:", error);
    return NextResponse.json(
      { error: "Erro ao criar a conta" },
      { status: 500 }
    );
  }
}
