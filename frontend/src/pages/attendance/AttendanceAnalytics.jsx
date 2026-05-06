import { useState, useEffect, useMemo } from 'react';
import { statusClass } from '../../utils/helpers';
import { fetchAttendanceSummary } from '../../services/attendanceService';

// ─── Màu sắc theo ngày trong tuần ───────────────────────────────────────────
const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

// ─── Component: Donut Chart SVG ──────────────────────────────────────────────
function DonutChart({ slices, size = 140 }) {
  const r = 50;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f3f9" strokeWidth="18" />
      {slices.map((s, i) => {
        const dash = (s.pct / 100) * circumference;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="18"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// ─── Trang Phân tích Chấm công ───────────────────────────────────────────────
function AttendanceAnalytics({
  onBack,
  reportRows,
  reportMeta,
  attendanceRows,
  summary,
  departmentOptions,
  selectedMonth,
  availableMonths,
  onMonthChange,
}) {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [analyticsMonth, setAnalyticsMonth] = useState(selectedMonth);
  const [extraSummary, setExtraSummary] = useState(null);
  const [loadingExtra, setLoadingExtra] = useState(false);

  // Tải thêm dữ liệu tháng khi người dùng đổi tháng phân tích
  useEffect(() => {
    setLoadingExtra(true);
    fetchAttendanceSummary(analyticsMonth)
      .then((payload) => setExtraSummary(payload))
      .catch(() => setExtraSummary(null))
      .finally(() => setLoadingExtra(false));
  }, [analyticsMonth]);

  // ─── Dữ liệu đã lọc theo phòng ban ────────────────────────────────────────
  const filtered = useMemo(() => {
    if (selectedDept === 'ALL') return reportRows;
    return reportRows.filter((r) => r.DepartmentName === selectedDept);
  }, [reportRows, selectedDept]);

  // ─── Tính toán chỉ số tổng hợp ─────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = filtered.length || 1;
    const presentDays  = filtered.reduce((s, r) => s + (Number(r.PresentDays)  || 0), 0);
    const leaveDays    = filtered.reduce((s, r) => s + (Number(r.LeaveDays)    || 0), 0);
    const absentDays   = filtered.reduce((s, r) => s + (Number(r.AbsentDays)   || 0), 0);
    const sickDays     = filtered.reduce((s, r) => s + (Number(r.SickDays)     || 0), 0);
    const lateDays     = filtered.reduce((s, r) => s + (Number(r.LateDays)     || 0), 0);
    const workHours    = filtered.reduce((s, r) => s + (Number(r.TotalWorkDays) || 0) * 8, 0);
    const overtimeH    = filtered.reduce((s, r) => s + (Number(r.OvertimeHours) || 0), 0);

    const allDays = presentDays + leaveDays + absentDays + sickDays || 1;
    return { total, presentDays, leaveDays, absentDays, sickDays, lateDays, workHours, overtimeH, allDays };
  }, [filtered]);

  // ─── Bars theo ngày trong tuần ─────────────────────────────────────────────
  const weekdayBars = useMemo(() => {
    const counts = reportMeta?.weekdayStats || [0, 0, 0, 0, 0, 0, 0];
    const maxVal = Math.max(...counts, 1);
    return WEEKDAY_LABELS.map((label, i) => ({
      label,
      value: counts[i],
      height: Math.max((counts[i] / maxVal) * 100, 3),
    }));
  }, [reportMeta]);

  // ─── Donut chart slices ────────────────────────────────────────────────────
  const donutSlices = useMemo(() => {
    const { presentDays, leaveDays, absentDays, sickDays, allDays } = stats;
    return [
      { label: 'Đi làm',    color: '#3b82f6', pct: (presentDays / allDays) * 100 },
      { label: 'Nghỉ phép', color: '#22c55e', pct: (leaveDays   / allDays) * 100 },
      { label: 'Vắng mặt',  color: '#ef4444', pct: (absentDays  / allDays) * 100 },
      { label: 'Nghỉ ốm',   color: '#f59e0b', pct: (sickDays    / allDays) * 100 },
    ];
  }, [stats]);

  // ─── Top 5 nhân viên vắng nhiều nhất ──────────────────────────────────────
  const topAbsent = useMemo(() => {
    return [...filtered]
      .sort((a, b) => {
        const aTotal = (Number(a.AbsentDays) || 0) + (Number(a.SickDays) || 0) + (Number(a.LeaveDays) || 0);
        const bTotal = (Number(b.AbsentDays) || 0) + (Number(b.SickDays) || 0) + (Number(b.LeaveDays) || 0);
        return bTotal - aTotal;
      })
      .slice(0, 5)
      .map((r) => ({
        name: r.FullName,
        dept: r.DepartmentName || '—',
        code: `EMP-${String(r.EmployeeID).padStart(5, '0')}`,
        total: (Number(r.AbsentDays) || 0) + (Number(r.SickDays) || 0) + (Number(r.LeaveDays) || 0),
        late:  Number(r.LateDays) || 0,
        status: ((Number(r.AbsentDays) || 0) + (Number(r.SickDays) || 0) + (Number(r.LeaveDays) || 0)) > 10
          ? 'Vắng mặt' : 'Đi làm',
      }));
  }, [filtered]);

  // ─── Attendance rate theo phòng ban ────────────────────────────────────────
  const deptStats = useMemo(() => {
    const map = {};
    reportRows.forEach((r) => {
      const dept = r.DepartmentName || 'Khác';
      if (!map[dept]) map[dept] = { present: 0, total: 0 };
      map[dept].present += Number(r.PresentDays) || 0;
      map[dept].total   += (Number(r.PresentDays) || 0) + (Number(r.AbsentDays) || 0) +
                           (Number(r.LeaveDays)   || 0) + (Number(r.SickDays)   || 0);
    });
    return Object.entries(map)
      .map(([dept, v]) => ({ dept, rate: v.total > 0 ? ((v.present / v.total) * 100).toFixed(1) : '0.0' }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 6);
  }, [reportRows]);

  const displayMonth = analyticsMonth ? analyticsMonth.split('-')[1] : '—';
  const displayYear  = analyticsMonth ? analyticsMonth.split('-')[0] : '—';

  return (
    <section className="report-page" style={{ gap: 16 }}>
      {/* ── Header ── */}
      <div className="report-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button
            onClick={onBack}
            style={{ background: '#fff', border: '1px solid #dce1ec', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', color: '#5f677b', fontSize: 13 }}
          >
            ‹ Quay lại
          </button>
          <p className="report-kicker" style={{ margin: 0 }}>Phân tích nâng cao</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Phân tích Chấm công — Tháng {displayMonth}/{displayYear}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ height: 34, border: '1px solid #dce1ec', borderRadius: 8, padding: '0 12px', fontSize: 13, color: '#5f677b', background: '#fff' }}
            >
              <option value="ALL">Tất cả phòng ban</option>
              {departmentOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={analyticsMonth}
              onChange={(e) => {
                setAnalyticsMonth(e.target.value);
                onMonthChange && onMonthChange(e.target.value);
              }}
              style={{ height: 34, border: '1px solid #1572df', borderRadius: 8, padding: '0 12px', fontSize: 13, color: '#fff', background: '#1572df' }}
            >
              {(availableMonths || []).map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="report-cards">
        {[
          { icon: '👥', label: 'Tổng nhân viên',    value: stats.total,                   sub: `${selectedDept === 'ALL' ? 'Tất cả phòng ban' : selectedDept}` },
          { icon: '✅', label: 'Ngày đi làm',       value: stats.presentDays,             sub: `${((stats.presentDays / stats.allDays) * 100).toFixed(1)}% tổng ngày` },
          { icon: '⏰', label: 'Số lần đi trễ',     value: stats.lateDays,                sub: 'Tổng tháng này' },
          { icon: '📊', label: 'Giờ tăng ca (tổng)', value: `${stats.overtimeH.toFixed(0)}h`, sub: `TB ${(stats.overtimeH / (stats.total || 1)).toFixed(1)}h/người` },
        ].map(({ icon, label, value, sub }) => (
          <article key={label} className="report-card">
            <div className="report-card-head">
              <span className="metric-icon">{icon}</span>
            </div>
            <p>{label}</p>
            <strong>{loadingExtra ? '...' : value}</strong>
            <small>{sub}</small>
          </article>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="report-visuals">
        {/* Bar chart theo ngày trong tuần */}
        <article className="panel report-bars">
          <div className="panel-head">
            <h3>Tỷ lệ điểm danh theo ngày trong tuần</h3>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#7e879a' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <i className="dot" style={{ background: 'linear-gradient(180deg,#1f7de8,#0f61c1)', borderRadius: 4 }} />
                Có mặt
              </span>
            </div>
          </div>
          <div className="bar-grid">
            {weekdayBars.map((bar) => (
              <div key={bar.label} className="bar-item">
                <div className="bar-track">
                  <div className="bar-fill bar-bg" style={{ height: '100%' }} />
                  <div className="bar-fill" style={{ height: `${bar.height}%` }} />
                </div>
                <span>{bar.label}</span>
                <span style={{ fontSize: 10, color: '#9aa2b6' }}>{bar.value}</span>
              </div>
            ))}
          </div>
        </article>

        {/* Donut chart phân bố */}
        <article className="panel report-donut">
          <h3>Phân bố loại ngày</h3>
          <div className="donut-ring" style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <DonutChart slices={donutSlices} size={140} />
              <div className="donut-value" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <strong style={{ fontSize: 18 }}>{stats.allDays}</strong>
                <span style={{ display: 'block', fontSize: 10, color: '#8b95ac' }}>ngày</span>
              </div>
            </div>
          </div>
          <div className="donut-legend">
            {donutSlices.map((s) => (
              <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <i className="dot" style={{ background: s.color, borderRadius: 3 }} />
                {s.label}: {s.pct.toFixed(1)}%
              </span>
            ))}
          </div>
        </article>
      </div>

      {/* ── Tỷ lệ điểm danh theo phòng ban ── */}
      <article className="panel">
        <div className="panel-head">
          <h3>Tỷ lệ có mặt theo Phòng ban</h3>
          <span style={{ fontSize: 12, color: '#7b8293' }}>Top phòng ban</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {deptStats.map(({ dept, rate }) => (
            <div key={dept} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 48px', alignItems: 'center', gap: 12, fontSize: 13 }}>
              <span style={{ color: '#3b4258', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dept}</span>
              <div style={{ height: 8, borderRadius: 4, background: '#f0f3f9', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${rate}%`, background: Number(rate) >= 80 ? '#22c55e' : Number(rate) >= 60 ? '#f59e0b' : '#ef4444', borderRadius: 4, transition: 'width 0.6s ease' }} />
              </div>
              <span style={{ fontWeight: 700, color: Number(rate) >= 80 ? '#15803d' : Number(rate) >= 60 ? '#b45309' : '#b91c1c', textAlign: 'right' }}>{rate}%</span>
            </div>
          ))}
          {deptStats.length === 0 && <p style={{ color: '#8b95ac', fontSize: 13 }}>Không có dữ liệu.</p>}
        </div>
      </article>

      {/* ── Bảng Top nhân viên vắng nhiều ── */}
      <article className="panel report-table">
        <div className="panel-head">
          <h3>Top 5 nhân viên vắng / nghỉ nhiều nhất</h3>
          <span style={{ fontSize: 12, color: '#7b8293' }}>Tháng {displayMonth}/{displayYear}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Phòng ban</th>
                <th>Mã NV</th>
                <th>Tổng ngày vắng</th>
                <th>Đi trễ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {topAbsent.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#8b95ac' }}>Không có dữ liệu</td></tr>
              ) : topAbsent.map((emp, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="employee-cell">
                      <div className="employee-avatar" style={{ background: 'linear-gradient(140deg,#f59e0b,#d97706)' }}>
                        {emp.name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()}
                      </div>
                      <div className="employee-info">
                        <strong>{emp.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{emp.dept}</td>
                  <td><span className="employee-code">{emp.code}</span></td>
                  <td>
                    <div className="leave-meter">
                      <span className="leave-count">{emp.total} ngày</span>
                      <div className="leave-track">
                        <div className="leave-progress" style={{ width: `${Math.min((emp.total / 22) * 100, 100)}%`, background: emp.total > 10 ? '#ef4444' : '#f59e0b' }} />
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontWeight: 600, color: emp.late > 3 ? '#b91c1c' : '#b45309' }}>{emp.late} lần</span></td>
                  <td><span className={`status-pill ${statusClass(emp.status)}`}>{emp.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* ── Footer ── */}
      <div className="report-footer-actions">
        <button type="button" className="footer-btn footer-btn-back" onClick={onBack}>Quay lại</button>
        <div className="report-footer-right">
          <button
            type="button"
            className="footer-btn footer-btn-outline"
            onClick={() => window.print()}
          >
            🖨 In / Xuất PDF
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .leave-meter { display: flex; flex-direction: column; gap: 4px; }
        .leave-count { font-size: 12px; font-weight: 600; color: #2d3748; }
        .leave-track { height: 6px; background: #f0f3f9; border-radius: 3px; overflow: hidden; width: 120px; }
        .leave-progress { height: 100%; border-radius: 3px; transition: width 0.4s; }
        .report-footer-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; }
        .report-footer-right { display: flex; gap: 10px; }
        .footer-btn { height: 36px; border-radius: 10px; border: 1px solid #dce1ec; padding: 0 18px; cursor: pointer; font-size: 13px; font-weight: 600; }
        .footer-btn-back { background: #fff; color: #5f677b; }
        .footer-btn-outline { background: #fff; color: #1572df; border-color: #1572df; }
        @media print {
          nav, aside, .report-footer-actions, button { display: none !important; }
          .report-page { display: block !important; }
        }
      `}} />
    </section>
  );
}

export default AttendanceAnalytics;
