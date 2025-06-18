import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { tipo } = body;
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

    // 2. Validar tipo
    if (!["CONTA", "FUNCIONARIO", "CLIENTE"].includes(tipo)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    // 3. Processar alteração
    if (tipo === "CONTA") {
      const { numero_conta, limite, data_vencimento, taxa } = body;
      if (!numero_conta) {
        return NextResponse.json(
          { error: "Número da conta é obrigatório" },
          { status: 400 }
        );
      }

      // Verificar se conta existe e obter id_cliente
      const [conta] = await query(
        `SELECT c.id_conta, c.tipo_conta, c.id_cliente, u.cpf
         FROM conta c
         JOIN cliente cl ON c.id_cliente = cl.id_cliente
         JOIN usuario u ON cl.id_usuario = u.id_usuario
         WHERE c.numero_conta = ? AND c.status = 'ATIVA'`,
        [numero_conta]
      );
      if (!conta) {
        return NextResponse.json(
          { error: "Conta não encontrada ou inativa" },
          { status: 404 }
        );
      }

      // Validar limite com score de crédito
      if (limite !== undefined && conta.tipo_conta === "CORRENTE") {
        const [scoreResult] = await query("CALL calcular_score_credito(?)", [
          conta.cpf,
        ]);
        const score = scoreResult[0]?.score || 0;
        const limiteMaximo = score >= 80 ? 10000 : score >= 50 ? 5000 : 1000;
        if (limite > limiteMaximo) {
          return NextResponse.json(
            {
              error: `Limite excede o máximo permitido (R$${limiteMaximo}) para score ${score}`,
            },
            { status: 400 }
          );
        }
      }

      // Atualizar dados
      const updates = [];
      const params = [];
      let auditoriaDetalhes = `Alterou conta ${numero_conta}:`;

      if (conta.tipo_conta === "CORRENTE") {
        if (limite !== undefined) {
          updates.push("limite = ?");
          params.push(limite);
          auditoriaDetalhes += ` limite para ${limite},`;
        }
        if (data_vencimento) {
          updates.push("data_vencimento = ?");
          params.push(data_vencimento);
          auditoriaDetalhes += ` data_vencimento para ${data_vencimento},`;
        }
        if (taxa !== undefined) {
          updates.push("taxa_manutencao = ?");
          params.push(taxa);
          auditoriaDetalhes += ` taxa_manutencao para ${taxa},`;
        }
        if (updates.length > 0) {
          params.push(conta.id_conta);
          await query(
            `UPDATE conta_corrente SET ${updates.join(
              ", "
            )} WHERE id_conta = ?`,
            params
          );
        }
      } else if (conta.tipo_conta === "POUPANCA") {
        if (taxa !== undefined) {
          await query(
            "UPDATE conta_poupanca SET taxa_rendimento = ? WHERE id_conta = ?",
            [taxa, conta.id_conta]
          );
          auditoriaDetalhes += ` taxa_rendimento para ${taxa},`;
        }
      } else if (conta.tipo_conta === "INVESTIMENTO") {
        if (taxa !== undefined) {
          await query(
            "UPDATE conta_investimento SET taxa_rendimento_base = ? WHERE id_conta = ?",
            [taxa, conta.id_conta]
          );
          auditoriaDetalhes += ` taxa_rendimento_base para ${taxa},`;
        }
      }

      if (updates.length === 0 && taxa === undefined) {
        return NextResponse.json(
          { error: "Nenhum dado fornecido para alteração" },
          { status: 400 }
        );
      }

      // Registrar na auditoria
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [decoded.id_usuario, "ALTERAR_CONTA", auditoriaDetalhes.slice(0, -1)]
      );

      return NextResponse.json({ success: true });
    }

    if (tipo === "FUNCIONARIO") {
      const { cpf, cargo, telefone, endereco } = body;
      if (!cpf) {
        return NextResponse.json(
          { error: "CPF é obrigatório" },
          { status: 400 }
        );
      }

      // Validar endereço, se fornecido
      if (endereco) {
        const camposObrigatorios = [
          "cep",
          "local",
          "numero_casa",
          "bairro",
          "cidade",
          "estado",
        ];
        for (const campo of camposObrigatorios) {
          if (!endereco[campo]) {
            return NextResponse.json(
              { error: `Campo ${campo} do endereço é obrigatório` },
              { status: 400 }
            );
          }
        }
      }

      // Verificar se funcionário existe
      const [funcionario] = await query(
        `SELECT f.id_funcionario, f.cargo, f.id_usuario
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

      // Validar cargo (restrição hierárquica)
      const hierarquia = { ESTAGIARIO: 1, ATENDENTE: 2, GERENTE: 3 };
      if (cargo && cargo !== funcionario.cargo) {
        if (hierarquia[cargo] < hierarquia[funcionario.cargo]) {
          return NextResponse.json(
            { error: "Não é permitido rebaixar o cargo do funcionário" },
            { status: 400 }
          );
        }
      }

      // Atualizar dados
      const updates = [];
      const params = [];
      let auditoriaDetalhes = `Alterou funcionário com CPF ${cpf}:`;

      if (telefone) {
        updates.push("telefone = ?");
        params.push(telefone);
        auditoriaDetalhes += ` telefone para ${telefone},`;
      }

      if (updates.length > 0) {
        params.push(funcionario.id_usuario);
        await query(
          `UPDATE usuario SET ${updates.join(", ")} WHERE id_usuario = ?`,
          params
        );
      }

      if (cargo && cargo !== funcionario.cargo) {
        await query(
          "UPDATE funcionario SET cargo = ? WHERE id_funcionario = ?",
          [cargo, funcionario.id_funcionario]
        );
        auditoriaDetalhes += ` cargo para ${cargo},`;
      }

      if (endereco) {
        // Verificar se endereço existe, senão inserir
        const [existingEnd] = await query(
          "SELECT id_endereco FROM endereco WHERE id_usuario = ?",
          [funcionario.id_usuario]
        );
        if (existingEnd) {
          await query(
            `UPDATE endereco SET 
              cep = ?, local = ?, numero_casa = ?, bairro = ?, cidade = ?, estado = ?, complemento = ?
             WHERE id_usuario = ?`,
            [
              endereco.cep,
              endereco.local,
              endereco.numero_casa,
              endereco.bairro,
              endereco.cidade,
              endereco.estado,
              endereco.complemento || null,
              funcionario.id_usuario,
            ]
          );
        } else {
          await query(
            "INSERT INTO endereco (id_usuario, cep, local, numero_casa, bairro, cidade, estado, complemento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
              funcionario.id_usuario,
              endereco.cep,
              endereco.local,
              endereco.numero_casa,
              endereco.bairro,
              endereco.cidade,
              endereco.estado,
              endereco.complemento || null,
            ]
          );
        }
        auditoriaDetalhes += ` endereco,`;
      }

      if (updates.length === 0 && !cargo && !endereco) {
        return NextResponse.json(
          { error: "Nenhum dado fornecido para alteração" },
          { status: 400 }
        );
      }

      // Registrar na auditoria
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [
          decoded.id_usuario,
          "ALTERAR_FUNCIONARIO",
          auditoriaDetalhes.slice(0, -1),
        ]
      );

      return NextResponse.json({ success: true });
    }

    if (tipo === "CLIENTE") {
      const { cpf, telefone, senha, endereco } = body;
      if (!cpf) {
        return NextResponse.json(
          { error: "CPF é obrigatório" },
          { status: 400 }
        );
      }

      // Validar endereço, se fornecido
      if (endereco) {
        const camposObrigatorios = [
          "cep",
          "local",
          "numero_casa",
          "bairro",
          "cidade",
          "estado",
        ];
        for (const campo of camposObrigatorios) {
          if (!endereco[campo]) {
            return NextResponse.json(
              { error: `Campo ${campo} do endereço é obrigatório` },
              { status: 400 }
            );
          }
        }
      }

      // Verificar se cliente existe
      const [cliente] = await query(
        `SELECT c.id_usuario
         FROM cliente c
         JOIN usuario u ON c.id_usuario = u.id_usuario
         WHERE u.cpf = ?`,
        [cpf.replace(/\D/g, "")]
      );
      if (!cliente) {
        return NextResponse.json(
          { error: "Cliente não encontrado" },
          { status: 404 }
        );
      }

      // Validar senha
      let senhaHash;
      if (senha) {
        try {
          await query("CALL validar_senha(?)", [senha]);
          senhaHash = await bcrypt.hash(senha, 10);
        } catch (error) {
          return NextResponse.json(
            { error: "Senha não atende aos requisitos" },
            { status: 400 }
          );
        }
      }

      // Atualizar dados
      const updates = [];
      const params = [];
      let auditoriaDetalhes = `Alterou cliente com CPF ${cpf}:`;

      if (telefone) {
        updates.push("telefone = ?");
        params.push(telefone);
        auditoriaDetalhes += ` telefone para ${telefone},`;
      }
      if (senhaHash) {
        updates.push("senha_hash = ?");
        params.push(senhaHash);
        auditoriaDetalhes += ` senha,`;
      }

      if (updates.length > 0) {
        params.push(cliente.id_usuario);
        await query(
          `UPDATE usuario SET ${updates.join(", ")} WHERE id_usuario = ?`,
          params
        );
      }

      if (endereco) {
        // Verificar se endereço existe, senão inserir
        const [existingEnd] = await query(
          "SELECT id_endereco FROM endereco WHERE id_usuario = ?",
          [cliente.id_usuario]
        );
        if (existingEnd) {
          await query(
            `UPDATE endereco SET 
              cep = ?, local = ?, numero_casa = ?, bairro = ?, cidade = ?, estado = ?, complemento = ?
             WHERE id_usuario = ?`,
            [
              endereco.cep,
              endereco.local,
              endereco.numero_casa,
              endereco.bairro,
              endereco.cidade,
              endereco.estado,
              endereco.complemento || null,
              cliente.id_usuario,
            ]
          );
        } else {
          await query(
            "INSERT INTO endereco (id_usuario, cep, local, numero_casa, bairro, cidade, estado, complemento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
              cliente.id_usuario,
              endereco.cep,
              endereco.local,
              endereco.numero_casa,
              endereco.bairro,
              endereco.cidade,
              endereco.estado,
              endereco.complemento || null,
            ]
          );
        }
        auditoriaDetalhes += ` endereco,`;
      }

      if (updates.length === 0 && !endereco) {
        return NextResponse.json(
          { error: "Nenhum dado fornecido para alteração" },
          { status: 400 }
        );
      }

      // Registrar na auditoria
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [decoded.id_usuario, "ALTERAR_CLIENTE", auditoriaDetalhes.slice(0, -1)]
      );

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Erro ao alterar dados:", error);
    return NextResponse.json(
      { error: "Erro ao processar alteração" },
      { status: 500 }
    );
  }
}
