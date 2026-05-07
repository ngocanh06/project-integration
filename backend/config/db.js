import sql from "mssql";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const humanPool = new sql.ConnectionPool({
  user: process.env.HUMAN_DB_USER,
  password: process.env.HUMAN_DB_PASSWORD,
  server: process.env.HUMAN_DB_SERVER,
  database: process.env.HUMAN_DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});

export const payrollPool = mysql.createPool({
  host: process.env.PAYROLL_DB_HOST,
  user: process.env.PAYROLL_DB_USER,
  password: process.env.PAYROLL_DB_PASSWORD,
  database: process.env.PAYROLL_DB_NAME,
});

export const connectDB = async () => {
  try {
    await humanPool.connect();
    console.log("SQL Server HUMAN_2025 connected");

    const conn = await payrollPool.getConnection();
    console.log("MySQL payroll_2026 connected");
    conn.release();
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};