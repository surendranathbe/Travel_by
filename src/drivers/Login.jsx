import { useState } from 'react';
import { signInDriver } from '../utils/supabase';
import { Lock, Mail, Eye, EyeOff, Car, Shield, ArrowRight } from 'lucide-react';
import travelByLogo from '../assets/travel_by.png';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const driverData = await signInDriver(email, password);
      onLoginSuccess(driverData);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid driver credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="driver-login-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Light Ambient Subtle Glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div className="driver-login-card" style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '28px',
        padding: '3.5rem 3rem',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Glow accent pill at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '240px',
          height: '4px',
          background: 'linear-gradient(90deg, transparent, #0ea5e9, #10b981, transparent)'
        }} />

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          {/* Logo Box with custom hover styles */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '12px 28px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(14, 165, 233, 0.1)',
            border: '2px solid #0ea5e9',
            marginBottom: '1.25rem',
            position: 'relative'
          }}>
            <span style={{
              position: 'absolute',
              top: '-10px',
              background: 'linear-gradient(90deg, #0ea5e9, #10b981)',
              color: '#ffffff',
              fontSize: '0.6rem',
              fontWeight: '900',
              padding: '2px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.2)'
            }}>
              DRIVER PARTNER
            </span>
            <img 
              src={travelByLogo} 
              alt="Travel_by Corporate Logo" 
              style={{ 
                height: '44px', 
                width: 'auto', 
                display: 'block'
              }} 
            />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '850', color: '#0f172a', margin: '0.5rem 0 0.25rem 0', letterSpacing: '-0.02em' }}>
            Driver Login
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.05em' }}>
            Access Your Partner Console
          </span>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '14px',
            color: '#ef4444',
            padding: '1rem',
            fontSize: '0.85rem',
            marginBottom: '1.75rem',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}>
            <Shield size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
          {/* Email Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@travelby.com"
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '1rem 1rem 1rem 3rem',
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.25s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0ea5e9';
                  e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '1rem 3.25rem 1rem 3rem',
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.25s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0ea5e9';
                  e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1.15rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '1.1rem',
              fontWeight: '750',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '0.75rem',
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 20px rgba(14, 165, 233, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(14, 165, 233, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(14, 165, 233, 0.15)';
            }}
          >
            {isLoading ? 'Authenticating...' : (
              <>
                <span>Sign In to Drive</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          margin: '2rem 0'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>New to travel_by?</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
        </div>

        {/* Navigation to Register */}
        <button
          onClick={onNavigateToRegister}
          style={{
            background: 'none',
            border: '1px solid #cbd5e1',
            borderRadius: '14px',
            color: '#0f172a',
            width: '100%',
            padding: '0.9rem',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
        >
          <Car size={16} style={{ color: '#10b981' }} />
          <span>Apply to Drive / Register</span>
        </button>
      </div>
    </div>
  );
}
