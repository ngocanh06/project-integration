import React from 'react';
import { statusClass, getInitials } from '../../utils/helpers';
import { getReferenceDate } from '../../utils/helpers';

// ─── Trang Dashboard Chấm công ──────────────────────────────────────────────
function AttendanceDashboard({
  // Trạng thái tải
  isLoading, errorMessage,
  // Bộ lọc tháng + phòng ban
  selectedMonth, setSelectedMonth, availableMonths,
  selectedDate, setSelectedDate,
  selectedDepartment, setSelectedDepartment, departmentOptions,
  // Thống kê nhanh
  totalEntries, presentCount, absentCount, leaveCount, holidayCount,
  // Bảng chấm công chính
  pagedAttendanceRows, startIndex, endIndex, safePage, totalPages, currentPage, setCurrentPage, pageNumbers,
  // Lịch
  calendarDays, handlePrevMonth, handleNextMonth,
  // Bảng hôm nay
  pagedTodayRows, todayTotal, todayStartIdx, todayEndIdx,
  todaySafePage, todayTotalPages, todayPage, setTodayPage, todayPageNumbers,
  // Tóm tắt tháng
  summary,
  // Điều hướng
  onNavigateReport, onNavigateWorkAnniversary,
}) {
  return (
    <>
      {errorMessage && <div className="data-warning">{errorMessage}</div>}
      <div className="content-inner">

        {/* ── Bộ lọc ── */}
        <section className="filter-row">
          <input type="text" value="Tìm kiếm nhân viên theo tên, mã số hoặc phòng ban..." readOnly />
          <select
            value={selectedMonth}
            onChange={(e) => {
              const newMonth = e.target.value;
              setSelectedMonth(newMonth);
              setSelectedDate(getReferenceDate(newMonth));
            }}
            style={{ height: '36px', border: '1px solid #dce1ec', borderRadius: '9px', fontSize: '12px', background: '#fff', color: '#5f677b', padding: '0 12px' }}
          >
            {availableMonths.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <div className="department-filter">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              aria-label="Lọc theo phòng ban"
            >
              <option value="ALL">Tất cả phòng ban</option>
              {departmentOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <button type="button" className="primary" onClick={onNavigateWorkAnniversary}>
            Thông báo kỉ niệm ngày làm việc
          </button>
        </section>

        {/* ── Thẻ thống kê ── */}
        <section className="stats-grid">
          {[
            { label: 'Tổng số nhân viên', value: totalEntries },
            { label: 'Có mặt', value: presentCount },
            { label: 'Vắng mặt', value: absentCount },
            { label: 'Nghỉ phép / Nghỉ lễ', value: `${leaveCount} / ${holidayCount}` },
          ].map(({ label, value }) => (
            <article key={label} className="stat-card">
              <p>{label}</p>
              <strong>{isLoading ? '...' : value}</strong>
            </article>
          ))}
        </section>

        {/* ── Bảng nhật ký chấm công ── */}
        <section className="panel">
          <div className="panel-head table-head">
            <div className="table-title-wrap">
              <h3>Nhật ký chấm công nhân viên</h3>
              <span>Hiển thị {Math.max(endIndex, 0)} trong số {totalEntries.toLocaleString('vi-VN')}</span>
            </div>
            <div className="table-actions">
              <button type="button" className="icon-btn" aria-label="Refresh">↻</button>
              <button type="button" className="icon-btn" aria-label="More">⋮</button>
            </div>
          </div>
          <div className="table-wrap">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th><input type="checkbox" aria-label="Select all rows" /></th>
                  <th>Mã nhân viên</th>
                  <th>Họ và tên / Liên hệ</th>
                  <th>CCCD</th>
                  <th>Phòng ban</th>
                  <th>Chức vụ</th>
                  <th>Ngày vào làm</th>
                  <th>Ngày sinh</th>
                  <th>Địa chỉ</th>
                  <th>Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                {pagedAttendanceRows.map((row) => (
                  <tr key={row.code}>
                    <td><input type="checkbox" aria-label={`Select ${row.code}`} /></td>
                    <td><span className="employee-code">{row.code}</span></td>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar">{getInitials(row.name)}</div>
                        <div className="employee-info">
                          <strong>{row.name}</strong>
                          <small>{row.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{row.phone === '-' ? '-' : row.phone.replace(/\D/g, '').slice(0, 12)}</td>
                    <td>{row.department}</td>
                    <td>{row.position}</td>
                    <td>{row.joinDate}</td>
                    <td>{row.birthDate}</td>
                    <td>{row.location}</td>
                    <td><span className={`status-pill ${statusClass(row.status)}`}>{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span>
              Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries.toLocaleString('vi-VN')} entries
            </span>
            <div className="pagination">
              <button type="button" className="page-btn" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={safePage === 1} aria-label="Previous page">‹</button>
              {pageNumbers.map((num, idx) => {
                const showDots = idx > 0 && num - pageNumbers[idx - 1] > 1;
                return (
                  <span key={num} className="page-slot">
                    {showDots && <span className="page-dots">…</span>}
                    <button type="button" className={`page-btn ${safePage === num ? 'active' : ''}`} onClick={() => setCurrentPage(num)}>{num}</button>
                  </span>
                );
              })}
              <button type="button" className="page-btn" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={safePage === totalPages} aria-label="Next page">›</button>
            </div>
          </div>
        </section>

        {/* ── Lịch + Bảng hôm nay ── */}
        <section className="two-panels">
          {/* Lịch */}
          <article className="panel calendar">
            <h3>Lịch</h3>
            <div className="calendar-box">
              <div className="calendar-top">
                <button type="button" className="calendar-nav" onClick={handlePrevMonth}>‹</button>
                <span>Tháng {selectedMonth.split('-')[1]}, {selectedMonth.split('-')[0]}</span>
                <button type="button" className="calendar-nav" onClick={handleNextMonth}>›</button>
              </div>
              <div className="calendar-weekdays">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'Cn'].map((d) => (
                  <span key={d} className="weekday-cell">{d}</span>
                ))}
              </div>
              <div className="calendar-days">
                {calendarDays.map((item, idx) => (
                  <span
                    key={`${item.day}-${idx}`}
                    className={`day-cell ${item.date === selectedDate ? 'selected-day' : ''} ${item.muted ? 'muted-day' : ''}`}
                    onClick={() => { if (!item.muted && item.date) setSelectedDate(item.date); }}
                    style={{ cursor: item.muted ? 'default' : 'pointer' }}
                  >
                    {item.day}
                  </span>
                ))}
              </div>
            </div>
            <div className="calendar-legend">
              {[
                { cls: 'dot-green', label: 'Đi làm đầy đủ' },
                { cls: 'dot-yellow', label: 'Đi muộn' },
                { cls: 'dot-red', label: 'Vắng mặt' },
                { cls: 'dot-blue', label: 'Nghỉ phép' },
              ].map(({ cls, label }) => (
                <div key={cls}><span className={`dot ${cls}`} />{label}</div>
              ))}
            </div>
          </article>

          {/* Bảng hôm nay */}
          <article className="panel today-panel">
            <div className="today-head">
              <h3>Bảng chấm công ngày {selectedDate.split('-').reverse().join('/')}</h3>
              <span className="month-badge">Tháng {selectedDate.split('-')[1]}, {selectedDate.split('-')[0]}</span>
            </div>
            <div className="today-table">
              <div className="today-row today-row-head">
                <span>Nhân viên</span><span>Vào</span><span>Ra</span><span>Giờ làm</span><span>Trạng thái</span>
              </div>
              {pagedTodayRows.length === 0 ? (
                <div style={{ padding: '16px 8px', color: '#8b95ac', fontSize: '13px', textAlign: 'center' }}>
                  {isLoading ? 'Đang tải...' : 'Không có dữ liệu hôm nay'}
                </div>
              ) : pagedTodayRows.map((item, idx) => (
                <div key={`${item.employeeId}-${idx}`} className="today-row">
                  <span>{item.name}</span>
                  <span style={{ color: item.checkIn !== '-' ? '#1572df' : '#aaa' }}>{item.checkIn}</span>
                  <span style={{ color: item.checkOut !== '-' ? '#1572df' : '#aaa' }}>{item.checkOut}</span>
                  <span>{item.hours}</span>
                  <span><span className={`status-pill ${statusClass(item.status)}`}>{item.status}</span></span>
                </div>
              ))}
            </div>
            <div className="today-footer">
              <span className="today-footer-info">
                Hiển thị {todayTotal === 0 ? 0 : todayStartIdx + 1}-{todayEndIdx} trong số {todayTotal} nhân viên
              </span>
              <div className="pagination">
                <button type="button" className="page-btn" onClick={() => setTodayPage((p) => Math.max(p - 1, 1))} disabled={todaySafePage === 1} aria-label="Trang trước">‹</button>
                {todayPageNumbers.map((num, idx) => {
                  const showDots = idx > 0 && num - todayPageNumbers[idx - 1] > 1;
                  return (
                    <span key={num} className="page-slot">
                      {showDots && <span className="page-dots">…</span>}
                      <button type="button" className={`page-btn ${todaySafePage === num ? 'active' : ''}`} onClick={() => setTodayPage(num)}>{num}</button>
                    </span>
                  );
                })}
                <button type="button" className="page-btn" onClick={() => setTodayPage((p) => Math.min(p + 1, todayTotalPages))} disabled={todaySafePage === todayTotalPages} aria-label="Trang sau">›</button>
              </div>
            </div>
            <button type="button" className="outline-btn report-btn" onClick={onNavigateReport}>
              Tạo báo cáo chi tiết
            </button>
          </article>
        </section>

        {/* ── Tóm tắt tháng ── */}
        <section className="panel summary">
          <h3 className="summary-title">Tổng hợp tháng này</h3>
          <div className="summary-grid">
            {[
              { label: 'Tổng ngày làm việc', value: summary.totalWorkDays },
              { label: 'Tổng tỷ lệ đi làm', value: summary.averageAttendance },
              { label: 'Tổng giờ làm', value: summary.totalWorkHours },
              { label: 'Tổng giờ tăng ca', value: summary.totalOvertimeHours },
            ].map(({ label, value }) => (
              <div key={label} className="summary-item">
                <p>{label}</p>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}

export default AttendanceDashboard;
