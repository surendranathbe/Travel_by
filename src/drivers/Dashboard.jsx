import { useState } from 'react';
import { updateDriver } from '../utils/supabase';
import { User, Shield, LogOut, CheckCircle, Clock, MapPin, DollarSign, Star, Settings, Power, Bell, Compass } from 'lucide-react';
import travelByLogo from '../assets/travel_by.png';

export default function Dashboard({ driver, onLogout, onDriverUpdate }) {
  const [activeTab, setActiveTab] = useState('console'); // 'console', 'profile'
  const [isOnline, setIsOnline] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
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

  // Trigger simulated incoming ride requests when online
  useState(() => {
    let interval;
    if (isOnline && !rideRequest && !activeRide) {
      interval = setInterval(() => {
        // 10% chance of getting a mock request every 5 seconds
        if (Math.random() > 0.6) {
          setRideRequest({
            id: 'ride-' + Math.floor(Math.random() * 10000),
            passenger: ['Aditya Kumar', 'Priya Patel', 'Nikhil Reddy', 'Sneha Sharma'][Math.floor(Math.random() * 4)],
            from: ['Jubilee Hills Road 36', 'Secunderabad Station', 'Gachibowli DLF IT Park', 'Rajiv Gandhi International Airport'][Math.floor(Math.random() * 4)],
            to: ['Begumpet Airport', 'Inorbit Mall Hitec City', 'Charminar Heritage Area', 'Nampally Station'][Math.floor(Math.random() * 4)],
            fare: (50 + Math.floor(Math.random() * 450)),
            distance: (1.5 + Math.random() * 22).toFixed(1) + ' km'
          });
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isOnline, rideRequest, activeRide]);

  // Hook triggered when online state changes
  const toggleOnline = () => {
    const newState = !isOnline;
    setIsOnline(newState);
    if (!newState) {
      setRideRequest(null);
    } else {
      // Prompt immediate mock ride request
      setTimeout(() => {
        setRideRequest({
          id: 'ride-9021',
          passenger: 'Srinivas Bezawada',
          from: 'Jubilee Hills Road 45, Hyderabad',
          to: 'Novotel Hitec City Hotel',
          fare: 380,
          distance: '8.4 km'
        });
      }, 1500);
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
            <img src={travelByLogo} alt="Travel_by Logo" style={{ height: '48px', width: 'auto' }} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src={travelByLogo} alt="Travel_by Logo" style={{ height: '48px', width: 'auto', display: 'block' }} />
          <span style={{
            fontSize: '0.65rem',
            background: 'linear-gradient(90deg, #0ea5e9, #10b981)',
            color: '#ffffff',
            fontWeight: '900',
            padding: '4px 10px',
            borderRadius: '999px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.2)'
          }}>
            Driver Console
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Online Toggle Button */}
          <button
            onClick={toggleOnline}
            style={{
              backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.08)' : '#f1f5f9',
              border: isOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #cbd5e1',
              color: isOnline ? '#059669' : '#475569',
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
            <Power size={14} style={{ color: isOnline ? '#10b981' : '#64748b' }} />
            <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#10b981' : '#64748b',
              display: 'inline-block'
            }} />
          </button>

          {/* Quick Driver Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={driver.profile_pic} alt="Avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #0ea5e9', objectFit: 'cover' }} />
            <div style={{ textAlign: 'left' }} className="desktop-only">
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>{driver.first_name} {driver.last_name}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>{driver.vehicle_type} Partner</p>
            </div>
          </div>
        </div>
      </header>

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
              
              {/* Top Banner Row */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
              }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: '850', margin: '0 0 4px 0', color: '#0f172a' }}>Welcome Back, {driver.first_name}!</h1>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Review earnings, toggle online availability, and pick up rider logistics requests.</p>
                </div>
                
                {/* Mobile Tab Selector */}
                <div style={{ display: 'flex', gap: '8px' }} className="mobile-only">
                  <button 
                    onClick={() => setActiveTab('console')}
                    style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', background: activeTab === 'console' ? '#0ea5e9' : '#f1f5f9', color: activeTab === 'console' ? '#fff' : '#475569', fontSize: '0.75rem', fontWeight: 'bold' }}
                  >
                    Console
                  </button>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', background: activeTab === 'profile' ? '#0ea5e9' : '#f1f5f9', color: activeTab === 'profile' ? '#fff' : '#475569', fontSize: '0.75rem', fontWeight: 'bold' }}
                  >
                    Settings
                  </button>
                  <button 
                    onClick={onLogout}
                    style={{ padding: '6px 12px', border: '1px solid #fca5a5', borderRadius: '8px', background: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold' }}
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Duty Console Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem'
              }}>
                {/* Stat 1 */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Earnings</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '4px 0 0 0', color: '#0f172a' }}>₹1,540.20</h3>
                  </div>
                </div>

                {/* Stat 2 */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: 'rgba(14, 165, 233, 0.08)', color: '#0ea5e9' }}>
                    <Compass size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Rides</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '4px 0 0 0', color: '#0f172a' }}>28 Completed</h3>
                  </div>
                </div>

                {/* Stat 3 */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: 'rgba(234, 179, 8, 0.08)', color: '#eab308' }}>
                    <Star size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Partner Rating</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '4px 0 0 0', color: '#0f172a' }}>4.95 ★</h3>
                  </div>
                </div>
              </div>

              {/* Active / Idle Duty Simulator Screen */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
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
                boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
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
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', margin: '0 0 4px 0', color: '#0f172a' }}>Profile & Vehicle Settings</h2>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>Review and modify your driver partner details. Save credentials to database.</p>
              </div>

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
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

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
