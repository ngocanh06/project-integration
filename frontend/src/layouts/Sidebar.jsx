function Sidebar({ brandName = 'Hệ thống nhân sự', activeItem = 'attendance' }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-logo" />
        <span>{brandName}</span>
      </div>

      <nav className="main-nav">
        <button type="button" className={`nav-item ${activeItem === 'dashboard' ? 'active' : ''}`}>
          <span className="nav-icon">⌂</span>Dashboard
        </button>
        <button type="button" className={`nav-item ${activeItem === 'department' ? 'active' : ''}`}>
          <span className="nav-icon">◫</span>Department <span className="nav-arrow">›</span>
        </button>
        <button type="button" className={`nav-item ${activeItem === 'position' ? 'active' : ''}`}>
          <span className="nav-icon">◧</span>Position
        </button>
        <button type="button" className={`nav-item ${activeItem === 'employee' ? 'active' : ''}`}>
          <span className="nav-icon">◌</span>Employee
        </button>
        <button type="button" className={`nav-item ${activeItem === 'attendance' ? 'active' : ''}`}>
          <span className="nav-icon">◔</span>Attendance
        </button>
        <button type="button" className={`nav-item ${activeItem === 'salary' ? 'active' : ''}`}>
          <span className="nav-icon">$</span>Salary
        </button>
        <button type="button" className={`nav-item ${activeItem === 'report' ? 'active' : ''}`}>
          <span className="nav-icon">◍</span>Report <span className="badge-round">14</span>
        </button>
      </nav>

      <div className="nav-section-title">Others</div>

      <nav className="other-nav">
        <button type="button" className={`nav-item ${activeItem === 'guide' ? 'active' : ''}`}>
          <span className="nav-icon">◷</span>Guide <span className="nav-arrow">›</span>
        </button>
        <button type="button" className={`nav-item ${activeItem === 'messenger' ? 'active' : ''}`}>
          <span className="nav-icon">◶</span>Messenger <span className="badge-pill">New!</span>
        </button>
        <button type="button" className={`nav-item ${activeItem === 'settings' ? 'active' : ''}`}>
          <span className="nav-icon">⚙</span>Settings
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
