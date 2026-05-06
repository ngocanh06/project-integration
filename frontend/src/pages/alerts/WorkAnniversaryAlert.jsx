import React, { useState, useEffect } from 'react';
function WorkAnniversaryAlert({ onBack, departmentOptions = [], employees = [] }) {
  const [yearFilter, setYearFilter] = useState('2026');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [milestoneFilter, setMilestoneFilter] = useState('ALL');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDownload = () => {
    if (exportFormat === 'PDF') {
      window.print();
    } else {
      // Simple CSV export
      const headers = ['Mã NV', 'Họ và tên', 'Chức vụ', 'Phòng ban', 'Ngày vào làm', 'Thâm niên'];
      const rows = rosterData.map(row => [
        row.id,
        row.name,
        row.role,
        row.department,
        row.date,
        row.years
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `ky-niem-ngay-lam-viec-${yearFilter}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setShowExportModal(false);
  };

  const rosterDataRaw = (employees || [])
    .map((emp) => {
      let joinYear = 2026;
      const parts = String(emp.joinDate || '').split('/');
      if (parts.length === 3) {
        joinYear = parseInt(parts[2], 10);
      } else {
        const d = new Date(emp.joinDate);
        if (!isNaN(d.getTime())) {
          joinYear = d.getFullYear();
        }
      }

      const currentYear = parseInt(yearFilter, 10) || 2024;
      const years = currentYear - joinYear;

      let color = '#e8f0fe';
      let textColor = '#1a73e8';
      if (years >= 10) { color = '#fce8e6'; textColor = '#c5221f'; }
      else if (years >= 5) { color = '#e8e5f4'; textColor = '#6b46c1'; }
      else if (years >= 3) { color = '#e6f4ea'; textColor = '#137333'; }
      else if (years >= 1) { color = '#f1f5f9'; textColor = '#475569'; }

      const nameStr = emp.name || 'NV';
      const words = nameStr.trim().split(/\s+/);
      const initials = words.length > 1 ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase() : words[0].slice(0, 2).toUpperCase();

      return {
        id: emp.code,
        initials,
        name: emp.name,
        role: emp.position || emp.department || 'Nhân viên',
        department: emp.department,
        date: emp.joinDate,
        yearsNum: years,
        years: `${years} năm`,
        color,
        textColor,
        img: null,
        email: emp.email || '-'
      };
    })
    .filter(emp => emp.yearsNum >= 2);

  const rosterData = rosterDataRaw.filter(emp => {
    if (deptFilter !== 'ALL' && emp.department !== deptFilter) return false;
    if (milestoneFilter !== 'ALL') {
      if (milestoneFilter === '1-4' && (emp.yearsNum < 1 || emp.yearsNum > 4)) return false;
      if (milestoneFilter === '5-9' && (emp.yearsNum < 5 || emp.yearsNum > 9)) return false;
      if (milestoneFilter === '10+' && emp.yearsNum < 10) return false;
    }
    return true;
  }).sort((a, b) => b.yearsNum - a.yearsNum);

  useEffect(() => { setCurrentPage(1); }, [deptFilter, milestoneFilter, yearFilter]);

  const totalItems = rosterData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pagedRosterData = rosterData.slice(startIndex, startIndex + itemsPerPage);

  const topAnniversaries = rosterData.slice(0, 3);

  return (
    <section className="anniversary-page" style={{ padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div className="anniversary-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={onBack}
              style={{ background: 'none', border: '1px solid #dce1ec', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#5f677b' }}>
              ‹ Quay lại
            </button>
            <p style={{ color: '#5f677b', margin: 0, fontSize: '14px' }}>Ghi nhận những cột mốc quan trọng và cùng ăn mừng hành trình của đội nhóm.</p>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            style={{ backgroundColor: '#fff', border: '1px solid #dce1ec', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', color: '#111827', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Xuất File
          </button>
        </div>

      <div className="anniversary-filters" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '24px', border: '1px solid #edf1f5' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#5f677b', marginBottom: '8px', textTransform: 'uppercase' }}>NĂM LỌC</label>
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dce1ec', backgroundColor: '#f9fafb', outline: 'none' }}>
            <option value="2026">2026 (Hiện tại)</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#5f677b', marginBottom: '8px', textTransform: 'uppercase' }}>PHÒNG</label>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dce1ec', backgroundColor: '#f9fafb', outline: 'none' }}>
            <option value="ALL">Tất cả các phòng ban</option>
            {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#5f677b', marginBottom: '8px', textTransform: 'uppercase' }}>LOẠI MỐC QUAN TRỌNG</label>
          <select value={milestoneFilter} onChange={(e) => setMilestoneFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #dce1ec', backgroundColor: '#f9fafb', outline: 'none' }}>
            <option value="ALL">Tất cả các cột mốc</option>
            <option value="1-4">1 - 4 Năm</option>
            <option value="5-9">5 - 9 Năm</option>
            <option value="10+">Từ 10 Năm trở lên</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ backgroundColor: '#005ed3', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✨</span> Tạo cảnh báo
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        {/* Left Column: Roster */}
        <div style={{ flex: 2, backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #edf1f5', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '13px', color: '#111827', fontWeight: '700', textTransform: 'uppercase' }}>DANH SÁCH NHÂN VIÊN KỶ NIỆM</h3>
            <span style={{ backgroundColor: '#e8f0fe', color: '#1a73e8', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{rosterData.length} Thông báo mới</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #edf1f5' }}>
                <th style={{ padding: '12px 16px', fontSize: '11px', color: '#5f677b', textTransform: 'uppercase', fontWeight: '600' }}>MÃ SỐ NHÂN VIÊN</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', color: '#5f677b', textTransform: 'uppercase', fontWeight: '600' }}>HỌ VÀ TÊN</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', color: '#5f677b', textTransform: 'uppercase', fontWeight: '600' }}>NĂM VÔ LÀM</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', color: '#5f677b', textTransform: 'uppercase', fontWeight: '600' }}>SỐ NĂM LÀM</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', color: '#5f677b', textTransform: 'uppercase', fontWeight: '600' }}>HOẠT ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {pagedRosterData.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #edf1f5' }}>
                  <td style={{ padding: '16px', fontSize: '13px', fontWeight: '500', color: '#111827' }}>{row.id}</td>
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {row.img ? (
                      <img src={row.img} alt={row.name} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: row.color, color: row.textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px' }}>
                        {row.initials}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{row.name}</div>
                      <div style={{ fontSize: '12px', color: '#5f677b' }}>{row.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#5f677b' }}>{row.date.split(',').map((p, i) => <div key={i}>{p}</div>)}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ backgroundColor: row.color, color: row.textColor, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-block' }}>{row.years}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button style={{ background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 16px' }}>
            <span style={{ fontSize: '12px', color: '#5f677b' }}>Hiển thị {totalItems > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, totalItems)} trên {totalItems} thông báo</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#5f677b', marginRight: '8px' }}>Trang {currentPage} / {totalPages || 1}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #dce1ec', backgroundColor: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentPage === 1 ? 0.5 : 1 }}>‹</button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #dce1ec', backgroundColor: '#fff', cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1 }}>›</button>
            </div>
          </div>
        </div>

        {/* Right Column: Cards */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '13px', color: '#111827', fontWeight: '700', textTransform: 'uppercase' }}>DANH SÁCH LỄ KỶ NIỆM</h3>
            <a href="#" style={{ color: '#1572df', fontSize: '12px', textDecoration: 'none', fontWeight: '600' }}>View All</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topAnniversaries.map((emp, idx) => (
              <div key={idx} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #edf1f5', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {emp.img ? (
                      <img src={emp.img} alt={emp.name} style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: emp.color, color: emp.textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                        {emp.initials}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{emp.name}</div>
                      <div style={{ fontSize: '12px', color: '#5f677b' }}>{emp.email}</div>
                    </div>
                  </div>
                  <span style={{ backgroundColor: emp.color, color: emp.textColor, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{emp.years}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ flex: 1, backgroundColor: emp.color, color: emp.textColor, border: 'none', padding: '8px', borderRadius: '6px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                    {emp.yearsNum >= 5 ? 'Lựa chọn quà tặng' : 'Thư cảm ơn'}
                  </button>
                  <button style={{ width: '34px', height: '34px', backgroundColor: '#f8f9fa', border: '1px solid #edf1f5', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f677b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div style={{ backgroundColor: '#005ed3', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>Tóm tắt tháng kỷ niệm</h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Bạn có 8 ngày kỷ niệm sắp tới trong vòng 30 ngày.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '48px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{rosterData.length}</div>
            <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>TỔNG SỐ CẢNH BÁO</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>4</div>
            <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>THỜI HẠN CAO</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>2</div>
            <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>THỜI GIAN HỌC VIỆC 1 NĂM</div>
          </div>
        </div>
      </div>
      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="export-modal">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '20px', color: '#1a202c', margin: '0 0 5px 0' }}>Xuất file báo cáo</h3>
                <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>Mời chọn định dạng để tải file về</p>
              </div>
              <button className="close-modal-btn" onClick={() => setShowExportModal(false)}>&times;</button>
            </div>

            <div className="format-options">
              <div
                className={`format-card ${exportFormat === 'PDF' ? 'active' : ''}`}
                onClick={() => setExportFormat('PDF')}
              >
                <div className="format-icon pdf">PDF</div>
              </div>

              <div
                className={`format-card ${exportFormat === 'Excel' ? 'active' : ''}`}
                onClick={() => setExportFormat('Excel')}
              >
                <div className="format-icon excel">Excel</div>
              </div>
            </div>

            <div className="file-preview-box">
              <div className="preview-row">
                <span className="label">Tên file:</span>
                <span className="value">ky-niem-ngay-lam-viec-{yearFilter}</span>
              </div>
              <div className="preview-row">
                <span className="label">Định dạng:</span>
                <span className="value">{exportFormat}</span>
              </div>
              <div className="preview-row">
                <span className="label">Nội dung:</span>
                <span className="value">Kỷ niệm ngày làm việc ({rosterData.length} nhân viên)</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowExportModal(false)}>Hủy</button>
              <button className="btn-download" onClick={handleDownload}>Tải file</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="create-alert-modal">
            <div className="modal-header-main">
              <div className="header-title-box">
                <span className="bell-icon">🔔</span>
                <h3>Tạo cảnh báo kỷ niệm ngày làm việc</h3>
              </div>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>LOẠI CẢNH BÁO</label>
                <select className="full-select">
                  <option>Kỷ niệm 1 năm</option>
                  <option>Kỷ niệm 3 năm</option>
                  <option>Kỷ niệm 5 năm</option>
                  <option>Kỷ niệm 10 năm</option>
                </select>
              </div>

              <div className="form-group">
                <label>ĐỐI TƯỢNG ÁP DỤNG</label>
                <div className="select-with-icon">
                  <span className="users-icon">👥</span>
                  <select className="full-select icon-padding">
                    <option>Tất cả nhân viên</option>
                    <option>Nhân viên chính thức</option>
                    <option>Quản lý</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>THỜI ĐIỂM GỬI</label>
                <div className="select-with-icon">
                  <select className="full-select">
                    <option>Đúng ngày</option>
                    <option>Trước 1 ngày</option>
                    <option>Trước 3 ngày</option>
                  </select>
                  <span className="clock-icon">🕒</span>
                </div>
              </div>

              <div className="form-group">
                <label>KÊNH THÔNG BÁO</label>
                <div className="channel-options">
                  <label className="channel-box">
                    <input type="checkbox" defaultChecked />
                    <span className="channel-content">
                      <span className="channel-icon">📧</span> Email
                    </span>
                  </label>
                  <label className="channel-box">
                    <input type="checkbox" />
                    <span className="channel-content">
                      <span className="channel-icon">💬</span> SMS
                    </span>
                  </label>
                  <label className="channel-box">
                    <input type="checkbox" defaultChecked />
                    <span className="channel-content">
                      <span className="channel-icon">🔔</span> In-app
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label>NỘI DUNG THÔNG BÁO</label>
                  <span className="char-count">0/500</span>
                </div>
                <textarea className="custom-textarea" placeholder="Nhập nội dung thông báo tùy chỉnh..."></textarea>
              </div>

              <div className="activation-banner">
                <div className="banner-left">
                  <span className="bolt-icon">⚡</span>
                  <div>
                    <strong>Kích hoạt ngay</strong>
                    <p>Hệ thống sẽ bắt đầu quét dữ liệu ngay lập tức</p>
                  </div>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="modal-footer-main">
              <button className="btn-cancel-text" onClick={() => setShowCreateModal(false)}>Hủy</button>
              <button className="btn-submit-alert" onClick={() => { setShowCreateModal(false); setShowReviewModal(true); }}>
                <span className="check-icon">✔️</span> Tạo cảnh báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="review-modal">
            <div className="review-header">
              <div className="info-icon">ℹ️</div>
              <h3>Xác nhận thông tin cảnh báo</h3>
              <p>Vui lòng kiểm tra kỹ các thông tin trước khi kích hoạt hệ thống</p>
            </div>

            <div className="review-content">
              <div className="review-item">
                <span className="label">Loại cảnh báo:</span>
                <span className="value">Kỷ niệm 1 năm làm việc</span>
              </div>
              <div className="review-item">
                <span className="label">Đối tượng:</span>
                <span className="value">Tất cả nhân viên (30 người)</span>
              </div>
              <div className="review-item">
                <span className="label">Thời điểm:</span>
                <span className="value">Gửi đúng ngày kỷ niệm</span>
              </div>
              <div className="review-item">
                <span className="label">Kênh gửi:</span>
                <span className="value">Email, In-app</span>
              </div>
              <div className="review-item">
                <span className="label">Trạng thái:</span>
                <span className="value status-on">Kích hoạt ngay</span>
              </div>
            </div>

            <div className="review-footer">
              <button className="btn-back-edit" onClick={() => { setShowReviewModal(false); setShowCreateModal(true); }}>Quay lại sửa</button>
              <button className="btn-confirm-final" onClick={() => {
                setShowReviewModal(false);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
              }}>Xác nhận kích hoạt</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="success-toast">
          <div className="toast-icon">✅</div>
          <div className="toast-body">
            <strong>Thành công!</strong>
            <p>Hệ thống cảnh báo đã được thiết lập và kích hoạt.</p>
          </div>
          <button className="toast-close" onClick={() => setShowSuccess(false)}>&times;</button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .export-modal {
          background: white; width: 500px; border-radius: 20px; padding: 30px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          animation: modalFadeIn 0.3s ease-out;
          font-family: 'Inter', sans-serif;
        }
        
        /* Create Alert Modal Specific Styles */
        .create-alert-modal {
          background: white; width: 650px; border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          animation: modalFadeIn 0.3s ease-out;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }
        .modal-header-main { 
          padding: 20px 24px; border-bottom: 1px solid #e5e7eb; 
          display: flex; justify-content: space-between; align-items: center;
        }
        .header-title-box { display: flex; align-items: center; gap: 12px; }
        .bell-icon { 
          width: 32px; height: 32px; background: #ebf5ff; color: #1a73e8; 
          border-radius: 6px; display: flex; align-items: center; justify-content: center;
        }
        .header-title-box h3 { margin: 0; font-size: 18px; color: #111827; }
        .close-btn { background: none; border: none; font-size: 24px; color: #9ca3af; cursor: pointer; }

        .modal-body { padding: 24px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { 
          display: block; font-size: 11px; font-weight: 700; color: #6b7280; 
          margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .label-row { display: flex; justify-content: space-between; align-items: center; }
        .char-count { font-size: 11px; color: #9ca3af; }

        .full-select {
          width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #e5e7eb;
          background: #f3f4f6; color: #374151; font-size: 14px; outline: none; appearance: none;
        }
        .select-with-icon { position: relative; }
        .users-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .clock-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .icon-padding { padding-left: 36px; }

        .channel-options { display: flex; gap: 12px; }
        .channel-box {
          flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;
          background: #f3f4f6; cursor: pointer; display: flex; align-items: center; gap: 10px;
          transition: all 0.2s;
        }
        .channel-box input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
        .channel-content { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #374151; font-weight: 500; }

        .custom-textarea {
          width: 100%; height: 100px; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;
          background: #f3f4f6; font-size: 14px; outline: none; resize: none;
        }

        .activation-banner {
          background: #f0f7ff; border-radius: 12px; padding: 16px; 
          display: flex; justify-content: space-between; align-items: center;
        }
        .banner-left { display: flex; align-items: center; gap: 12px; }
        .bolt-icon { color: #1a73e8; font-size: 20px; }
        .banner-left strong { display: block; font-size: 14px; color: #111827; }
        .banner-left p { margin: 0; font-size: 12px; color: #1a73e8; }

        /* Switch Style */
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
          background-color: #ccc; transition: .4s;
        }
        .slider:before {
          position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
          background-color: white; transition: .4s;
        }
        input:checked + .slider { background-color: #1a73e8; }
        input:checked + .slider:before { transform: translateX(20px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }

        .modal-footer-main {
          padding: 20px 24px; display: flex; justify-content: flex-end; gap: 16px; border-top: 1px dashed #e5e7eb;
        }
        .btn-cancel-text { background: none; border: none; color: #374151; font-weight: 600; cursor: pointer; }
        .btn-submit-alert {
          background: #2563eb; color: white; border: none; padding: 10px 24px; border-radius: 8px;
          font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Keep Export Modal Styles */
        .close-modal-btn { background: #f7fafc; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #718096; font-size: 20px; }
        .format-options { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
        .format-card {
          border: 2px solid #edf2f7; border-radius: 12px; padding: 15px;
          display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer;
          transition: all 0.2s; position: relative; text-align: center;
        }
        .format-card:hover { border-color: #bee3f8; background: #ebf8ff; }
        .format-card.active { border-color: #3182ce; background: #ebf8ff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .format-icon { font-weight: 700; font-size: 18px; display: flex; align-items: center; justify-content: center; padding: 10px; }
        .format-icon.pdf { color: #e53e3e; }
        .format-icon.excel { color: #38a169; }
        .file-preview-box { background: #f7fafc; border-radius: 12px; padding: 15px; margin-bottom: 25px; text-align: left; }
        .preview-row { display: flex; margin-bottom: 8px; font-size: 13px; }
        .preview-row:last-child { margin-bottom: 0; }
        .preview-row .label { color: #718096; width: 80px; }
        .preview-row .value { color: #2d3748; font-weight: 500; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; }
        .btn-cancel { padding: 10px 25px; border-radius: 10px; border: none; background: #2d3748; color: white; font-weight: 600; cursor: pointer; }
        .btn-download { padding: 10px 25px; border-radius: 10px; border: none; background: #3182ce; color: white; font-weight: 600; cursor: pointer; }

        /* Review Modal Styles */
        .review-modal {
          background: white; width: 420px; border-radius: 16px; padding: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          animation: modalFadeIn 0.3s ease-out;
          text-align: center;
        }
        .review-header .info-icon {
          width: 48px; height: 48px; background: #ebf5ff; color: #1a73e8;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; font-size: 24px;
        }
        .review-header h3 { font-size: 18px; color: #111827; margin: 0 0 8px 0; }
        .review-header p { font-size: 13px; color: #6b7280; margin: 0 0 24px 0; line-height: 1.5; }
        
        .review-content { background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left; }
        .review-item { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
        .review-item:last-child { margin-bottom: 0; }
        .review-item .label { color: #6b7280; }
        .review-item .value { color: #111827; font-weight: 600; }
        .review-item .status-on { color: #059669; }

        .review-footer { display: flex; gap: 12px; }
        .btn-back-edit { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; background: white; color: #374151; font-weight: 600; cursor: pointer; }
        .btn-confirm-final { flex: 1; padding: 10px; border-radius: 8px; border: none; background: #1a73e8; color: white; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(26, 115, 232, 0.2); }

        /* Success Toast */
        .success-toast {
          position: fixed; top: 24px; right: 24px; width: 350px; background: white;
          border-left: 4px solid #10b981; border-radius: 8px; padding: 16px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          display: flex; align-items: center; gap: 16px; z-index: 2000;
          animation: toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes toastSlideIn {
          from { transform: translateX(120%); }
          to { transform: translateX(0); }
        }
        .toast-icon { font-size: 20px; }
        .toast-body strong { display: block; font-size: 14px; color: #111827; margin-bottom: 2px; }
        .toast-body p { margin: 0; font-size: 12px; color: #6b7280; }
        .toast-close { background: none; border: none; color: #9ca3af; font-size: 18px; cursor: pointer; margin-left: auto; }

        @media print {
          @page { size: A4 landscape; margin: 1cm; }
          body { background: white !important; margin: 0; padding: 0; }
          nav, aside, .modal-overlay, .anniversary-header button, .anniversary-filters, .anniversary-header div:first-child, .detail-btn, .icon-btn { 
            display: none !important; 
          }
          .anniversary-page { 
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #eee !important; padding: 8px !important; }
        }
      ` }} />
    </section>
  );
}

export default WorkAnniversaryAlert;
