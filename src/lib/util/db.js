const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "lumiere",
  database: process.env.DB_NAME || "banco_malvader",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function query(sql, params) {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error("Erro na query:", error);
    throw error;
  }
}

module.exports = { pool, query };
