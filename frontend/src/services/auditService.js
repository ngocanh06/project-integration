import api from '../utils/api';

/**
 * Lấy danh sách nhật ký hệ thống (Audit Logs)
 * @param {Object} params - Tham số lọc (page, per_page, search, action, status, date_from, date_to)
 */
export const getAuditLogs = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/audit-logs?${query}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

/**
 * Lấy thống kê nhật ký hệ thống
 */
export const getAuditStats = async () => {
  try {
    const response = await api.get('/admin/audit-logs/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    throw error;
  }
};

const auditService = {
  getAuditLogs,
  getAuditStats
};

export default auditService;
