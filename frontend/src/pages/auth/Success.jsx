import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Success.css';

const Success = ({ title = "Account Created", message = "Your account has been successfully created. An admin will review your request and send you further instructions via email.", nextText = "Go to Login", nextPath = "/login", showSecondaryAction = true, secondaryText = "Return to Home", secondaryPath = "/" }) => {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1>{title}</h1>
        <p className="success-message">{message}</p>

        <div className="success-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate(nextPath)}
          >
            {nextText}
          </button>

          {showSecondaryAction && (
            <button
              className="btn btn-link"
              onClick={() => navigate(secondaryPath)}
            >
              {secondaryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Success;
