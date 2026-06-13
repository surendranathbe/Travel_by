import { useState } from 'react';
import { signUpUser, signInUser } from '../utils/supabase';
import { Eye, EyeOff } from 'lucide-react';

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-11 2.9-11 6v2h22v-2c0-3.1-4.9-6-11-6z"/></svg>`;

export default function Auth({ onLoginSuccess, initialMode = 'signup' }) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [profilePic, setProfilePic] = useState(DEFAULT_AVATAR);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [stateField, setStateField] = useState('');

  // Password visibility eye toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email validation regex (standard mail format check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email === '' || emailRegex.test(email);

  // Password strength calculation based on specific user requirements:
  // - 2 to 5 characters: weak (Red color)
  // - 6 to 8 characters: good (Green color)
  // - More than 8 characters: strong password (Red color)
  const getPasswordStrength = (pass) => {
    if (!pass) return null;
    const len = pass.length;
    if (len >= 2 && len <= 5) {
      return { text: 'weak', color: '#ef4444' };
    } else if (len >= 6 && len <= 8) {
      return { text: 'good', color: '#22c55e' };
    } else if (len > 8) {
      return { text: 'strong password', color: '#e9ef44ff' };
    }
    return null;
  };

  const strength = getPasswordStrength(password);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProfilePic(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    // 1) Email format validation check
    if (!emailRegex.test(email)) {
      setAuthError('please enter a valid mail');
      // Scroll to the error popup or email input for immediate focus
      const emailEl = document.getElementById('auth-email');
      if (emailEl) emailEl.focus();
      return;
    }

    if (isSignUp) {
      if (!firstName.trim() || !lastName.trim()) {
        setAuthError('First name and last name are required.');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('the password is not matched');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const newUser = await signUpUser(
          email,
          password,
          profilePic,
          firstName,
          lastName,
          address,
          pinCode,
          stateField
        );
        alert('🎉 Account created successfully! Welcome to Travel_by.');
        onLoginSuccess(newUser);
      } else {
        const loggedUser = await signInUser(email, password);
        alert(`👋 Welcome back, ${loggedUser.first_name}!`);
        onLoginSuccess(loggedUser);
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-view">
      <div className="auth-page-container">
        <div className="auth-header">
          <h2>{isSignUp ? 'Create your Account' : 'Access Your Account'}</h2>
          <p className="auth-subtitle">
            {isSignUp
              ? 'Register with your email and details to experience self-drive freedom.'
              : 'Log in to continue planning your road trips and booking premium rides.'}
          </p>
          <div className="auth-title-underline"></div>
        </div>

        <div className="auth-card">
          {authError && (
            <div className="auth-error-alert" style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>
              ❌ {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {isSignUp ? (
              // ------------------- SIGN UP FORM -------------------
              <>
                {/* 1. Profile Picture Field with circular preview */}
                <div className="form-group profile-pic-group" style={{ position: 'relative' }}>
                  <label htmlFor="auth-profilepic">Profile Picture</label>
                  <div className="profile-pic-preview-container" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem' }}>
                    <img
                      src={profilePic || DEFAULT_AVATAR}
                      alt="Profile Preview"
                      className="profile-pic-preview"
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--color-accent)',
                        boxShadow: '0 4px 15px rgba(249, 115, 22, 0.25)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        flexShrink: 0
                      }}
                      onError={(e) => {
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <input
                        id="auth-profilepic"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="auth-profilepic"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          borderRadius: '8px',
                          padding: '10px 16px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          transition: 'var(--transition)',
                          textAlign: 'center',
                          textTransform: 'none',
                          fontSize: '0.9rem'
                        }}
                        className="file-upload-btn"
                      >
                        📁 Choose Image File
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                        Supports JPG, PNG (Max 5MB)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. First Name & 3. Last Name (Side by side) */}
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="auth-firstname">First Name</label>
                    <input
                      id="auth-firstname"
                      type="text"
                      placeholder="First name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label htmlFor="auth-lastname">Last Name</label>
                    <input
                      id="auth-lastname"
                      type="text"
                      placeholder="Last name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                {/* 4. Email Address with validation check & red pop message */}
                <div className="form-group" style={{ position: 'relative' }}>
                  <label htmlFor="auth-email">Email Address</label>
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {!isEmailValid && email.length > 0 && (
                    <div className="email-validation-popup" style={{
                      color: '#ffffff',
                      backgroundColor: '#ef4444',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      marginTop: '8px',
                      fontWeight: 'bold',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
                      zIndex: 5,
                      animation: 'fadeIn 0.2s ease-out'
                    }}>
                      ⚠️ please enter a valid mail
                    </div>
                  )}
                </div>

                {/* 5. Password with eye option & dynamic level popup */}
                <div className="form-group" style={{ position: 'relative' }}>
                  <label htmlFor="auth-password">Password</label>
                  <div className="password-input-wrapper" style={{ position: 'relative' }}>
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: '100%', paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0'
                      }}
                      aria-label="Toggle Password Visibility"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {/* Password strength pop-up level display */}
                  {strength && (
                    <div className="password-strength-popup" style={{
                      marginTop: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: strength.color === '#22c55e' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${strength.color}`,
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      color: strength.color,
                      animation: 'fadeIn 0.2s ease-out'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: strength.color,
                        display: 'inline-block'
                      }}></span>
                      <span>{strength.text}</span>
                    </div>
                  )}
                </div>

                {/* 6. Confirm Password with eye option */}
                <div className="form-group" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label htmlFor="auth-confirmpassword">Confirm Password</label>
                    {confirmPassword.length > 0 && password !== confirmPassword && (
                      <span className="password-mismatch-label-popup" style={{
                        color: '#ffffff',
                        backgroundColor: '#ef4444',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
                        animation: 'fadeIn 0.2s ease-out'
                      }}>
                        ⚠️ the password is not matched
                      </span>
                    )}
                  </div>
                  <div className="password-input-wrapper" style={{ position: 'relative' }}>
                    <input
                      id="auth-confirmpassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ width: '100%', paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0'
                      }}
                      aria-label="Toggle Confirm Password Visibility"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* 7. Address */}
                <div className="form-group">
                  <label htmlFor="auth-address">Address</label>
                  <input
                    id="auth-address"
                    type="text"
                    placeholder="Enter your street address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                {/* 8. Pin Code & 9. State */}
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="auth-pincode">Pin Code</label>
                    <input
                      id="auth-pincode"
                      type="text"
                      placeholder="e.g. 520001"
                      required
                      pattern="^[0-9]{6}$"
                      title="Please enter a valid 6-digit pin code"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label htmlFor="auth-state">State</label>
                    <input
                      id="auth-state"
                      type="text"
                      placeholder="e.g. Andhra Pradesh"
                      required
                      value={stateField}
                      onChange={(e) => setStateField(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-auth-submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </>
            ) : (
              // ------------------- LOGIN FORM -------------------
              <>
                {/* Email Address with validation check & red pop message */}
                <div className="form-group" style={{ position: 'relative' }}>
                  <label htmlFor="auth-email">Email Address</label>
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {!isEmailValid && email.length > 0 && (
                    <div className="email-validation-popup" style={{
                      color: '#ffffff',
                      backgroundColor: '#ef4444',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      marginTop: '8px',
                      fontWeight: 'bold',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
                      zIndex: 5,
                      animation: 'fadeIn 0.2s ease-out'
                    }}>
                      ⚠️ please enter a valid mail
                    </div>
                  )}
                </div>

                {/* Password with eye option & dynamic level popup */}
                <div className="form-group" style={{ position: 'relative' }}>
                  <label htmlFor="auth-password">Password</label>
                  <div className="password-input-wrapper" style={{ position: 'relative' }}>
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: '100%', paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0'
                      }}
                      aria-label="Toggle Password Visibility"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {strength && (
                    <div className="password-strength-popup" style={{
                      marginTop: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: strength.color === '#22c55e' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${strength.color}`,
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      color: strength.color,
                      animation: 'fadeIn 0.2s ease-out'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: strength.color,
                        display: 'inline-block'
                      }}></span>
                      <span>{strength.text}</span>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-auth-submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </>
            )}
          </form>

          {/* Social Sign-In section (displayed in place of the old avatar picker / custom image url) */}
          <div className="social-auth-section" style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
              Or Continue With
            </p>
            <div className="social-icons-row" style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Google Button */}
              <button
                type="button"
                className="social-icon-btn"
                onClick={() => alert('Sign-in with Google is coming soon!')}
                aria-label="Continue with Google"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: '0.3s ease'
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.513 0-6.36-2.853-6.36-6.363s2.848-6.363 6.36-6.363c1.554 0 2.98.56 4.092 1.488l3.187-3.19C19.29 2.228 15.973 1 12.24 1 5.922 1 1 5.925 1 12.24s4.922 11.24 11.24 11.24c6.32 0 11.24-4.925 11.24-11.24 0-.776-.08-1.536-.24-2.269H12.24z"/>
                </svg>
              </button>

              {/* Twitter Button */}
              <button
                type="button"
                className="social-icon-btn"
                onClick={() => alert('Sign-in with Twitter/X is coming soon!')}
                aria-label="Continue with Twitter"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: '0.3s ease'
                }}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                className="social-icon-btn"
                onClick={() => alert('Sign-in with Facebook is coming soon!')}
                aria-label="Continue with Facebook"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: '0.3s ease'
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </button>
            </div>

            {/* Form Toggle Link - exactly matching "Already i have account "login"" when on signup */}
            <div className="auth-toggle-link" style={{ textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
              {isSignUp ? (
                <span>
                  Already i have account{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      padding: '0',
                      textDecoration: 'underline',
                      fontSize: 'inherit'
                    }}
                  >
                    "login"
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      padding: '0',
                      textDecoration: 'underline',
                      fontSize: 'inherit'
                    }}
                  >
                    "Register"
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
