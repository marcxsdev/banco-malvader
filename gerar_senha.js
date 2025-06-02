const bcrypt = require("bcryptjs");

async function gerarSenha() {
  const senha = "Teste123!"; // Senha de teste
  const hash = await bcrypt.hash(senha, 10);
  console.log("Senha hash:", hash);
}

gerarSenha();
