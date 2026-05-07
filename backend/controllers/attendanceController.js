import { payrollPool } from "../config/db.js";

export const getAttendance = async (req, res) => {
  try {
    const [rows] = await payrollPool.query(`
      SELECT *
      FROM attendance
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};