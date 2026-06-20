import { useState } from 'react';
import { signUpDriver } from '../utils/supabase';
import { Lock, Mail, User, Phone, Shield, Car, Key, FileText, ArrowLeft, Camera } from 'lucide-react';
import travelByLogo from '../assets/travel_by.png';

export default function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [profilePic, setProfilePic] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProfilePicChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim() || !phone.trim() || !vehicleNumber.trim() || !licenseNumber.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const newDriver = await signUpDriver(
        email.trim(),
        password,
        firstName.trim(),
        lastName.trim(),
        phone.trim(),
        vehicleType,
        vehicleNumber.trim().toUpperCase(),
        licenseNumber.trim().toUpperCase(),
        profilePic
      );
      
      setSuccessMsg('🎉 Driver application submitted successfully! Please wait for approval.');
      setTimeout(() => {
        onRegisterSuccess(newDriver);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit driver application.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="driver-register-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      padding: '2rem 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Light Ambient Glow Elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div className="driver-register-card" style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '28px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '680px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Glow effect at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '240px',
          height: '4px',
          background: 'linear-gradient(90deg, transparent, #10b981, #0ea5e9, transparent)'
        }} />

        {/* Back Link */}
        <button
          onClick={onNavigateToLogin}
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            padding: 0
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </button>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          {/* Logo Box */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '8px 24px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.1)',
            border: '2px solid #10b981',
            marginBottom: '1rem'
          }}>
            <img 
              src={travelByLogo} 
              alt="Travel_by Corporate Logo" 
              style={{ 
                height: '36px', 
                width: 'auto', 
                display: 'block'
              }} 
            />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: '850', color: '#0f172a', margin: '0.25rem 0 0.15rem 0', letterSpacing: '-0.02em' }}>
            Driver Registration
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.05em' }}>
            Partner Onboarding Portal
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
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}>
            <Shield size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '14px',
            color: '#10b981',
            padding: '1rem',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}>
            <Shield size={16} style={{ color: '#10b981' }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* File Upload / Profile Preview Row */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #10b981' }}>
              <img 
                src={profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
                alt="Profile Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <label htmlFor="driver-file-input" style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '30px',
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <Camera size={14} style={{ color: '#fff' }} />
              </label>
              <input 
                id="driver-file-input"
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                style={{ display: 'none' }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#0f172a', fontWeight: '700' }}>Driver Portrait Photo</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>Provide a clean photo. Click on avatar camera icon to upload.</p>
            </div>
          </div>

          {/* Core Info Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            {/* First Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>First Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  style={inputStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>

            {/* Last Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  style={inputStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>

            {/* Email Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  style={inputStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={inputStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="8688119095"
                  style={inputStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>

            {/* Vehicle Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle Category</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Car size={16} />
                </span>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  style={{
                    ...inputStyle,
                    padding: '0.85rem 1rem 0.85rem 2.5rem',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '16px'
                  }}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                >
                  <option value="car">Car (Sedan / SUV)</option>
                  <option value="bike">Bike (Premium Smart Rides)</option>
                  <option value="auto">Auto Rickshaw</option>
                </select>
              </div>
            </div>

            {/* Vehicle Number */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle Number Plate</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Key size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="AP-27-CB-1644"
                  style={inputStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>

            {/* License Number */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Driving License Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <FileText size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="DL-123456789"
                  style={inputStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '1.1rem',
              fontWeight: '750',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '1rem',
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(16, 185, 129, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.15)';
            }}
          >
            {isLoading ? 'Submitting Application...' : 'Submit Partner Application'}
          </button>
        </form>

        {/* Existing driver option */}
        <div style={{
          marginTop: '1.75rem',
          textAlign: 'center',
          fontSize: '0.88rem',
          color: '#64748b'
        }}>
          Already applied?{' '}
          <button 
            onClick={onNavigateToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#10b981',
              fontWeight: '700',
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.88rem',
              textDecoration: 'underline'
            }}
          >
            Log In Here
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline styles for input reuse
const inputStyle = {
  width: '100%',
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '14px',
  padding: '0.85rem 1rem 0.85rem 2.5rem',
  color: '#0f172a',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.25s ease'
};

const handleInputFocus = (e) => {
  e.target.style.borderColor = '#10b981';
  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
};

const handleInputBlur = (e) => {
  e.target.style.borderColor = '#cbd5e1';
  e.target.style.boxShadow = 'none';
};
