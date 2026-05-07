import { humanPool, payrollPool } from "../config/db.js";

export const getDashboardData = async (req, res) => {
  try {
    const employeesResult = await humanPool.request().query(`
      SELECT *
      FROM dbo.Employees
    `);

    const departmentsResult = await humanPool.request().query(`
      SELECT *
      FROM dbo.Departments
    `);

    const [payrolls] = await payrollPool.query(`
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

    const [attendance] = await payrollPool.query(`
      SELECT *
      FROM attendance
    `);

    const employees = employeesResult.recordset;
    const departments = departmentsResult.recordset;

    const totalEmployees = employees.length;

    const workingEmployees = employees.filter(
      (item) => item.Status === "Đang làm việc"
    ).length;

    const leaveEmployees = employees.filter(
      (item) => item.Status === "Nghỉ phép"
    ).length;

    const totalSalary = payrolls.reduce(
      (sum, item) => sum + Number(item.NetSalary || 0),
      0
    );

    const totalBonus = payrolls.reduce(
      (sum, item) => sum + Number(item.Bonus || 0),
      0
    );

    const totalDeductions = payrolls.reduce(
      (sum, item) => sum + Number(item.Deductions || 0),
      0
    );

    const employeesByDepartment = departments.map((department) => {
      const count = employees.filter(
        (employee) => employee.DepartmentID === department.DepartmentID
      ).length;

      return {
        departmentId: department.DepartmentID,
        departmentName: department.DepartmentName,
        count,
      };
    });

    res.json({
      summary: {
        totalEmployees,
        workingEmployees,
        leaveEmployees,
        totalSalary,
        totalBonus,
        totalDeductions,
        totalAttendance: attendance.length,
      },
      employees,
      departments,
      payrolls,
      attendance,
      employeesByDepartment,
      recentActivities: [
        "Đã kết nối SQL Server HUMAN_2025",
        "Đã kết nối MySQL payroll_2026",
        "Đã đồng bộ dữ liệu nhân viên",
        "Đã đồng bộ dữ liệu lương",
      ],
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot load dashboard data",
      error: error.message,
    });
  }
};