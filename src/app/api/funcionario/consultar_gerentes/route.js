import { NextResponse } from "next/server";
import { query } from "@/lib/util/db";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
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
      const [user] = await query(
        `SELECT f.cargo 
         FROM funcionario f 
         JOIN usuario u ON f.id_usuario = u.id_usuario 
         WHERE u.id_usuario = ?`,
        [decoded.id_usuario]
      );
      if (!user || user.cargo !== "GERENTE") {
        return NextResponse.json(
          { error: "Acesso negado: apenas gerentes" },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const gerentes = await query(
      `SELECT f.id_funcionario, u.nome 
       FROM funcionario f 
       JOIN usuario u ON f.id_usuario = u.id_usuario 
       WHERE f.cargo = 'GERENTE'`
    );

    return NextResponse.json({ success: true, gerentes });
  } catch (error) {
    console.error("Erro ao consultar gerentes:", error);
    return NextResponse.json(
      { error: "Erro ao consultar gerentes" },
      { status: 500 }
    );
  }
}
