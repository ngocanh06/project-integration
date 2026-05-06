// ─── Định dạng thời gian ────────────────────────────────────────────────────
export const formatTime = (value) => {
  if (!value) return '-';
  const normalized = String(value).replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return String(value).slice(11, 16) || '-';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

// ─── Định dạng ngày tháng ───────────────────────────────────────────────────
export const formatDate = (value) => {
  if (!value) return '-';
  const normalized = String(value).replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10) || '-';
  return date.toLocaleDateString('vi-VN');
};

// ─── Chuẩn hóa trạng thái chấm công ────────────────────────────────────────
export const normalizeStatus = (status) => {
  const raw = String(status || '').toLowerCase();
  if (raw === 'present' || raw === 'đi làm' || raw === 'đúng giờ' || raw === 'on time') return 'Đi làm';
  if (raw === 'late' || raw === 'trễ' || raw === 'đi trễ' || raw === 'đi muộn') return 'Trễ';
  if (raw === 'leave' || raw === 'nghỉ phép') return 'Nghỉ phép';
  if (raw === 'sick' || raw === 'nghỉ ốm') return 'Nghỉ ốm';
  if (raw === 'holiday' || raw === 'nghỉ lễ') return 'Nghỉ lễ';
  return 'Vắng mặt';
};

// ─── Lấy chữ viết tắt tên nhân viên ────────────────────────────────────────
export const getInitials = (name) => {
  if (!name) return 'NV';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

// ─── CSS class theo trạng thái ──────────────────────────────────────────────
export const statusClass = (status) => {
  if (status === 'Đi làm') return 'status-green';
  if (status === 'Trễ') return 'status-orange';
  if (status === 'Nghỉ phép') return 'status-blue';
  if (status === 'Nghỉ lễ') return 'status-gray';
  return 'status-red';
};

// ─── Lấy ngày tham chiếu cho tháng đã chọn ─────────────────────────────────
export const getReferenceDate = (ym) => {
  const today = new Date();
  const currentYm = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  if (ym === currentYm) {
    return `${ym}-${String(today.getDate()).padStart(2, '0')}`;
  }
  const [year, month] = ym.split('-');
  const lastDay = new Date(year, month, 0).getDate();
  return `${ym}-${String(lastDay).padStart(2, '0')}`;
};
