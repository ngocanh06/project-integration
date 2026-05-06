// ─── attendanceService.js ────────────────────────────────────────────────────
// Tất cả lời gọi API liên quan đến chấm công tập trung tại đây.
// Hook và component chỉ import từ file này, không fetch trực tiếp.

const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  const host = window.location.hostname || 'localhost';
  return `http://${host}:5000`;
};

// ─── Helpers nội bộ ──────────────────────────────────────────────────────────
const handleResponse = async (res, label) => {
  if (!res.ok) throw new Error(`Không thể tải ${label} (HTTP ${res.status})`);
  return res.json();
};

// ─── API Attendance ───────────────────────────────────────────────────────────

/**
 * Lấy danh sách toàn bộ nhân viên (kèm thông tin phòng ban, chức vụ).
 * @returns {Promise<{data: Array}>}
 */
export const fetchEmployees = () =>
  fetch(`${getBaseUrl()}/api/attendance/employees`)
    .then((r) => handleResponse(r, 'danh sách nhân viên'));

/**
 * Lấy dữ liệu chấm công trong ngày theo ngày chỉ định.
 * @param {string} date  — định dạng YYYY-MM-DD
 * @returns {Promise<{data: Array}>}
 */
export const fetchAttendanceToday = (date) =>
  fetch(`${getBaseUrl()}/api/attendance/today?date=${date}`)
    .then((r) => handleResponse(r, 'chấm công hôm nay'));

/**
 * Lấy tóm tắt chấm công theo tháng.
 * @param {string} yearMonth  — định dạng YYYY-MM
 * @returns {Promise<{data: Array, yearMonth: string, total_stats: object, weekday_stats: Array}>}
 */
export const fetchAttendanceSummary = (yearMonth) =>
  fetch(`${getBaseUrl()}/api/attendance/summary?yearMonth=${yearMonth}`)
    .then((r) => handleResponse(r, 'tóm tắt tháng'));

/**
 * Lấy danh sách nhân viên nghỉ phép quá mức.
 * @param {object} params
 * @param {string} [params.department]
 * @param {number} [params.threshold]
 * @returns {Promise<{data: Array}>}
 */
export const fetchExcessiveLeave = ({ department = '', threshold = 3 } = {}) => {
  const params = new URLSearchParams();
  if (department && department !== 'ALL') params.append('department', department);
  params.append('threshold', threshold);
  return fetch(`${getBaseUrl()}/api/attendance/excessive-leave?${params}`)
    .then((r) => handleResponse(r, 'cảnh báo nghỉ phép'));
};

/**
 * Lấy thống kê dashboard (số liệu nhanh).
 * @param {string} date  — định dạng YYYY-MM-DD
 * @returns {Promise<object>}
 */
export const fetchDashboardStats = (date) =>
  fetch(`${getBaseUrl()}/api/attendance/dashboard-stats?date=${date}`)
    .then((r) => handleResponse(r, 'dashboard stats'));

/**
 * Lấy danh sách phòng ban.
 * @returns {Promise<{data: Array}>}
 */
export const fetchDepartments = () =>
  fetch(`${getBaseUrl()}/api/attendance/departments`)
    .then((r) => handleResponse(r, 'danh sách phòng ban'));

/**
 * Lấy danh sách chức vụ.
 * @returns {Promise<{data: Array}>}
 */
export const fetchPositions = () =>
  fetch(`${getBaseUrl()}/api/attendance/positions`)
    .then((r) => handleResponse(r, 'danh sách chức vụ'));
