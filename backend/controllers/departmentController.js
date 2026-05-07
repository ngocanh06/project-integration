import { humanPool } from "../config/db.js";

export const getDepartments = async (req, res) => {
  try {
    const result = await humanPool.request().query(`
      SELECT *
      FROM dbo.Departments
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};