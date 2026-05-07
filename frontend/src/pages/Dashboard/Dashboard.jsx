import { useEffect, useState } from "react";
import { getDashboardData } from "../../api/dashboardApi";
import "./Dashboard.scss";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getDashboardData();
        setData(result);
      } catch (error) {
        console.error("Dashboard API error:", error);
      }
    };

    fetchDashboard();
  }, []);

  if (!data) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const summary = data.summary || {};
  const departments = data.departmentChart || [];
  const activities = data.recentActivities || [];

  const maxValue = 5;

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"></div>
          <span>HR System</span>
        </div>

        <nav className="menu">
          <a className="active" href="#">
            <span>⌂</span> Dashboard
          </a>
          <a href="#">
            <span>▦</span> Department <b>›</b>
          </a>
          <a href="#">
            <span>♙</span> Employee
          </a>
          <a href="#">
            <span>◷</span> Attendance
          </a>
          <a href="#">
            <span>$</span> Salary
          </a>
          <a href="#">
            <span>▤</span> Report <em>14</em>
          </a>

          <p>Others</p>

          <a href="#">
            <span>?</span> Guide <b>›</b>
          </a>
          <a href="#">
            <span>✉</span> Messenger <i>New!</i>
          </a>
          <a href="#">
            <span>⚙</span> Settings
          </a>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="title-box">
            <span className="hamburger">☰</span>
            <div>
              <h1>Dashboard</h1>
              <p>HR and Payroll Integration Overview</p>
            </div>
          </div>

          <div className="top-right">
            <div className="search-box">
              <input placeholder="Search here..." />
              <span>⌕</span>
            </div>

            <div className="notify">🔔<b className="blue-dot">23</b></div>
            <div className="notify">↻<b className="green-dot">68</b></div>
            <div className="notify">◔<b className="gray-dot">14</b></div>

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
            <span>+12%</span>
          </div>

          <div className="small-card">
            <p>Active Employees</p>
            <h2>{summary.activeEmployees || 0}</h2>
            <span>+8%</span>
          </div>

          <div className="small-card">
            <p>Employees on Leave</p>
            <h2>{summary.leaveEmployees || 0}</h2>
            <span>+3%</span>
          </div>

          <div className="income-card">
            <div className="income-blue">
              <div className="circle">+5%</div>
              <div>
                <p>Total Dividend</p>
                <h2>${Number(summary.totalDividend || 0).toLocaleString()}</h2>
              </div>
            </div>

            <div className="income-green">
              <div>
                <p>Total Payroll</p>
                <h2>${Number(summary.totalRevenue || 0).toLocaleString()}</h2>
              </div>
              <div className="circle">+5%</div>
            </div>
          </div>
        </section>

        <section className="middle">
          <div className="panel chart-panel">
            <div className="panel-header">
              <h3>Employees by Department</h3>
              <button>This Month ▼</button>
            </div>

            <div className="chart-box">
              <div className="y-axis">
                <span>5</span>
                <span>4</span>
                <span>3</span>
                <span>2</span>
                <span>1</span>
              </div>

              <div className="bar-chart">
                {departments.map((item, index) => {
                  const value = item.total || 0;
                  const height = Math.max((value / maxValue) * 160, 34);

                  return (
                    <div className="bar-item" key={index}>
                      <div className="bar-wrapper">
                        <div
                          className="bar"
                          style={{ height: `${height}px` }}
                        >
                          <span>{value}</span>
                        </div>
                      </div>

                      <p>{item.DepartmentName}</p>
                    </div>
                  );
                })}
              </div>
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
          <div className="panel dividend-panel">
            <div className="panel-header">
              <h3>Dividend Summary</h3>
              <div className="tabs">
                <b>Monthly</b>
                <span>Weekly</span>
                <span>Daily</span>
              </div>
            </div>

            <div className="dividend-card">
              <div>
                <label>#HUMAN_2025</label>
                <h2>${Number(summary.totalDividend || 0).toLocaleString()}</h2>
                <p>Total dividend amount loaded from SQL Server database.</p>
              </div>

              <div className="donut">
                <div>
                  <strong>+5%</strong>
                  <small>Q2 2026</small>
                </div>
              </div>
            </div>

            <div className="dividend-card second">
              <div>
                <label>#PAYROLL_2026</label>
                <h2>${Number(summary.totalRevenue || 0).toLocaleString()}</h2>
                <p>Payroll revenue synchronized from MySQL database.</p>
              </div>

              <div className="mini-wave">
                <svg viewBox="0 0 120 50">
                  <path d="M5 35 C20 5, 30 40, 45 20 S70 10, 80 28 S100 40, 115 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="panel trend-panel">
            <div className="trend-header">
              <div className="tabs">
                <b>Monthly</b>
                <span>Weekly</span>
                <span>Daily</span>
              </div>
              <button>Download CSV</button>
            </div>

            <div className="trend-title">
              <h2>${Number(summary.totalRevenue || 0).toLocaleString()}</h2>
              <span className="triangle"></span>
              <p>+9% from last month</p>
            </div>

            <div className="area-chart">
              <svg viewBox="0 0 600 220" preserveAspectRatio="none">
                <path
                  d="M0 120 L40 170 L80 150 L120 185 L160 90 L200 120 L240 75 L280 155 L320 70 L360 90 L400 135 L440 75 L480 110 L520 60 L560 95 L600 70 L600 220 L0 220 Z"
                  fill="#0d86ff"
                />
              </svg>
            </div>

            <div className="months">
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <b>Jan</b>
              <span>Feb</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;