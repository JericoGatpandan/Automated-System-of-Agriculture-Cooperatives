import mysql from "mysql2/promise";

import { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } from "./env.config.js";

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

async function testConnection() {
  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    connection.release();
    console.log("Connected to the MySQL server.");
  } catch (err) {
    console.error("Error connecting to the MySQL server:", err.message);
  }
}

async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export { getPool, query, testConnection };
