import sql from "mssql";
import mysql from "mysql2/promise";

const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

export const getDashboardData = async (req, res) => {
  try {
    // ================= SQL SERVER =================

    const totalEmployeesQuery = `
      SELECT COUNT(*) AS totalEmployees
      FROM Employees
    `;

    const activeEmployeesQuery = `
      SELECT COUNT(*) AS activeEmployees
      FROM Employees
      WHERE Status = N'Đang làm việc'
    `;

    const leaveEmployeesQuery = `
      SELECT COUNT(*) AS leaveEmployees
      FROM Employees
      WHERE Status = N'Nghỉ phép'
    `;

    const departmentChartQuery = `
      SELECT
        d.DepartmentName,
        COUNT(e.EmployeeID) AS total
      FROM Departments d
      LEFT JOIN Employees e
        ON d.DepartmentID = e.DepartmentID
      GROUP BY d.DepartmentName
    `;

    const recentActivities = [
      "Đã kết nối SQL Server HUMAN_2025",
      "Đã kết nối MySQL payroll_2026",
      "Đã đồng bộ dữ liệu nhân viên",
      "Đã đồng bộ dữ liệu lương",
    ];

    const totalEmployeesResult = await sql.query(totalEmployeesQuery);

    const activeEmployeesResult = await sql.query(activeEmployeesQuery);

    const leaveEmployeesResult = await sql.query(leaveEmployeesQuery);

    const departmentChartResult = await sql.query(departmentChartQuery);

    // ================= MYSQL =================

    const [salaryRows] = await mysqlPool.query(`
      SELECT
        SUM(NetSalary) AS totalRevenue,
        SUM(Bonus) AS totalDividend
      FROM salaries
    `);

    // ================= RESPONSE =================

    res.json({
      summary: {
        totalEmployees:
          totalEmployeesResult.recordset[0].totalEmployees || 0,

        activeEmployees:
          activeEmployeesResult.recordset[0].activeEmployees || 0,

        leaveEmployees:
          leaveEmployeesResult.recordset[0].leaveEmployees || 0,

        totalRevenue:
          salaryRows[0].totalRevenue || 0,

        totalDividend:
          salaryRows[0].totalDividend || 0,
      },

      departmentChart: departmentChartResult.recordset,

      recentActivities,
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot load dashboard data",
      error: error.message,
    });
  }
};