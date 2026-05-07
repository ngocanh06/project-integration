import { payrollPool } from "../config/db.js";

export const getPayrolls = async (req, res) => {
  try {
    const [rows] = await payrollPool.query(`
      SELECT
        s.SalaryID,
        s.EmployeeID,
        e.FullName,
        e.DepartmentID,
        s.SalaryMonth,
        s.BaseSalary,
        s.Bonus,
        s.Deductions,
        s.NetSalary
      FROM salaries s
      LEFT JOIN employees_payroll e
        ON s.EmployeeID = e.EmployeeID
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};