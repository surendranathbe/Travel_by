import { useState } from 'react';
import { signInAdmin } from '../utils/supabase';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import travelByLogo from '../assets/travel_by.png';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const adminData = await signInAdmin(username, password);
      onLoginSuccess(adminData);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="admin-login-card" style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.01)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #f97316, transparent)'
        }} />

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.75rem'
        }}>
          {/* Logo Container: Rounded Premium White Box with glowing orange highlight */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '16px 32px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 28px rgba(249, 115, 22, 0.08), 0 4px 10px rgba(0, 0, 0, 0.05)',
            border: '3px solid #f97316',
            marginBottom: '1.25rem',
            position: 'relative',
            transform: 'translateY(0)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          className="admin-logo-box"
          >
            {/* Top mini pill tag to identify */}
            <span style={{
              position: 'absolute',
              top: '-10px',
              backgroundColor: '#f97316',
              color: '#ffffff',
              fontSize: '0.6rem',
              fontWeight: '900',
              padding: '2px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: '0 2px 6px rgba(249, 115, 22, 0.2)'
            }}>
              Brand Identity
            </span>
            
            <img 
              src={travelByLogo} 
              alt="Travel_by Corporate Logo" 
              style={{ 
                height: '52px', 
                width: 'auto', 
                display: 'block'
              }} 
            />
          </div>

          {/* Highlighted Interactive Logo Description Box */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            borderRadius: '14px',
            padding: '0.75rem 1rem',
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.78rem',
              lineHeight: '1.4',
              color: '#475569',
              fontWeight: '500'
            }}>
              <strong style={{ color: '#f97316', fontWeight: '800' }}>travel_by</strong> represents{' '}
              <span style={{ color: '#0f172a', borderBottom: '1px dotted #f97316', paddingBottom: '1px', fontWeight: '700' }}>
                Premium Smart Rides
              </span>
              ,{' '}
              <span style={{ color: '#0f172a', borderBottom: '1px dotted #f97316', paddingBottom: '1px', fontWeight: '700' }}>
                Interstate Flatbed Transport
              </span>
              , and{' '}
              <span style={{ color: '#0f172a', borderBottom: '1px dotted #f97316', paddingBottom: '1px', fontWeight: '700' }}>
                Door-to-Door Logistics
              </span>
              .
            </p>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0', letterSpacing: '-0.02em' }}>
            Admin login
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.05em' }}>
            Secure Authentication Portal
          </span>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            color: '#ef4444',
            padding: '0.85rem',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
          {/* Username */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <User size={18} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Surendra@admin"
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f97316'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
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
                  borderRadius: '12px',
                  padding: '0.85rem 3rem 0.85rem 2.75rem',
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f97316'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#f97316',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '1rem',
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? 'Verifying Admin...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
