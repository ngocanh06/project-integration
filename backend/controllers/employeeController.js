import { humanPool } from "../config/db.js";

export const getEmployees = async (req, res) => {
  try {
    const result = await humanPool.request().query(`
      SELECT *
      FROM dbo.Employees
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};