import React from 'react';

function Header({ title, onMenuClick }) {
  return (
    <header className="fixed-top-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="header-page-title">{title}</h1>
      </div>

      <div className="header-center">
        <div className="search-wrapper">
          <input type="text" placeholder="Search here..." />
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      <div className="header-right">
        <div className="action-icons">
          <div className="icon-badge-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="badge badge-blue">23</span>
          </div>
          <div className="icon-badge-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span className="badge badge-green">68</span>
          </div>
          <div className="icon-badge-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 8V21H3V8"></path>
              <path d="M1 3H23V8H1V3Z"></path>
              <path d="M10 12H14"></path>
            </svg>
            <span className="badge badge-gray">14</span>
          </div>
        </div>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">Designluch</span>
            <span className="user-role">Super Admin</span>
          </div>
          <div className="user-avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar" />
          </div>
          <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .fixed-top-header {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: #f8faff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          border-bottom: 1px solid #e8ecf4;
          z-index: 1000;
        }

        .header-left { display: flex; align-items: center; gap: 16px; }
        .menu-toggle {
          background: none; border: none; color: #5f677b; cursor: pointer; padding: 8px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; transition: 0.2s;
        }
        .menu-toggle:hover { background: #edf2f7; color: #1a365d; }
        .header-page-title { font-size: 20px; font-weight: 700; color: #1a202c; margin: 0; }

        .header-center { flex: 1; display: flex; justify-content: center; padding: 0 40px; }
        .search-wrapper {
          position: relative; width: 100%; max-width: 400px;
        }
        .search-wrapper input {
          width: 100%; padding: 10px 16px 10px 40px; border-radius: 12px; border: 1px solid #e2e8f0;
          background: #fff; font-size: 14px; outline: none; transition: 0.2s;
        }
        .search-wrapper input:focus { border-color: #3182ce; box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1); }
        .search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #a0aec0;
        }

        .header-right { display: flex; align-items: center; gap: 24px; }
        .action-icons { display: flex; align-items: center; gap: 16px; }
        .icon-badge-wrapper {
          position: relative; color: #718096; cursor: pointer; padding: 4px; transition: 0.2s;
        }
        .icon-badge-wrapper:hover { color: #2d3748; }
        .badge {
          position: absolute; top: -2px; right: -4px; width: 18px; height: 18px; border-radius: 50%;
          font-size: 10px; font-weight: 700; color: #fff; display: flex; align-items: center;
          justify-content: center; border: 2px solid #f8faff;
        }
        .badge-blue { background: #3182ce; }
        .badge-green { background: #48bb78; }
        .badge-gray { background: #718096; }

        .user-profile { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 4px 8px; border-radius: 12px; transition: 0.2s; }
        .user-profile:hover { background: #edf2f7; }
        .user-info { text-align: right; display: flex; flex-direction: column; }
        .user-name { font-size: 14px; font-weight: 700; color: #2d3748; }
        .user-role { font-size: 11px; color: #718096; font-weight: 500; }
        .user-avatar { width: 40px; height: 40px; border-radius: 10px; overflow: hidden; background: #e2e8f0; }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .dropdown-arrow { color: #a0aec0; }
      `}} />
    </header>
  );
}

export default Header;
