import './css/style.css';
import { useState } from 'react';
import Sidebar from './layouts/Sidebar';
import Header from './layouts/Header';
import { useAttendanceData } from './hooks/useAttendanceData';
import AttendanceList from './pages/attendance/AttendanceList';
import ReportsAttendance from './pages/reports/ReportsAttendance';
import WorkAnniversaryAlert from './pages/alerts/WorkAnniversaryAlert';
import ExcessiveLeaveAlert from './pages/alerts/ExcessiveLeaveAlert';
import { statusClass, getReferenceDate } from './utils/helpers';

// ─── Tiêu đề trang theo view ────────────────────────────────────────────────
const VIEW_TITLES = {
  dashboard: 'Quản lý Chấm công',
  report: 'Báo cáo Chuyên sâu',
  work_anniversary: 'Kỷ niệm Ngày làm việc',
  excessive_leave: 'Cảnh báo Nghỉ phép quá mức',
};

// ─── App — Router chính ─────────────────────────────────────────────────────
function AttendanceApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const data = useAttendanceData();

  return (
    <div className="attendance-app">
      <Sidebar
        brandName="Hệ thống nhân sự"
        activeItem={activeView === 'dashboard' ? 'attendance' : 'report'}
      />

      <main className="main-content">
        <Header title={VIEW_TITLES[activeView] ?? 'Quản lý Chấm công'} />

        {/* ── Dashboard ── */}
        {activeView === 'dashboard' && (
          <AttendanceList
            {...data}
            onNavigateReport={() => setActiveView('report')}
            onNavigateWorkAnniversary={() => setActiveView('work_anniversary')}
          />
        )}

        {/* ── Báo cáo ── */}
        {activeView === 'report' && (
          <ReportsAttendance
            onBack={() => setActiveView('dashboard')}
            selectedDepartment={data.selectedDepartment}
            setSelectedDepartment={data.setSelectedDepartment}
            departmentOptions={data.departmentOptions}
            reportRows={data.reportRows}
            todayRows={data.filteredTodayRows}
            summary={data.summary}
            reportMeta={data.reportMeta}
            statusClass={statusClass}
            selectedMonth={data.selectedMonth}
            setSelectedMonth={data.setSelectedMonth}
            availableMonths={data.availableMonths}
            onMonthChange={(newMonth) => {
              data.setSelectedMonth(newMonth);
              data.setSelectedDate(getReferenceDate(newMonth));
            }}
            onWorkAnniversaryClick={() => setActiveView('work_anniversary')}
            onExcessiveLeaveClick={() => setActiveView('excessive_leave')}
          />
        )}

        {/* ── Kỷ niệm làm việc ── */}
        {activeView === 'work_anniversary' && (
          <WorkAnniversaryAlert
            onBack={() => setActiveView('report')}
            departmentOptions={data.departmentOptions}
            employees={data.attendanceRows}
          />
        )}

        {/* ── Cảnh báo nghỉ phép ── */}
        {activeView === 'excessive_leave' && (
          <ExcessiveLeaveAlert
            onBack={() => setActiveView('report')}
            apiUrl={data.apiUrl}
            departmentOptions={data.departmentOptions}
          />
        )}
      </main>
    </div>
  );
}

export default AttendanceApp;