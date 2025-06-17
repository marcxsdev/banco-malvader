import { query } from "../util/db";
import bcrypt from "bcryptjs";

class UsuarioDAO {
  async findByCpf(cpf) {
    const users = await query("SELECT * FROM usuario WHERE cpf = ?", [
      cpf.replace(/\D/g, ""),
    ]);
    return users[0] || null;
  }

  async create({
    nome,
    cpf,
    data_nascimento,
    telefone,
    tipo_usuario,
    senha,
    endereco,
  }) {
    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await query(
      "INSERT INTO usuario (nome, cpf, data_nascimento, telefone, tipo_usuario, senha_hash, endereco) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        nome,
        cpf.replace(/\D/g, ""),
        data_nascimento,
        telefone,
        tipo_usuario,
        senhaHash,
        endereco,
      ]
    );
    return result.insertId;
  }

  async generateOtp(id_usuario) {
    const [result] = await query("CALL gerar_otp(?)", [id_usuario]);
    return result[0].otp;
  }
}

export default new UsuarioDAO();
