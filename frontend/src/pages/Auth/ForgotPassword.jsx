// frontend/src/pages/Auth/ForgotPassword.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const otpRefs = useRef([]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || '';
        setOtp(newOtp);
        otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError(''); setMessage(''); setLoading(true);
        try {
            const res = await api.post('/auth/send-otp', { email });
            setMessage(res.data.msg);
            setStep(2);
            setCountdown(60);
        } catch (err) {
            setError(err.response?.data?.msg || 'Không thể gửi OTP. Thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length < 6) { setError('Vui lòng nhập đủ 6 số OTP'); return; }
        setError(''); setMessage(''); setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email, otp_code: otpCode });
            setMessage(res.data.msg);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.msg || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        setError(''); setMessage(''); setLoading(true);
        try {
            const res = await api.post('/auth/send-otp', { email });
            setMessage(res.data.msg);
            setOtp(['', '', '', '', '', '']);
            setCountdown(60);
        } catch (err) {
            setError(err.response?.data?.msg || 'Không thể gửi lại OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');
        if (newPassword !== confirmPassword) { setError('Mật khẩu xác nhận không khớp!'); return; }
        if (newPassword.length < 8) { setError('Mật khẩu phải có ít nhất 8 ký tự.'); return; }
        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password-otp', {
                email, otp_code: otp.join(''), new_password: newPassword
            });
            setMessage(res.data.msg);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.msg || 'Đặt lại mật khẩu thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const EyeIcon = ({ open }) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
            {!open && <line x1="2" y1="2" x2="22" y2="22" />}
        </svg>
    );

    const stepLabels = ['Email', 'Xác thực', 'Mật khẩu'];
    const headings = ['Quên Mật Khẩu?', 'Nhập Mã OTP', 'Mật Khẩu Mới'];
    const subheadings = [
        'Nhập email đăng ký để nhận mã xác thực',
        `Mã OTP đã gửi đến ${email}`,
        'Tạo mật khẩu mới cho tài khoản của bạn'
    ];

    return (
        <div className="login-container" translate="no">
            <div className="login-card" style={{ maxWidth: '440px' }} translate="no">

                {/* Progress bar */}
                <div className="otp-progress">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`otp-progress-step ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
                            <div className="otp-step-circle">
                                {step > i + 1
                                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                    : <span>{i + 1}</span>
                                }
                            </div>
                            <span className="otp-step-label">{stepLabels[i]}</span>
                        </div>
                    ))}
                    <div className="otp-progress-line">
                        <div className="otp-progress-fill" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
                    </div>
                </div>

                <div className="login-header" style={{ marginTop: '8px' }}>
                    <h1><span>{headings[step - 1]}</span></h1>
                    <p><span>{subheadings[step - 1]}</span></p>
                </div>

                {error && (
                    <div className="error-message">
                        <span>{error}</span>
                    </div>
                )}
                {message && (
                    <div className="success-message">
                        <span>{message}</span>
                    </div>
                )}

                {/* STEP 1 */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="login-form">
                        <div className="form-group">
                            <label><span>EMAIL ĐĂNG KÝ</span></label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="example@gmail.com"
                                required
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="login-btn" disabled={loading}>
                            <span>{loading ? 'Đang gửi...' : 'Gửi Mã OTP'}</span>
                        </button>
                        <div className="login-footer" style={{ marginTop: '16px' }}>
                            <Link to="/login" className="forgot-link">
                                <span>Quay lại đăng nhập</span>
                            </Link>
                        </div>
                    </form>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="login-form">
                        <div className="otp-input-group">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => otpRefs.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                    onPaste={i === 0 ? handleOtpPaste : undefined}
                                    className={`otp-digit-input ${digit ? 'filled' : ''}`}
                                    autoFocus={i === 0}
                                />
                            ))}
                        </div>

                        <div className="otp-resend">
                            {countdown > 0
                                ? <span>Gửi lại sau <strong>{countdown}s</strong></span>
                                : <button type="button" className="otp-resend-btn" onClick={handleResend} disabled={loading}>
                                    <span>Gửi lại mã OTP</span>
                                  </button>
                            }
                        </div>

                        <button type="submit" className="login-btn" disabled={loading || otp.join('').length < 6}>
                            <span>{loading ? 'Đang xác thực...' : 'Xác Nhận OTP'}</span>
                        </button>
                        <div className="login-footer" style={{ marginTop: '12px' }}>
                            <button
                                type="button"
                                className="forgot-link"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                onClick={() => { setStep(1); setError(''); setMessage(''); }}
                            >
                                <span>Đổi email khác</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="login-form">
                        <div className="form-group">
                            <label><span>MẬT KHẨU MỚI</span></label>
                            <div className="password-wrapper">
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Ít nhất 8 ký tự"
                                    required
                                    autoFocus
                                />
                                <button type="button" className="toggle-password-btn" onClick={() => setShowPwd(!showPwd)}>
                                    <EyeIcon open={showPwd} />
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label><span>XÁC NHẬN MẬT KHẨU</span></label>
                            <div className="password-wrapper">
                                <input
                                    type={showConfirmPwd ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới"
                                    required
                                />
                                <button type="button" className="toggle-password-btn" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                                    <EyeIcon open={showConfirmPwd} />
                                </button>
                            </div>
                        </div>
                        {newPassword && confirmPassword && (
                            <div className={`pwd-match-indicator ${newPassword === confirmPassword ? 'match' : 'no-match'}`}>
                                <span>{newPassword === confirmPassword ? 'Mật khẩu khớp' : 'Mật khẩu không khớp'}</span>
                            </div>
                        )}
                        <button type="submit" className="login-btn" disabled={loading}>
                            <span>{loading ? 'Đang cập nhật...' : 'Đặt Lại Mật Khẩu'}</span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;