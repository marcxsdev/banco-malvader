const pool = require("./src/lib/util/db.js");

async function testConnection() {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    console.log("Conexão bem-sucedida! Resultado:", rows[0].result);
  } catch (error) {
    console.error("Erro na conexão:", error);
  }
}

testConnection();
