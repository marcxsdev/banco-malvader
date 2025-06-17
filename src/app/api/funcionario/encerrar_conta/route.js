import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";
import jwt from "jsonwebtoken";

// Senha de administrador predefinida
const ADMIN_PASSWORD = "0000";

export async function POST(request) {
  try {
    const { numero, senha, otp, motivo } = await request.json();
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    // Validar campos obrigatórios
    if (!numero || !senha || !otp || !motivo) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [null, "ENCERRAMENTO_CONTA", "Falha: campos obrigatórios ausentes"]
      );
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar token JWT
    let id_usuario;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.tipo_usuario !== "FUNCIONARIO") {
        await query(
          "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
          [
            decoded.id_usuario,
            "ENCERAMENTO_CONTA",
            "Falha: usuário não é funcionário",
          ]
        );
        return NextResponse.json(
          { error: "Acesso negado: apenas funcionários podem encerrar contas" },
          { status: 403 }
        );
      }
      id_usuario = decoded.id_usuario;
    } catch (error) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [null, "ENCERRAMENTO_CONTA", "Falha: token inválido"]
      );
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Validar senha de administrador
    if (senha !== ADMIN_PASSWORD) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [
          id_usuario,
          "ENCERRAMENTO_CONTA",
          "Falha: senha de administrador incorreta",
        ]
      );
      return NextResponse.json(
        { error: "Senha de administrador incorreta" },
        { status: 401 }
      );
    }

    // Validar OTP
    const [usuario] = await query(
      "SELECT otp_ativo, otp_expiracao FROM usuario WHERE id_usuario = ?",
      [id_usuario]
    );
    if (
      !usuario ||
      usuario.otp_ativo !== otp ||
      new Date(usuario.otp_expiracao) < new Date()
    ) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [id_usuario, "ENCERRAMENTO_CONTA", "Falha: OTP inválido ou expirado"]
      );
      return NextResponse.json(
        { error: "OTP inválido ou expirado" },
        { status: 401 }
      );
    }

    // Validar motivo
    const motivosValidos = ["INADIMPLENCIA", "SOLICITACAO_CLIENTE", "OUTROS"];
    if (!motivosValidos.includes(motivo)) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [id_usuario, "ENCERRAMENTO_CONTA", `Falha: motivo inválido (${motivo})`]
      );
      return NextResponse.json({ error: "Motivo inválido" }, { status: 400 });
    }

    // Verificar conta
    const [conta] = await query(
      "SELECT saldo, status FROM conta WHERE numero_conta = ?",
      [numero]
    );
    if (!conta) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [
          id_usuario,
          "ENCERRAMENTO_CONTA",
          `Falha: conta ${numero} não encontrada`,
        ]
      );
      return NextResponse.json(
        { error: "Conta não encontrada" },
        { status: 404 }
      );
    }
    if (conta.status !== "ATIVA") {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [
          id_usuario,
          "ENCERRAMENTO_CONTA",
          `Falha: conta ${numero} não está ativa`,
        ]
      );
      return NextResponse.json(
        { error: "Conta não está ativa" },
        { status: 400 }
      );
    }
    if (conta.saldo < 0) {
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [
          id_usuario,
          "ENCERRAMENTO_CONTA",
          `Falha: saldo negativo na conta ${numero}`,
        ]
      );
      return NextResponse.json(
        { error: "Não é possível encerrar: saldo negativo" },
        { status: 400 }
      );
    }

    // Encerrar conta e registrar na auditoria
    await query("START TRANSACTION");
    try {
      await query(
        "UPDATE conta SET status = 'ENCERRADA' WHERE numero_conta = ?",
        [numero]
      );
      await query(
        "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
        [
          id_usuario,
          "ENCERRAMENTO_CONTA",
          JSON.stringify({ numero_conta: numero, motivo }),
        ]
      );
      await query("COMMIT");
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }

    return NextResponse.json(
      { success: true, message: "Conta encerrada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao encerrar conta:", error);
    await query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
      [null, "ENCERRAMENTO_CONTA", `Erro no servidor: ${error.message}`]
    );
    return NextResponse.json(
      { error: "Erro ao conectar ao servidor" },
      { status: 500 }
    );
  }
}
