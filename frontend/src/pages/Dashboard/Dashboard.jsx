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
  const recentActivities = data.recentActivities || [];

  const maxValue = Math.max(...departments.map((d) => d.total || 0), 1);

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
            <h1>Dashboard</h1>
          </div>

          <div className="top-right">
            <div className="search-box">
              <input placeholder="Search here..." />
              <span>⌕</span>
            </div>

            <div className="notify">🔔<b className="blue-dot">23</b></div>
            <div className="notify">◷<b className="green-dot">68</b></div>
            <div className="notify">✉<b className="gray-dot">14</b></div>

            <div className="profile">
              <div>
                <strong>Designluch</strong>
                <small>Super Admin</small>
              </div>
              <div className="avatar">🐻</div>
            </div>
          </div>
        </header>

        <section className="summary">
          <div className="small-card">
            <p>Tổng nhân viên</p>
            <h2>{summary.totalEmployees || 0}</h2>
            <span>SQL Server</span>
          </div>

          <div className="small-card">
            <p>Đi làm hôm nay</p>
            <h2>{summary.activeEmployees || 0}</h2>
            <span>HUMAN_2025</span>
          </div>

          <div className="small-card">
            <p>Nghỉ phép</p>
            <h2>{summary.leaveEmployees || 0}</h2>
            <span>HUMAN_2025</span>
          </div>

          <div className="income-card">
            <div className="income-blue">
              <div className="circle">+5%</div>
              <div>
                <p>Cổ tức Q2 2026</p>
                <h2>${Number(summary.totalDividend || 0).toLocaleString()}</h2>
              </div>
            </div>

            <div className="income-green">
              <div>
                <p>Tổng doanh thu</p>
                <h2>${Number(summary.totalRevenue || 0).toLocaleString()}</h2>
              </div>
              <div className="circle">+5%</div>
            </div>
          </div>
        </section>

        <section className="middle">
          <div className="panel chart-panel">
            <div className="panel-header">
              <h3>Nhân viên theo phòng ban</h3>
              <button>This Month⌄</button>
            </div>

            <div className="chart-area">
              <div className="y-axis">
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
              </div>

              <div className="bar-chart">
                {departments.map((item, index) => (
                  <div className="bar-item" key={index}>
                    <div
                      className="bar"
                      style={{
                        height: `${Math.max(
                          ((item.total || 0) / maxValue) * 175,
                          25
                        )}px`,
                      }}
                    ></div>
                    <span>{item.DepartmentName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel recent-panel">
            <h3>Hoạt động gần đây</h3>

            <div className="activity-list">
              {recentActivities.map((item, index) => (
                <div className="activity-item" key={index}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bottom">
          <div className="panel coupon-panel">
            <div className="panel-header">
              <h3>Dữ liệu cổ tức</h3>
              <div className="tabs">
                <b>Monthly</b>
                <span>Weekly</span>
                <span>Daily</span>
              </div>
            </div>

            <div className="coupon-row">
              <div>
                <label>#SQL-HR</label>
                <h4>Dividend data loaded from HUMAN_2025</h4>
                <p>✓ Total dividend: ${Number(summary.totalDividend || 0).toLocaleString()}</p>
              </div>

              <svg viewBox="0 0 120 60" className="spark red">
                <path d="M5 30 C15 55, 25 5, 35 35 S55 50, 60 20 S75 5, 80 35 S100 30, 110 55" />
              </svg>

              <div className="percent">
                <b>-2%</b>
                <small>User Insight</small>
              </div>
            </div>

            <div className="coupon-row">
              <div>
                <label>#MYSQL-PAYROLL</label>
                <h4>Salary data synchronized from payroll_2026</h4>
                <p>✓ Revenue: ${Number(summary.totalRevenue || 0).toLocaleString()}</p>
              </div>

              <svg viewBox="0 0 120 60" className="spark green-line">
                <path d="M5 45 C15 15, 25 35, 35 20 S50 5, 55 30 S70 60, 80 25 S100 40, 110 18" />
              </svg>

              <div className="percent">
                <b>+9%</b>
                <small>Payroll Insight</small>
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
              <h2>{Number(summary.totalRevenue || 0).toLocaleString()}</h2>
              <span className="triangle"></span>
              <p>+9% from last month</p>
            </div>

            <div className="area-chart">
              <svg viewBox="0 0 600 230" preserveAspectRatio="none">
                <path
                  d="M0 90 L30 160 L60 180 L90 165 L120 200 L150 110 L180 160 L210 80 L240 175 L270 120 L300 200 L330 70 L360 75 L390 150 L420 95 L450 120 L480 85 L510 110 L540 70 L570 125 L600 80 L600 230 L0 230 Z"
                  fill="#0d86ff"
                />
                <path
                  d="M330 0 L330 230"
                  stroke="#0b63ce"
                  strokeDasharray="5 5"
                  strokeWidth="2"
                  opacity=".6"
                />
                <circle cx="360" cy="75" r="8" fill="#0d86ff" stroke="white" strokeWidth="4" />
              </svg>
            </div>

            <div className="months">
              <span>August</span>
              <span>September</span>
              <span>October</span>
              <span>November</span>
              <span>December</span>
              <b>January</b>
              <span>February</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;