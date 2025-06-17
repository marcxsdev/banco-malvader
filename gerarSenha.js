const bcrypt = require("bcryptjs");

async function gerarSenha(senha) {
  const hash = await bcrypt.hash(senha, 10);
  console.log(hash);
}

gerarSenha("Teste123!");
