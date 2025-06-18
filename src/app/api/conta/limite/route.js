import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getLimiteEProjecao, logAuditoria } from "@/lib/dao/transacaoDAO";

export async function GET(request) {
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
    if (decoded.tipo_usuario !== "CLIENTE") {
      return NextResponse.json(
        { error: "Acesso negado: apenas clientes" },
        { status: 403 }
      );
    }

    const id_usuario = decoded.id_usuario;

    // Obter parâmetros da query (numero_conta)
    const url = new URL(request.url);
    const numero_conta = url.searchParams.get("numero_conta");
    if (!numero_conta) {
      await logAuditoria(
        id_usuario,
        "CONSULTAR_LIMITE",
        "Falha: número da conta não fornecido"
      );
      return NextResponse.json(
        { error: "Número da conta é obrigatório" },
        { status: 400 }
      );
    }

    // Consultar limite e projeção
    const resultado = await getLimiteEProjecao(id_usuario, numero_conta);
    if (!resultado) {
      await logAuditoria(
        id_usuario,
        "CONSULTAR_LIMITE",
        `Falha: conta ${numero_conta} inválida ou não pertence ao cliente`
      );
      return NextResponse.json(
        { error: "Conta inválida ou não pertence ao cliente" },
        { status: 404 }
      );
    }

    // Registrar na auditoria
    await logAuditoria(
      id_usuario,
      "CONSULTAR_LIMITE",
      `Sucesso: consulta de limite para conta ${numero_conta}`
    );

    return NextResponse.json({
      success: true,
      limite_atual: resultado.limite,
      projecao: resultado.projecao,
      periodo_projecao: resultado.periodo_projecao,
    });
  } catch (error) {
    console.error("Erro ao consultar limite:", error);
    await logAuditoria(null, "CONSULTAR_LIMITE", `Erro: ${error.message}`);
    return NextResponse.json(
      { error: "Erro ao consultar limite" },
      { status: 500 }
    );
  }
}
