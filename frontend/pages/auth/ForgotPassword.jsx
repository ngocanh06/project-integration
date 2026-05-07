import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // email or verify

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.requestPasswordReset(email);
      if (response.status === 200) {
        setSuccess('If an account exists with this email, you will receive a reset code.');
        setResetCode(response.data.reset_code); // For development
        setStep('verify');
      } else {
        setError('Failed to send reset code. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = (code) => {
    navigate('/reset-password', { state: { email, resetCode: code } });
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h1>Forgot Password?</h1>
        <p className="subtitle">
          No worries. Enter your email address and we will send you instructions to reset your password.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {step === 'email' ? (
          <form onSubmit={handleSubmitEmail}>
            <div className="form-group">
              <label htmlFor="email">EMAIL ADDRESS</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Reset Password →'}
            </button>
          </form>
        ) : (
          <div className="verification-step">
            <p>Reset code sent to {email}</p>
            <p className="reset-code-info">
              For development: Your reset code is <strong>{resetCode}</strong>
            </p>
            <button
              className="btn btn-primary btn-block"
              onClick={() => handleVerifyCode(resetCode)}
            >
              Continue to Reset Password
            </button>
          </div>
        )}

        <div className="back-link">
          <a href="/login">← Back to login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
