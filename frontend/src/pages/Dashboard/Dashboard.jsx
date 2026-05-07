import { useEffect, useState } from "react";
import { getDashboardData } from "../../api/dashboardApi";
import "./Dashboard.scss";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const data = await getDashboardData();
      setDashboardData(data);
    };

    fetchDashboard();
  }, []);

  if (!dashboardData) {
    return <h2 style={{ padding: "30px" }}>Loading dashboard...</h2>;
  }

  const {
    summary,
    employees,
    payrolls,
    employeesByDepartment,
    recentActivities,
  } = dashboardData;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>HR System</h2>

        <ul>
          <li className="active">Dashboard</li>
          <li>Department</li>
          <li>Employee</li>
          <li>Attendance</li>
          <li>Salary</li>
          <li>Report</li>
          <li>Settings</li>
        </ul>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Dashboard</h1>
          <input type="text" placeholder="Search here..." />
        </header>

        <section className="stats">
          <div className="stat-card">
            <p>Tổng nhân viên</p>
            <h2>{summary.totalEmployees}</h2>
            <span>SQL Server</span>
          </div>

          <div className="stat-card">
            <p>Đang làm việc</p>
            <h2>{summary.workingEmployees}</h2>
            <span>HUMAN_2025</span>
          </div>

          <div className="stat-card">
            <p>Nghỉ phép</p>
            <h2>{summary.leaveEmployees}</h2>
            <span>HUMAN_2025</span>
          </div>

          <div className="income-card blue">
            <p>Tổng lương thực nhận</p>
            <h2>{Number(summary.totalSalary).toLocaleString()} đ</h2>
            <span>MySQL payroll_2026</span>
          </div>

          <div className="income-card green">
            <p>Tổng thưởng</p>
            <h2>{Number(summary.totalBonus).toLocaleString()} đ</h2>
            <span>MySQL payroll_2026</span>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel chart-panel">
            <div className="panel-header">
              <h3>Nhân viên theo phòng ban</h3>
              <button>This Month</button>
            </div>

            <div className="bar-chart">
              {employeesByDepartment.map((item) => (
                <div className="bar-item" key={item.departmentId}>
                  <div
                    style={{
                      height: `${Math.max(item.count * 35, 25)}px`,
                    }}
                  ></div>
                  <span>{item.departmentName}</span>
                  <b>{item.count}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3>Hoạt động gần đây</h3>

            <div className="activity">
              {recentActivities.map((activity, index) => (
                <p key={index}>{activity}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="employee-section">
            <h3>Danh sách nhân viên</h3>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.EmployeeID}>
                    <td>{employee.EmployeeID}</td>
                    <td>{employee.FullName}</td>
                    <td>{employee.Email}</td>
                    <td>{employee.PhoneNumber}</td>
                    <td>{employee.Status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="employee-section">
            <h3>Bảng lương tích hợp</h3>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nhân viên</th>
                  <th>Lương</th>
                  <th>Thưởng</th>
                  <th>Thực nhận</th>
                </tr>
              </thead>

              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll.SalaryID}>
                    <td>{payroll.SalaryID}</td>
                    <td>{payroll.FullName}</td>
                    <td>{Number(payroll.BaseSalary).toLocaleString()}</td>
                    <td>{Number(payroll.Bonus).toLocaleString()}</td>
                    <td>{Number(payroll.NetSalary).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;