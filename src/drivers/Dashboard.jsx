import { useState, useEffect } from 'react';
import { updateDriver, fetchDriverDocuments, supabase } from '../utils/supabase';
import { User, Shield, LogOut, CheckCircle, Clock, MapPin, IndianRupee, Star, Settings, Power, Bell, Compass, Upload, Trash2, FileText, AlertCircle, Target, XCircle, MessageSquare, Menu, X, Wallet } from 'lucide-react';
import travelByLogo from '../assets/travel_by.png';
import DocumentForm from './DocumentForm';

function DropdownButton({ onClick, children, danger }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '0.6rem 0.85rem',
        border: 'none',
        background: hovered ? (danger ? '#fef2f2' : '#f1f5f9') : 'none',
        borderRadius: '8px',
        fontSize: '0.82rem',
        fontWeight: '750',
        color: danger ? '#ef4444' : (hovered ? '#0f172a' : '#475569'),
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxSizing: 'border-box'
      }}
    >
      {children}
    </button>
  );
}

export default function Dashboard({ driver, onLogout, onDriverUpdate }) {
  const [activeTab, setActiveTab] = useState('console'); // 'console', 'profile'
  const [isOnline, setIsOnline] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Subsection of Profile
  const [profileSubTab, setProfileSubTab] = useState('details'); // 'details', 'payments', 'documents'
  const [isProfileHovered, setIsProfileHovered] = useState(false);

  // Document verification modal notification states
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [showUnlegalModal, setShowUnlegalModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkDocStatus() {
      if (driver && driver.email) {
        try {
          // 1. Fetch live driver status from database to get the latest approved/rejected status
          let liveDriverStatus = driver.status;
          if (supabase) {
            const { data: freshDriver, error: freshErr } = await supabase
              .from('drivers')
              .select('status')
              .eq('email', driver.email.toLowerCase().trim())
              .maybeSingle();
            
            if (!freshErr && freshDriver) {
              liveDriverStatus = freshDriver.status;
              // Update local state if the status has changed
              if (freshDriver.status !== driver.status && onDriverUpdate) {
                onDriverUpdate({ ...driver, status: freshDriver.status });
              }
            }
          }

          // 2. Fetch live document verification status
          const docData = await fetchDriverDocuments(driver.email);
          if (docData) {
            let status = docData.verification_status;
            // Fallback: If verification_status column doesn't exist, compute it from live driver status
            if (!status) {
              if (liveDriverStatus === 'approved') status = 'verified';
              else if (liveDriverStatus === 'rejected') status = 'unlegal';
            }

            // Track status transitions to reset dismiss flags
            const lastSeenStatus = sessionStorage.getItem('last_seen_doc_status');
            if (status && lastSeenStatus !== status) {
              sessionStorage.removeItem('dismissed_doc_verified');
              sessionStorage.removeItem('dismissed_doc_unlegal');
              sessionStorage.setItem('last_seen_doc_status', status);
            }

            const dismissedVerified = sessionStorage.getItem('dismissed_doc_verified');
            const dismissedUnlegal = sessionStorage.getItem('dismissed_doc_unlegal');

            if (status === 'verified' && !dismissedVerified) {
              setShowVerifiedModal(true);
            } else if (status === 'unlegal' && !dismissedUnlegal) {
              setShowUnlegalModal(true);
              // Open documents tab automatically so they can fix uploads
              setActiveTab('profile');
              setProfileSubTab('documents');
            }
          }
        } catch (e) {
          console.warn("Failed to check document status", e);
        }
      }
    }

    // Run immediately on mount
    checkDocStatus();

    // Check periodically every 5 seconds to catch live Admin actions
    const checkInterval = setInterval(checkDocStatus, 5000);

    return () => clearInterval(checkInterval);
  }, [driver, onDriverUpdate]);
  
  // Editable fields
  const [firstName, setFirstName] = useState(driver.first_name || '');
  const [lastName, setLastName] = useState(driver.last_name || '');
  const [phone, setPhone] = useState(driver.phone || '');
  const [vehicleNumber, setVehicleNumber] = useState(driver.vehicle_number || '');
  const [licenseNumber, setLicenseNumber] = useState(driver.license_number || '');
  const [profilePic, setProfilePic] = useState(driver.profile_pic || '');

  // Simulated Ride state
  const [rideRequest, setRideRequest] = useState(null);
  const [activeRide, setActiveRide] = useState(null);

  // Simulated GPS ride requests simulation disabled since rides are not integrated yet
  const toggleOnline = () => {
    const newState = !isOnline;
    setIsOnline(newState);
    if (!newState) {
      setRideRequest(null);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !vehicleNumber.trim() || !licenseNumber.trim()) {
      alert("All fields are required.");
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await updateDriver(driver.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        license_number: licenseNumber.trim().toUpperCase(),
        profile_pic: profilePic
      });
      onDriverUpdate(updated);
      alert("🎉 Driver profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update profile: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAcceptRide = () => {
    setActiveRide(rideRequest);
    setRideRequest(null);
  };

  const handleRejectRide = () => {
    setRideRequest(null);
  };

  const handleCompleteRide = () => {
    alert(`🎉 Awesome! Ride completed successfully. You earned ₹${activeRide.fare}!`);
    setActiveRide(null);
  };

  // ----------------------------------------------------
  // Pending Approval Portal View (Light Mode)
  // ----------------------------------------------------
  if (driver.status === 'pending') {
    return (
      <div className="driver-dashboard-pending" style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div className="pending-card" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '28px',
          padding: '4rem 3rem',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
          textAlign: 'center'
        }}>
          {/* Logo container */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <img src={travelByLogo} alt="Travel_by Logo" style={{ height: '70px', width: 'auto' }} />
          </div>

          <Clock size={64} style={{ color: '#eab308', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Application Review</h2>
          
          <span style={{
            display: 'inline-block',
            backgroundColor: 'rgba(234, 179, 8, 0.08)',
            border: '1px solid rgba(234, 179, 8, 0.25)',
            color: '#d97706',
            padding: '4px 14px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1.5rem'
          }}>
            Status: Pending Approval
          </span>
          <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: '1.7', margin: '0 auto 2.5rem auto' }}>
            Hi <strong>{driver.first_name}</strong>, your application to join travel_by as a driver partner has been received! Our admin panel is reviewing your license <strong>{driver.license_number}</strong> and vehicle <strong>{driver.vehicle_number}</strong>.
            Applications are typically approved in less than 24 hours.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>✅</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>Profile Submitted</p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>Account successfully created</p>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 'bold' }}>COMPLETED</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>🔍</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>Background & Vehicle Checks</p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>Verifying license plates & logistics files</p>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 'bold' }}>IN PROGRESS</span>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '2rem 0' }}></div>

          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: '1px solid #fca5a5',
              color: '#ef4444',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <LogOut size={16} />
            <span>Logout Portal</span>
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Approved Driver Portal Console View (Light Mode)
  // ----------------------------------------------------
  return (
    <div className="driver-dashboard-approved" style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .stats-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 1.25rem;
        }
        .stat-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.01);
          transition: all 0.2s ease;
        }
        .stat-icon-wrapper {
          padding: 12px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
        }
        .stat-val {
          font-size: 1.4rem;
          font-weight: bold;
          margin: 4px 0 0 0;
          color: #0f172a;
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-header-badge {
            display: none !important;
          }
          .driver-header-logo {
            height: 48px !important;
            width: auto !important;
            flex-shrink: 0 !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .driver-dashboard-approved header {
            padding: 0.5rem 1rem !important;
            gap: 8px !important;
          }
          .online-toggle-btn {
            padding: 0.35rem 0.75rem !important;
            font-size: 0.72rem !important;
            gap: 4px !important;
          }
          .online-toggle-btn span {
            font-size: 0.72rem !important;
          }
          .stats-grid {
            gap: 8px !important;
          }
          .stat-card {
            padding: 0.75rem 0.5rem !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 6px !important;
            border-radius: 12px !important;
          }
          .stat-icon-wrapper {
            padding: 8px !important;
            border-radius: 10px !important;
          }
          .stat-icon-wrapper svg {
            width: 18px !important;
            height: 18px !important;
          }
          .stat-label {
            font-size: 0.58rem !important;
            letter-spacing: 0.02em !important;
          }
          .stat-val {
            font-size: 0.95rem !important;
            margin-top: 2px !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-only-flex {
            display: none !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
      {/* Header (Light Mode) */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 10
      }}>
        {/* Large Logo and Console Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Hamburger menu button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              padding: '4px',
              display: 'none', // Shown only on mobile via class .mobile-menu-btn
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="mobile-menu-btn"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <img src={travelByLogo} alt="Travel_by Logo" className="driver-header-logo" style={{ height: '70px', width: 'auto', display: 'block', flexShrink: 0 }} />
          <span 
            className="mobile-header-badge"
            style={{
              fontSize: '0.65rem',
              background: 'linear-gradient(90deg, #0ea5e9, #10b981)',
              color: '#ffffff',
              fontWeight: '900',
              padding: '4px 10px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.2)'
            }}
          >
            Driver Console
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={toggleOnline}
            className="online-toggle-btn"
            style={{
              backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: isOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              color: isOnline ? '#059669' : '#ef4444',
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.25s ease'
            }}
          >
            <Power size={14} style={{ color: isOnline ? '#10b981' : '#ef4444' }} />
            <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#10b981' : '#ef4444',
              display: 'inline-block'
            }} />
          </button>

          {/* Quick Driver Profile with Hover Menu */}
          <div 
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
            className="desktop-only"
            style={{ 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer', 
              padding: '6px 12px', 
              borderRadius: '12px', 
              transition: 'background-color 0.2s', 
              backgroundColor: isProfileHovered ? '#f1f5f9' : 'transparent',
              zIndex: 99
            }}
          >
            <img src={driver.profile_pic} alt="Avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #0ea5e9', objectFit: 'cover' }} />
            <div style={{ textAlign: 'left' }} className="desktop-only">
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>{driver.first_name} {driver.last_name}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>{driver.vehicle_type} Partner</p>
            </div>

            {/* Top-down Hover Dropdown Menu */}
            {isProfileHovered && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '200px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 999
              }}>
                <DropdownButton
                  onClick={() => {
                    setActiveTab('profile');
                    setProfileSubTab('details');
                  }}
                >
                  <User size={14} />
                  <span>Profile Details</span>
                </DropdownButton>
                <DropdownButton
                  onClick={() => {
                    setActiveTab('profile');
                    setProfileSubTab('payments');
                  }}
                >
                  <IndianRupee size={14} />
                  <span>Payment History</span>
                </DropdownButton>
                <DropdownButton
                  onClick={() => {
                    setActiveTab('profile');
                    setProfileSubTab('documents');
                  }}
                >
                  <FileText size={14} />
                  <span>Personal Documents</span>
                </DropdownButton>
                <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />
                <DropdownButton
                  onClick={onLogout}
                  danger
                >
                  <LogOut size={14} />
                  <span>Logout Portal</span>
                </DropdownButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-start'
          }}
          className="mobile-only-flex"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '280px',
              backgroundColor: '#ffffff',
              height: '100%',
              boxShadow: '4px 0 25px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '2rem 1.5rem',
              boxSizing: 'border-box',
              justifyContent: 'space-between',
              animation: 'slideInLeft 0.25s ease-out'
            }}
          >
            <div>
              {/* Drawer Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <img src={travelByLogo} alt="Travel_by Logo" style={{ height: '70px', width: 'auto' }} />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Driver Profile Section in Mobile Drawer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem'
              }}>
                <img 
                  src={driver.profile_pic} 
                  alt="Avatar" 
                  style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: '50%', 
                    border: '2px solid #0ea5e9', 
                    objectFit: 'cover' 
                  }} 
                />
                <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {driver.first_name} {driver.last_name}
                  </p>
                  <p style={{ margin: '2px 0 4px 0', fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {driver.email}
                  </p>
                  <span style={{
                    fontSize: '0.62rem',
                    background: 'rgba(14, 165, 233, 0.08)',
                    color: '#0ea5e9',
                    fontWeight: '800',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    display: 'inline-block'
                  }}>
                    {driver.vehicle_type} partner
                  </span>
                </div>
              </div>

              {/* Drawer Nav links */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => { setActiveTab('console'); setIsMobileMenuOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    border: 'none',
                    background: activeTab === 'console' ? 'rgba(14, 165, 233, 0.06)' : 'none',
                    color: activeTab === 'console' ? '#0ea5e9' : '#475569',
                    borderRadius: '12px',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Compass size={18} />
                  <span>Duty Console</span>
                </button>

                <button
                  onClick={() => { setActiveTab('daily_target'); setIsMobileMenuOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    border: 'none',
                    background: activeTab === 'daily_target' ? 'rgba(14, 165, 233, 0.06)' : 'none',
                    color: activeTab === 'daily_target' ? '#0ea5e9' : '#475569',
                    borderRadius: '12px',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Target size={18} style={{ flexShrink: 0 }} />
                  <span style={{ lineHeight: '1.2' }}>Total Accepted rides of daily target</span>
                </button>

                <button
                  onClick={() => { setActiveTab('cancel_rides'); setIsMobileMenuOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    border: 'none',
                    background: activeTab === 'cancel_rides' ? 'rgba(14, 165, 233, 0.06)' : 'none',
                    color: activeTab === 'cancel_rides' ? '#0ea5e9' : '#475569',
                    borderRadius: '12px',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <XCircle size={18} style={{ flexShrink: 0 }} />
                  <span style={{ lineHeight: '1.2' }}>Cancel rides</span>
                </button>

                <button
                  onClick={() => { setActiveTab('reviews_ratings'); setIsMobileMenuOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    border: 'none',
                    background: activeTab === 'reviews_ratings' ? 'rgba(14, 165, 233, 0.06)' : 'none',
                    color: activeTab === 'reviews_ratings' ? '#0ea5e9' : '#475569',
                    borderRadius: '12px',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <MessageSquare size={18} style={{ flexShrink: 0 }} />
                  <span style={{ lineHeight: '1.2' }}>Customer rating and review message</span>
                </button>

                <button
                  onClick={() => { setActiveTab('bank_account'); setIsMobileMenuOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    border: 'none',
                    background: activeTab === 'bank_account' ? 'rgba(14, 165, 233, 0.06)' : 'none',
                    color: activeTab === 'bank_account' ? '#0ea5e9' : '#475569',
                    borderRadius: '12px',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Wallet size={18} style={{ flexShrink: 0 }} />
                  <span style={{ lineHeight: '1.2' }}>Bank Account</span>
                </button>

                <button
                  onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    border: 'none',
                    background: activeTab === 'profile' ? 'rgba(14, 165, 233, 0.06)' : 'none',
                    color: activeTab === 'profile' ? '#0ea5e9' : '#475569',
                    borderRadius: '12px',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Settings size={18} />
                  <span>Profile Settings</span>
                </button>
              </nav>
            </div>

            <button
              onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                border: '1px solid #fca5a5',
                background: 'none',
                color: '#ef4444',
                borderRadius: '12px',
                textAlign: 'left',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={18} />
              <span>Logout Portal</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 75px)' }}>
        
        {/* Navigation Sidebar (Light Mode) */}
        <aside style={{
          width: '240px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }} className="desktop-only">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('console')}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                border: 'none',
                background: activeTab === 'console' ? 'rgba(14, 165, 233, 0.06)' : 'none',
                color: activeTab === 'console' ? '#0ea5e9' : '#475569',
                borderRadius: '12px',
                textAlign: 'left',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <Compass size={18} />
              <span>Duty Console</span>
            </button>

            <button
              onClick={() => setActiveTab('daily_target')}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                border: 'none',
                background: activeTab === 'daily_target' ? 'rgba(14, 165, 233, 0.06)' : 'none',
                color: activeTab === 'daily_target' ? '#0ea5e9' : '#475569',
                borderRadius: '12px',
                textAlign: 'left',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <Target size={18} style={{ flexShrink: 0 }} />
              <span style={{ lineHeight: '1.2' }}>Total Accepted rides of daily target</span>
            </button>

            <button
              onClick={() => setActiveTab('cancel_rides')}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                border: 'none',
                background: activeTab === 'cancel_rides' ? 'rgba(14, 165, 233, 0.06)' : 'none',
                color: activeTab === 'cancel_rides' ? '#0ea5e9' : '#475569',
                borderRadius: '12px',
                textAlign: 'left',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <XCircle size={18} style={{ flexShrink: 0 }} />
              <span style={{ lineHeight: '1.2' }}>Cancel rides</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews_ratings')}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                border: 'none',
                background: activeTab === 'reviews_ratings' ? 'rgba(14, 165, 233, 0.06)' : 'none',
                color: activeTab === 'reviews_ratings' ? '#0ea5e9' : '#475569',
                borderRadius: '12px',
                textAlign: 'left',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <MessageSquare size={18} style={{ flexShrink: 0 }} />
              <span style={{ lineHeight: '1.2' }}>Customer rating and review message</span>
            </button>

            <button
              onClick={() => setActiveTab('bank_account')}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                border: 'none',
                background: activeTab === 'bank_account' ? 'rgba(14, 165, 233, 0.06)' : 'none',
                color: activeTab === 'bank_account' ? '#0ea5e9' : '#475569',
                borderRadius: '12px',
                textAlign: 'left',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <Wallet size={18} style={{ flexShrink: 0 }} />
              <span style={{ lineHeight: '1.2' }}>Bank Account</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                border: 'none',
                background: activeTab === 'profile' ? 'rgba(14, 165, 233, 0.06)' : 'none',
                color: activeTab === 'profile' ? '#0ea5e9' : '#475569',
                borderRadius: '12px',
                textAlign: 'left',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <Settings size={18} />
              <span>Profile Settings</span>
            </button>
          </nav>

          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '0.85rem 1.25rem',
              border: '1px solid #fca5a5',
              background: 'none',
              color: '#ef4444',
              borderRadius: '12px',
              textAlign: 'left',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <LogOut size={18} />
            <span>Logout Portal</span>
          </button>
        </aside>

        {/* Dashboard Panels */}
        <main style={{ flex: 1, padding: '2rem', boxSizing: 'border-box', overflowY: 'auto' }}>
          
          {activeTab === 'console' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Duty Console Cards */}
              {isOnline && (
                <div className="stats-grid">
                  {/* Stat 1 */}
                  <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                      <IndianRupee size={24} />
                    </div>
                    <div>
                      <span className="stat-label">Today's Earnings</span>
                      <h3 className="stat-val">₹0.00</h3>
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(14, 165, 233, 0.08)', color: '#0ea5e9' }}>
                      <Compass size={24} />
                    </div>
                    <div>
                      <span className="stat-label">Total Rides</span>
                      <h3 className="stat-val">0/30</h3>
                    </div>
                  </div>

                  {/* Stat 3 */}
                  <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', color: '#eab308' }}>
                      <Star size={24} />
                    </div>
                    <div>
                      <span className="stat-label">Partner Rating</span>
                      <h3 className="stat-val">4.95 ★</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Active / Idle Duty Simulator Screen */}
              <div style={{
                backgroundColor: '#ffffff',
                border: isOnline ? '1.5px solid rgba(16, 185, 129, 0.3)' : '1.5px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '24px',
                padding: '2.5rem',
                minHeight: '340px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isOnline ? '0 10px 30px rgba(16, 185, 129, 0.04)' : '0 10px 30px rgba(239, 68, 68, 0.04)',
                transition: 'all 0.3s ease'
              }}>
                {!isOnline && !activeRide && (
                  <>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                      <Power size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 8px 0', color: '#0f172a' }}>Currently Offline</h3>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '380px', margin: '0 0 1.5rem 0', lineHeight: '1.6' }}>
                      Toggle your status to online at the top of the console to start receiving local rider ride requests.
                    </p>
                    <button
                      onClick={toggleOnline}
                      style={{
                        backgroundColor: '#10b981',
                        color: '#fff',
                        border: 'none',
                        padding: '0.75rem 1.75rem',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      Go Online Now
                    </button>
                  </>
                )}

                {isOnline && !rideRequest && !activeRide && (
                  <>
                    <div className="searching-container" style={{ position: 'relative', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                        <Bell size={24} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 8px 0', color: '#0f172a' }}>Waiting for Ride Requests...</h3>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '360px', margin: '0 0 1rem 0' }}>
                      Your GPS position is active. Keeping look out for logistics bookings nearby.
                    </p>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Simulating GPS Ping...</span>
                  </>
                )}

                {/* Ride Request incoming card */}
                {rideRequest && (
                  <div className="ride-req-card" style={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #0ea5e9',
                    borderRadius: '20px',
                    padding: '2rem',
                    maxWidth: '440px',
                    width: '100%',
                    boxShadow: '0 15px 30px rgba(14, 165, 233, 0.1), 0 1px 3px rgba(0, 0, 0, 0.02)',
                    position: 'relative',
                    zIndex: 10,
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <span style={{
                        backgroundColor: 'rgba(14, 165, 233, 0.08)',
                        color: '#0ea5e9',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        textTransform: 'uppercase'
                      }}>
                        ⚡ Incoming Ride Request
                      </span>
                      <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{rideRequest.fare}</span>
                    </div>

                    <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.05rem', fontWeight: '800' }}>Passenger: {rideRequest.passenger}</h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <MapPin size={16} style={{ color: '#10b981', marginTop: '3px', flexShrink: 0 }} />
                        <div>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Pick Up Location</p>
                          <p style={{ margin: 0, fontSize: '0.88rem', color: '#1e293b' }}>{rideRequest.from}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <MapPin size={16} style={{ color: '#ef4444', marginTop: '3px', flexShrink: 0 }} />
                        <div>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Drop Off Location</p>
                          <p style={{ margin: 0, fontSize: '0.88rem', color: '#1e293b' }}>{rideRequest.to}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                      <button
                        onClick={handleRejectRide}
                        style={{
                          flex: 1,
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        Decline
                      </button>

                      <button
                        onClick={handleAcceptRide}
                        style={{
                          flex: 2,
                          backgroundColor: '#0ea5e9',
                          border: 'none',
                          color: '#ffffff',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(14, 165, 233, 0.2)',
                          transition: 'all 0.2s'
                        }}
                      >
                        Accept Ride
                      </button>
                    </div>
                  </div>
                )}

                {/* Active Ride Screen */}
                {activeRide && (
                  <div style={{
                    width: '100%',
                    maxWidth: '520px',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '20px',
                    padding: '2rem',
                    textAlign: 'left',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '800' }}>Active Transit</span>
                        <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 'bold' }}>Trip to drop destination</h4>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.25rem', display: 'block' }}>₹{activeRide.fare}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Est. Fare</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Passenger</p>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 'bold' }}>{activeRide.passenger}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <MapPin size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Origin Address</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b' }}>{activeRide.from}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <MapPin size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Destination Address</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b' }}>{activeRide.to}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleCompleteRide}
                      style={{
                        width: '100%',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)'
                      }}
                    >
                      <CheckCircle size={18} />
                      <span>Complete Trip / Collect Fare</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ maxWidth: '640px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '850', margin: '0 0 4px 0', color: '#0f172a' }}>Profile & Vehicle Settings</h2>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Review and modify your driver partner details.</p>
                </div>
                
                {/* Dropdown Menu to see different profile sections */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Section:</span>
                  <select
                    value={profileSubTab}
                    onChange={(e) => setProfileSubTab(e.target.value)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '2px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '0.6rem 2.5rem 0.6rem 1rem',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: '#0f172a',
                      outline: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23475569\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="details">Profile Details</option>
                    <option value="payments">Payment History</option>
                    <option value="documents">Personal Documents</option>
                  </select>
                </div>
              </div>

              {/* Sub-section 1: Profile Details */}
              {profileSubTab === 'details' && (
                <form onSubmit={handleProfileUpdate} style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '24px',
                  padding: '2.5rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={editInputStyle}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={editInputStyle}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Phone Number</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={editInputStyle}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Vehicle Number Plate</label>
                      <input
                        type="text"
                        required
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        style={editInputStyle}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Driving License Number</label>
                      <input
                        type="text"
                        required
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        style={editInputStyle}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Email (Read-only)</label>
                      <input
                        type="email"
                        disabled
                        value={driver.email}
                        style={{ ...editInputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Avatar Image URL</label>
                    <input
                      type="text"
                      value={profilePic}
                      onChange={(e) => setProfilePic(e.target.value)}
                      style={editInputStyle}
                      placeholder="Provide image link"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    style={{
                      backgroundColor: '#0ea5e9',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.9rem 1.5rem',
                      fontWeight: '750',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      marginTop: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 15px rgba(14, 165, 233, 0.15)'
                    }}
                  >
                    {isUpdating ? 'Saving Changes...' : 'Save Settings'}
                  </button>
                </form>
              )}

              {/* Sub-section 2: Payment History */}
              {profileSubTab === 'payments' && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '24px',
                  padding: '2.5rem 2rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem' }}>Payment History</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Total Paid Earnings</p>
                      <h4 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>₹0.00</h4>
                    </div>
                    <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Pending Balance</p>
                      <h4 style={{ margin: '8px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>₹0.00</h4>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed #cbd5e1', borderRadius: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'inline-flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <IndianRupee size={20} />
                    </div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#0f172a', fontWeight: 'bold' }}>No Transactions Yet</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
                      Your payment history is currently empty. Once a payout is processed, it will display here.
                    </p>
                  </div>
                </div>
              )}

              {/* Sub-section 3: Personal Documents (Form from DocumentForm.jsx) */}
              {profileSubTab === 'documents' && (
                <DocumentForm driver={driver} />
              )}
            </div>
          )}

          {(activeTab === 'daily_target' || activeTab === 'cancel_rides' || activeTab === 'reviews_ratings' || activeTab === 'bank_account') && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '2.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: '#64748b',
                textTransform: 'lowercase',
                margin: 0
              }}>
                comming soon
              </h2>
            </div>
          )}

        </main>
      </div>

      {/* Document Verified Popup Modal */}
      {showVerifiedModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '850', color: '#0f172a', margin: '0 0 8px 0' }}>Verification Successful</h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
              your deatils has been verified
            </p>
            <button
              onClick={() => {
                setShowVerifiedModal(false);
                sessionStorage.setItem('dismissed_doc_verified', 'true');
              }}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 2rem',
                fontWeight: '750',
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Document Unlegal Popup Modal */}
      {showUnlegalModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, border: '2px solid #ef4444' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '850', color: '#991b1b', margin: '0 0 8px 0' }}>Verification Failed</h3>
            <p style={{ color: '#ef4444', fontSize: '0.95rem', fontWeight: 'bold', margin: '0 0 6px 0' }}>
              you have submiteed unleagal document
            </p>
            <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
              your verification has been failed
            </p>
            <button
              onClick={() => {
                setShowUnlegalModal(false);
                sessionStorage.setItem('dismissed_doc_unlegal', 'true');
              }}
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 2rem',
                fontWeight: '750',
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 99999,
  padding: '1.5rem'
};

const modalContentStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '24px',
  border: '1px solid #e2e8f0',
  padding: '2.5rem 2rem',
  maxWidth: '420px',
  width: '100%',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const editInputStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  padding: '0.8rem 1rem',
  color: '#0f172a',
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};
