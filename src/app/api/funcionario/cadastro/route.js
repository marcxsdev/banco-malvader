import { NextResponse } from "next/server";
import usuarioDAO from "@/lib/dao/usuarioDAO";
import { query } from "@/lib/util/db";

export async function POST(request) {
  try {
    const { nome, cpf, data_nascimento, telefone, senha, endereco } =
      await request.json();

    const usuarioExistente = await usuarioDAO.findByCpf(cpf);
    if (usuarioExistente) {
      return NextResponse.json({ error: "CPF já cadastrado" }, { status: 400 });
    }

    const id_usuario = await usuarioDAO.create({
      nome,
      cpf,
      data_nascimento,
      telefone,
      tipo_usuario: "CLIENTE",
      senha,
      endereco,
    });

    await query(
      "INSERT INTO cliente (id_usuario, score_credito) VALUES (?, 0)",
      [id_usuario]
    );

    await query(
      "INSERT INTO auditoria (id_usuario, acao, detalhes, data_hora) VALUES (?, ?, ?, NOW())",
      [id_usuario, "CADASTRO", "Cliente cadastrado com sucesso"]
    );

    return NextResponse.json({ success: true, id_usuario });
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar cliente" },
      { status: 500 }
    );
  }
}
