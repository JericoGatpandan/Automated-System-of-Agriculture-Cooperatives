import mysql from "mysql2";

import {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  PORT,
} from "./env.config.js";

export const connection = mysql.createConnection({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
});

connection.connect((err) => {
  if (err) return console.error(err.message);

  console.log("Connected to the MySQL server.");
});
