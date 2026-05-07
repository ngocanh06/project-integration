import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email: stateEmail = '', resetCode: stateResetCode = '' } = location.state || {};

  const [step, setStep] = useState('verify'); // verify or reset
  const [email, setEmail] = useState(stateEmail);
  const [resetCode, setResetCode] = useState(stateResetCode);
  const [codeInput, setCodeInput] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newCodeInput = [...codeInput];
    newCodeInput[index] = value;
    setCodeInput(newCodeInput);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const code = codeInput.join('');
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.verifyResetCode(email, code);
      if (response.status === 200) {
        setResetCode(code);
        setStep('reset');
        setSuccess('Code verified. Please enter your new password.');
      } else {
        setError('Invalid or expired reset code');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.resetPassword(
        email,
        resetCode,
        newPassword,
        confirmPassword
      );
      if (response.status === 200) {
        navigate('/password-reset-success');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setStep('verify');
    setCodeInput(Array(6).fill(''));
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        {step === 'verify' ? (
          <>
            <h1>Enter Verification Code</h1>
            <p className="subtitle">
              We've sent a 6-digit code to your email. Please enter it below.
            </p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleVerifyCode}>
              <div className="code-input-group">
                {codeInput.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    disabled={loading}
                    className="code-input"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>

            <div className="resend-code">
              <button
                type="button"
                className="link-button"
                onClick={handleResendCode}
                disabled={loading}
              >
                Resend Code
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>Reset Password</h1>
            <p className="subtitle">Create a strong password to secure your account.</p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="newPassword">NEW PASSWORD</label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <small className="password-hint">
                  Password strength: Weak
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <div className="back-link">
          <a href="/login">← Back to login</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
