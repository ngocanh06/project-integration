import { getStoredToken } from './tokenStorage';

/**
 * Add authorization header to requests
 */
export const getAuthHeaders = () => {
  const token = getStoredToken();
  return {
    Authorization: token ? `Bearer ${token}` : ''
  };
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();

    return expirationTime < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Decode JWT token
 */
export const decodeToken = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token) => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return null;

  return new Date(payload.exp * 1000);
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  return {
    isStrong: Object.values(requirements).every(r => r),
    requirements
  };
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (password) => {
  const { requirements } = validatePasswordStrength(password);
  const metRequirements = Object.values(requirements).filter(r => r).length;

  if (metRequirements <= 2) return 'Weak';
  if (metRequirements <= 3) return 'Fair';
  if (metRequirements <= 4) return 'Good';
  return 'Strong';
};
