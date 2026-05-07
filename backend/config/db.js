import sql from "mssql";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const sqlConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export let humanPool;

export let payrollPool;

export const connectDB = async () => {
  try {
    humanPool = await sql.connect(sqlConfig);

    console.log("SQL Server HUMAN_2025 connected");

    payrollPool = await mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    console.log("MySQL payroll_2026 connected");
  } catch (error) {
    console.log("Database connection failed:", error.message);
  }
};