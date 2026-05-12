import { useEffect, useMemo, useState } from "react";
import { getDashboardData } from "../../api/dashboardApi";
import "./Dashboard.scss";

function Dashboard() {
  const [data, setData] = useState(null);
  const [timeFilter, setTimeFilter] = useState("This Month");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [positionFilter, setPositionFilter] = useState("All Positions");
  const [metric, setMetric] = useState("EmployeeCount");
  const [searchText, setSearchText] = useState("");

  const loadDashboard = async () => {
    try {
      const result = await getDashboardData();
      setData(result);
    } catch (error) {
      console.error("Dashboard API error:", error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = data?.summary || {};
  const departments = data?.departmentOverview || [];
  const positions = data?.positions || [];
  const employees = data?.employees || [];
  const activities = data?.recentActivities || [];

  const filteredEmployees = useMemo(() => {
    let list = employees;

    if (departmentFilter !== "All Departments") {
      list = list.filter((e) => e.DepartmentName === departmentFilter);
    }

    if (positionFilter !== "All Positions") {
      list = list.filter((e) => e.PositionName === positionFilter);
    }

    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();

      list = list.filter(
        (e) =>
          e.FullName.toLowerCase().includes(keyword) ||
          e.DepartmentName.toLowerCase().includes(keyword) ||
          e.PositionName.toLowerCase().includes(keyword)
      );
    }

    return list;
  }, [employees, departmentFilter, positionFilter, searchText]);

  const filteredDepartments = useMemo(() => {
    return departments
      .filter((department) => {
        if (departmentFilter === "All Departments") return true;
        return department.DepartmentName === departmentFilter;
      })
      .map((department) => {
        const deptEmployees = filteredEmployees.filter(
          (e) => e.DepartmentID === department.DepartmentID
        );

        return {
          ...department,
          EmployeeCount: deptEmployees.length,
          TotalSalary: deptEmployees.reduce((sum, e) => sum + Number(e.NetSalary || 0), 0),
          TotalBonus: deptEmployees.reduce((sum, e) => sum + Number(e.Bonus || 0), 0),
          TotalDividend: deptEmployees.reduce((sum, e) => sum + Number(e.DividendAmount || 0), 0)
        };
      });
  }, [departments, filteredEmployees, departmentFilter]);

  if (!data) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const getMetricValue = (item) => Number(item[metric] || 0);
  const maxValue = Math.max(...filteredDepartments.map(getMetricValue), 1);

  const formatMoney = (value) => `$${Number(value || 0).toLocaleString()}`;

  const exportCSV = () => {
    const rows = [
      ["Department", "Employees", "Salary", "Bonus", "Dividend"],
      ...filteredDepartments.map((item) => [
        item.DepartmentName,
        item.EmployeeCount,
        item.TotalSalary,
        item.TotalBonus,
        item.TotalDividend
      ])
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard_department_report.csv";
    link.click();
  };

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"></div>
          <span>HR System</span>
        </div>

        <nav className="menu">
          <a className="active" href="#"><span>⌂</span>Dashboard</a>
          <a href="#"><span>▦</span>Department <b>›</b></a>
          <a href="#"><span>♙</span>Employee</a>
          <a href="#"><span>◷</span>Attendance</a>
          <a href="#"><span>$</span>Salary</a>
          <a href="#"><span>▤</span>Report <em>14</em></a>

          <p>Others</p>

          <a href="#"><span>?</span>Guide <b>›</b></a>
          <a href="#"><span>✉</span>Messenger <i>New!</i></a>
          <a href="#"><span>⚙</span>Settings</a>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="title-box">
            <span className="hamburger">☰</span>
            <div>
              <h1>Dashboard</h1>
              <p>HR, payroll, attendance, and dividend integration overview</p>
            </div>
          </div>

          <div className="top-right">
            <div className="search-box">
              <input
                placeholder="Search employee, department..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <span>⌕</span>
            </div>

            <button className="refresh-btn" onClick={loadDashboard}>
              Refresh
            </button>

            <div className="profile">
              <div>
                <strong>Designluch</strong>
                <small>Super Admin</small>
              </div>
              <div className="avatar">🙂</div>
            </div>
          </div>
        </header>

        <section className="summary">
          <div className="small-card">
            <p>Total Employees</p>
            <h2>{summary.totalEmployees || 0}</h2>
            <span>HUMAN_2025</span>
          </div>

          <div className="small-card">
            <p>Active Employees</p>
            <h2>{summary.activeEmployees || 0}</h2>
            <span>SQL Server</span>
          </div>

          <div className="small-card">
            <p>On Leave</p>
            <h2>{summary.leaveEmployees || 0}</h2>
            <span>Attendance</span>
          </div>

          <div className="income-card">
            <div className="income-blue">
              <div>
                <p>Total Dividend</p>
                <h2>{formatMoney(summary.totalDividend)}</h2>
              </div>
              <div className="circle">+5%</div>
            </div>

            <div className="income-green">
              <div>
                <p>Total Payroll</p>
                <h2>{formatMoney(summary.totalRevenue)}</h2>
              </div>
              <div className="circle">+9%</div>
            </div>
          </div>
        </section>

        <section className="kpi-grid">
          <div className="kpi-card">
            <p>Total Bonus</p>
            <h3>{formatMoney(summary.totalBonus)}</h3>
          </div>

          <div className="kpi-card">
            <p>Total Deductions</p>
            <h3>{formatMoney(summary.totalDeductions)}</h3>
          </div>

          <div className="kpi-card">
            <p>Work Days</p>
            <h3>{summary.totalWorkDays || 0}</h3>
          </div>

          <div className="kpi-card">
            <p>Absent Days</p>
            <h3>{summary.totalAbsentDays || 0}</h3>
          </div>
        </section>

        <section className="middle">
          <div className="panel chart-panel">
            <div className="chart-header">
              <div>
                <h3>Department Integration Overview</h3>
                <p>Combined from employees, positions, salary, attendance, and dividends</p>
              </div>

              <div className="chart-filters">
                <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Quarter</option>
                  <option>2026</option>
                </select>

                <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                  <option>All Departments</option>
                  {departments.map((d) => (
                    <option key={d.DepartmentID}>{d.DepartmentName}</option>
                  ))}
                </select>

                <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}>
                  <option>All Positions</option>
                  {positions.map((p) => (
                    <option key={p.PositionID}>{p.PositionName}</option>
                  ))}
                </select>

                <select value={metric} onChange={(e) => setMetric(e.target.value)}>
                  <option value="EmployeeCount">Employees</option>
                  <option value="TotalSalary">Salary</option>
                  <option value="TotalBonus">Bonus</option>
                  <option value="TotalDividend">Dividend</option>
                </select>
              </div>
            </div>

            <div className="department-card-grid">
              {filteredDepartments.map((item) => {
                const value = getMetricValue(item);
                const percent = Math.max((value / maxValue) * 100, 8);

                return (
                  <div className="department-card" key={item.DepartmentID}>
                    <div className="dept-top">
                      <h4>{item.DepartmentName}</h4>
                      <span>{item.EmployeeCount} NV</span>
                    </div>

                    <div className="dept-bar">
                      <div style={{ width: `${percent}%` }}></div>
                    </div>

                    <div className="dept-info">
                      <p>Salary: <b>{formatMoney(item.TotalSalary)}</b></p>
                      <p>Bonus: <b>{formatMoney(item.TotalBonus)}</b></p>
                      <p>Dividend: <b>{formatMoney(item.TotalDividend)}</b></p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="filter-note">
              Filter: {timeFilter} / {departmentFilter} / {positionFilter} / {metric}
            </div>
          </div>

          <div className="panel recent-panel">
            <h3>Recent Activities</h3>

            <div className="activity-list">
              {activities.map((item, index) => (
                <div className="activity-item" key={index}>
                  <span></span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bottom">
          <div className="panel table-panel">
            <div className="panel-header">
              <h3>Employee Integration List</h3>
              <button onClick={exportCSV}>Download CSV</button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Salary</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.EmployeeID}>
                    <td>{employee.FullName}</td>
                    <td>{employee.DepartmentName}</td>
                    <td>{employee.PositionName}</td>
                    <td>
                      <span className="status-pill">{employee.Status}</span>
                    </td>
                    <td>{formatMoney(employee.NetSalary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel trend-panel">
            <div className="trend-header">
              <h3>Payroll Trend</h3>
              <button onClick={exportCSV}>Download CSV</button>
            </div>

            <div className="trend-title">
              <h2>{formatMoney(summary.totalRevenue)}</h2>
              <p>Payroll synchronized from MySQL payroll_2026</p>
            </div>

            <div className="area-chart">
              <svg viewBox="0 0 600 220" preserveAspectRatio="none">
                <path
                  d="M0 120 L40 170 L80 150 L120 185 L160 90 L200 120 L240 75 L280 155 L320 70 L360 90 L400 135 L440 75 L480 110 L520 60 L560 95 L600 70 L600 220 L0 220 Z"
                  fill="#0d86ff"
                />
              </svg>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;