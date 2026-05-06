import { useMemo, useState, useEffect } from 'react';

function ExcessiveLeaveAlert({ onBack, apiUrl, departmentOptions }) {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ totalAlerts: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [deptStats, setDeptStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [tablePage, setTablePage] = useState(1);

  const handleDownload = () => {
    if (exportFormat === 'PDF') {
      window.print();
    } else {
      // Simple CSV export for Excel format
      const headers = ['Mã NV', 'Họ và tên', 'Phòng ban', 'Nghỉ phép', 'Vượt mức', 'Mức độ', 'Trạng thái'];
      const rows = data.map(row => [
        row.EmployeeCode,
        row.FullName,
        row.DepartmentName,
        row.TotalLeaveDays,
        row.ExceededDays,
        row.Severity,
        row.Status
      ]);
      
      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `canh-bao-nghi-phep-qua-muc-${selectedYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setShowExportModal(false);
  };

  useEffect(() => {
    const fetchExcessiveLeave = async () => {
      try {
        setIsLoading(true);
        const query = new URLSearchParams({
          year: selectedYear,
          department: selectedDepartment,
          severity: selectedSeverity,
          status: selectedStatus
        }).toString();
        const res = await fetch(`${apiUrl}/api/attendance/excessive-leave?${query}`);
        const payload = await res.json();
        if (payload.success) {
          setData(payload.data || []);
          setSummary(payload.summary || {});
          setDeptStats(payload.deptStats || []);
        }
      } catch (err) {
        console.error('Error fetching excessive leave data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExcessiveLeave();
  }, [apiUrl, selectedYear, selectedDepartment, selectedSeverity, selectedStatus]);

  const filteredData = useMemo(() => {
    let rows = data;
    // Filtering logic here if needed client-side
    return rows;
  }, [data, selectedDepartment, selectedSeverity, selectedStatus]);

  useEffect(() => { setTablePage(1); }, [filteredData]);

  const severityClass = (severity) => {
    switch (severity) {
      case 'Nghiêm trọng': return 'badge-red';
      case 'Trung bình': return 'badge-orange';
      case 'Nhẹ': return 'badge-green';
      default: return 'badge-blue';
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case 'Đã xử lý': return 'status-resolved';
      case 'Đang xem xét': return 'status-progress';
      case 'Chưa xử lý': return 'status-pending';
      default: return '';
    }
  };

  const severityStats = useMemo(() => {
    const total = data.length || 1;
    const serious = data.filter(r => r.Severity === 'Nghiêm trọng').length;
    const moderate = data.filter(r => r.Severity === 'Trung bình').length;
    const low = data.filter(r => r.Severity === 'Nhẹ').length;
    
    const pSerious = Math.round((serious / total) * 100);
    const pModerate = Math.round((moderate / total) * 100);
    const pLow = 100 - pSerious - pModerate;
    
    return {
      pSerious, pModerate, pLow,
      serious, moderate, low,
      gradient: `conic-gradient(#e53e3e 0% ${pSerious}%, #ed8936 ${pSerious}% ${pSerious + pModerate}%, #48bb78 ${pSerious + pModerate}% 100%)`
    };
  }, [data]);

  return (
    <div className="excessive-leave-page">
      {/* Header & Breadcrumbs */}
      <div className="page-header-container">
        <div className="header-main" style={{ marginTop: '0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBack}
            style={{ background: '#fff', border: '1px solid #dce1ec', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', color: '#5f677b', fontSize: '13px' }}>
            ‹ Quay lại
          </button>
          <div>
            <p className="subtitle" style={{ margin: 0 }}>Danh sách nhân viên nghỉ phép vượt mức quy định</p>
          </div>
          <button className="create-alert-btn">
            <span className="icon">⊕</span> Tạo cảnh báo
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label>NĂM</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="2026">2026-Hiện tại</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div className="filter-group">
          <label>PHÒNG BAN</label>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="ALL">Tất cả phòng ban</option>
            {departmentOptions?.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>MỨC ĐỘ</label>
          <select value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)}>
            <option value="ALL">Tất cả mức độ</option>
            <option value="Nhẹ">Nhẹ</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Nghiêm trọng">Nghiêm trọng</option>
          </select>
        </div>
        <div className="filter-group">
          <label>TRẠNG THÁI</label>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Chưa xử lý">Chưa xử lý</option>
            <option value="Đang xem xét">Đang xem xét</option>
            <option value="Đã xử lý">Đã xử lý</option>
          </select>
        </div>
        <button className="filter-more-btn">
          <span className="icon">⌥</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-grid">
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper alert-bg">⚠️</div>
            <span className="trend positive">+12%</span>
          </div>
          <p>Tổng cảnh báo</p>
          <div className="card-value">{summary.totalAlerts || 0}</div>
        </div>
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper pending-bg">📋</div>
            <span className="trend danger">Cao</span>
          </div>
          <p>Chưa xử lý</p>
          <div className="card-value">{summary.pending || 0}</div>
        </div>
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper in-progress-bg">👁️</div>
          </div>
          <p>Đang xem xét</p>
          <div className="card-value">{summary.inProgress || 0}</div>
        </div>
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper resolved-bg">✅</div>
          </div>
          <p>Đã xử lý</p>
          <div className="card-value">{summary.resolved || 0}</div>
        </div>
      </div>

      <div className="main-content-layout">
        {/* Left Column: Table */}
        <div className="alerts-table-section">
        <div className="table-header">
          <h2>DANH SÁCH NHÂN VIÊN VI PHẠM</h2>
          <button className="export-link-btn" onClick={() => setShowExportModal(true)}>Xuất báo cáo</button>
        </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>MÃ NV</th>
                  <th>HỌ VÀ TÊN</th>
                  <th>PHÒNG BAN</th>
                  <th>NGHỈ PHÉP</th>
                  <th>VƯỢT MỨC</th>
                  <th>MỨC ĐỘ</th>
                  <th>TRẠNG THÁI</th>
                  <th>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="8" style={{textAlign:'center', padding:'40px'}}>Đang tải dữ liệu...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="8" style={{textAlign:'center', padding:'40px'}}>Không có dữ liệu vi phạm</td></tr>
                ) : data.map((row) => (
                  <tr key={row.EmployeeID}>
                    <td className="emp-id">{row.EmployeeCode}</td>
                    <td>
                      <div className="user-cell">
                        <span>{row.FullName}</span>
                      </div>
                    </td>
                    <td>{row.DepartmentName}</td>
                    <td className="bold">{row.TotalLeaveDays}</td>
                    <td className="text-danger bold">+{row.ExceededDays}</td>
                    <td>
                      <span className={`severity-badge ${severityClass(row.Severity)}`}>
                        {row.Severity.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`status-text-badge ${statusClass(row.Status)}`}>
                        {row.Status}
                      </span>
                    </td>
                    <td>
                      <button className="action-dots">⋮</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-pagination">
            <span>Hiển thị {data.length} / {data.length} nhân viên</span>
            <div className="pagination-controls">
              <button disabled>‹</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button>›</button>
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="widgets-section">
          <div className="widget-card">
            <h3>Top phòng ban có cảnh báo</h3>
            <div className="dept-bars">
              {deptStats.map((dept, index) => (
                <div className="dept-bar-item" key={index}>
                  <div className="dept-bar-info">
                    <span>{dept.DepartmentName}</span>
                    <span className="count">{dept.AlertCount} Cảnh báo</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min(dept.AlertCount * 10, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="widget-card">
            <h3>Phân bổ mức độ vi phạm</h3>
            <div className="donut-chart-container">
              <div className="donut-chart" style={{ background: severityStats.gradient }}>
                <div className="donut-hole">
                  <div className="donut-center-text">
                    <strong>{data.length}</strong>
                    <span>TỔNG</span>
                  </div>
                </div>
              </div>
              <ul className="donut-legend-list">
                <li><span className="dot serious"></span> Nghiêm trọng <span className="val">{severityStats.pSerious}%</span></li>
                <li><span className="dot moderate"></span> Trung bình <span className="val">{severityStats.pModerate}%</span></li>
                <li><span className="dot low"></span> Nhẹ <span className="val">{severityStats.pLow}%</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="bottom-summary-bar">
        <div className="summary-left">
          <div className="icon-circle">📊</div>
          <strong>TÓM TẮT CẢNH BÁO NGHỈ PHÉP</strong>
        </div>
        <div className="summary-right">
          <div className="summary-stat">
            <span className="label">TỔNG CỘNG</span>
            <span className="val">{summary.totalAlerts || 0}</span>
          </div>
          <div className="divider"></div>
          <div className="summary-stat">
            <span className="label">CHƯA XỬ LÝ</span>
            <span className="val">{summary.pending || 0}</span>
          </div>
          <div className="divider"></div>
          <div className="summary-stat">
            <span className="label">ĐÃ HOÀN THÀNH</span>
            <span className="val">{(summary.totalAlerts || 0) - (summary.pending || 0)}</span>
          </div>
          <button className="detail-btn" onClick={onBack}>XEM CHI TIẾT</button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="export-modal">
            <div className="modal-header">
              <div>
                <h3>Xuất file báo cáo</h3>
                <p>Mời chọn định dạng tải về</p>
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
                <span className="value">bao-cao-nghi-phep-qua-muc-{selectedYear}</span>
              </div>
              <div className="preview-row">
                <span className="label">Định dạng:</span>
                <span className="value">{exportFormat}</span>
              </div>
              <div className="preview-row">
                <span className="label">Nội dung:</span>
                <span className="value">Tổng quan + danh sách vi phạm ({data.length} dòng)</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowExportModal(false)}>Hủy</button>
              <button className="btn-download" onClick={handleDownload}>Tải file</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;700&display=swap');
        
        .excessive-leave-page {
          padding: 24px;
          background: #f8faff;
          font-family: 'Inter', sans-serif;
          color: #2d3748;
          min-height: 100vh;
          padding-bottom: 100px;
        }
        .page-header-container { margin-bottom: 24px; }
        .breadcrumbs { font-size: 13px; color: #718096; margin-bottom: 12px; display: flex; gap: 8px; align-items: center; }
        .breadcrumbs .active { color: #1a365d; font-weight: 600; }
        .header-main { display: flex; justify-content: space-between; align-items: center; }
        .header-main h1 { font-size: 24px; font-weight: 700; color: #1a365d; margin: 0; }
        .header-main .subtitle { color: #718096; margin: 4px 0 0 0; font-size: 14px; }
        .create-alert-btn { background: #1572df; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
        .create-alert-btn:hover { background: #0e5db7; }

        .filters-container { display: flex; gap: 16px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 24px; align-items: flex-end; }
        .filter-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .filter-group label { font-size: 11px; font-weight: 700; color: #a0aec0; letter-spacing: 0.5px; }
        .filter-group select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; color: #4a5568; background: #f8fafc; }
        .filter-more-btn { padding: 8px 12px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; }

        .summary-cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
        .summary-card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: transform 0.3s; }
        .summary-card:hover { transform: translateY(-4px); }
        .card-top { display: flex; justify-content: space-between; margin-bottom: 12px; align-items: flex-start; }
        .icon-wrapper { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .alert-bg { background: #fff5f5; color: #f56565; }
        .pending-bg { background: #fffaf0; color: #ed8936; }
        .in-progress-bg { background: #edf2f7; color: #4a5568; }
        .resolved-bg { background: #f0fff4; color: #48bb78; }
        .summary-card p { margin: 0; font-size: 13px; color: #718096; font-weight: 500; }
        .card-value { font-size: 28px; font-weight: 700; color: #1a365d; margin-top: 4px; }
        .trend { font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 10px; }
        .trend.positive { background: #e6fffa; color: #319795; }
        .trend.danger { background: #fff5f5; color: #c53030; }

        .main-content-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
        .alerts-table-section { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .table-header h2 { font-size: 15px; font-weight: 700; color: #1a365d; margin: 0; }
        .export-link-btn { color: #1572df; font-size: 12px; font-weight: 600; border: none; background: none; cursor: pointer; }

        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px; font-size: 11px; font-weight: 700; color: #a0aec0; border-bottom: 1px solid #edf2f7; }
        td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f7fafc; }
        .emp-id { color: #1572df; font-weight: 500; }
        .user-cell { display: flex; align-items: center; gap: 10px; }
        .bold { font-weight: 700; color: #2d3748; }
        .text-danger { color: #e53e3e; }
        .severity-badge { padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; }
        .badge-red { background: #fff5f5; color: #c53030; }
        .badge-orange { background: #fffaf0; color: #c05621; }
        .badge-green { background: #f0fff4; color: #2f855a; }
        .badge-blue { background: #ebf8ff; color: #2b6cb0; }
        .status-text-badge { font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 6px; }
        .status-text-badge::before { content: ""; width: 8px; height: 8px; border-radius: 50%; }
        .status-resolved { color: #2f855a; }
        .status-resolved::before { background: #48bb78; }
        .status-progress { color: #4a5568; }
        .status-progress::before { background: #cbd5e0; }
        .status-pending { color: #c05621; }
        .status-pending::before { background: #ed8936; }
        .action-dots { background: none; border: none; color: #a0aec0; font-size: 18px; cursor: pointer; }
        .table-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; font-size: 12px; color: #718096; }
        .pagination-controls { display: flex; gap: 4px; }
        .pagination-controls button { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; }
        .table-pagination .page-btn.active { background: #3182ce; color: white; border-color: #3182ce; }
        .pagination-controls button:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .export-modal { background: white; width: 500px; border-radius: 20px; padding: 30px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); animation: modalFadeIn 0.3s ease-out; }
        @keyframes modalFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
        .modal-header h3 { font-size: 20px; color: #1a202c; margin: 0 0 5px 0; }
        .modal-header p { font-size: 14px; color: #718096; margin: 0; }
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
        .file-preview-box { background: #f7fafc; border-radius: 12px; padding: 15px; margin-bottom: 25px; }
        .preview-row { display: flex; margin-bottom: 8px; font-size: 13px; }
        .preview-row:last-child { margin-bottom: 0; }
        .preview-row .label { color: #718096; width: 80px; }
        .preview-row .value { color: #2d3748; font-weight: 500; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; }
        .btn-cancel { padding: 10px 25px; border-radius: 10px; border: none; background: #2d3748; color: white; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn-cancel:hover { background: #1a202c; }
        .btn-download { padding: 10px 25px; border-radius: 10px; border: none; background: #3182ce; color: white; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn-download:hover { background: #2b6cb0; }

        .widget-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); margin-bottom: 24px; }
        .widget-card h3 { font-size: 14px; font-weight: 700; color: #1a365d; margin: 0 0 16px 0; }
        .dept-bars { display: flex; flex-direction: column; gap: 14px; }
        .dept-bar-info { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
        .dept-bar-info .count { font-weight: 600; color: #1a365d; }
        .progress-track { height: 6px; background: #edf2f7; border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; background: #1572df; border-radius: 3px; }

        .donut-chart-container { display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .donut-chart {
          width: 140px; height: 140px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .donut-hole {
          width: 90px; height: 90px; border-radius: 50%; background: white;
          display: flex; align-items: center; justify-content: center;
        }
        .donut-center-text { text-align: center; }
        .donut-center-text strong { display: block; font-size: 22px; color: #1a365d; }
        .donut-center-text span { font-size: 10px; color: #a0aec0; font-weight: 700; }
        
        .donut-legend-list { list-style: none; padding: 0; width: 100%; }
        .donut-legend-list li {
          display: flex; align-items: center; font-size: 12px; color: #4a5568; margin-bottom: 8px;
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
        .dot.serious { background: #e53e3e; }
        .dot.moderate { background: #ed8936; }
        .dot.low { background: #48bb78; }
        .donut-legend-list li .val { margin-left: auto; font-weight: 600; color: #1a365d; }

        .bottom-summary-bar {
          position: fixed; bottom: 20px; left: 280px; right: 24px;
          background: #004d99; color: white; height: 64px; border-radius: 12px;
          display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
          box-shadow: 0 8px 20px rgba(0, 77, 153, 0.3); z-index: 100;
        }
        .summary-left { display: flex; align-items: center; gap: 12px; }
        .icon-circle { width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .summary-right { display: flex; align-items: center; gap: 30px; }
        .summary-stat { display: flex; flex-direction: column; align-items: center; }
        .summary-stat .label { font-size: 10px; opacity: 0.8; font-weight: 600; }
        .summary-stat .val { font-size: 18px; font-weight: 700; }
        .divider { width: 1px; height: 30px; background: rgba(255,255,255,0.2); }
        .detail-btn {
          background: #1572df; color: white; border: none; padding: 8px 16px; border-radius: 6px;
          font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .detail-btn:hover { background: #0e5db7; }

        @media print {
          @page { size: A4 landscape; margin: 1cm; }
          body { background: white !important; margin: 0; padding: 0; }
          nav, aside, .modal-overlay, .create-alert-btn, .filters-container, .export-link-btn, .action-dots, .bottom-summary-bar, button { 
            display: none !important; 
          }
          .excessive-leave-page { 
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .summary-card, .alerts-table-section, .widget-card { 
            box-shadow: none !important; 
            border: 1px solid #ddd !important; 
            margin-bottom: 20px !important;
            break-inside: avoid;
          }
          .summary-cards-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
          }
          .main-content-layout {
            display: block !important;
          }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #eee !important; padding: 8px !important; }
        }
      `}} />
    </div>
  );
}

export default ExcessiveLeaveAlert;
