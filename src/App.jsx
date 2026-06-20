import { useState, useEffect } from 'react';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Trips from './pages/Trips';
import Vehicles from './pages/Vehicles';
import ClientResponse from './pages/ClientResponse';
import ContactUs from './pages/ContactUs';
import BookingVehicles from './pages/BookingVehicles';
import Auth from './pages/Auth';
import BookRide from './pages/BookRide';
import travelByLogo from './assets/travel_by.png';
import Footer from './components/Footer';
import { Menu, X, User, Car, Compass, CreditCard, History, LogOut, Camera, Save } from 'lucide-react';
import { supabase, updateUser } from './utils/supabase';
import AdminLogin from './Admin/Login';
import AdminDashboard from './Admin/Dashboard';
import DriverLogin from './drivers/Login';
import DriverRegister from './drivers/Register';
import DriverDashboard from './drivers/Dashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // Default to signup
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [vehiclesFilter, setVehiclesFilter] = useState(null);
  const [isVehiclesDropdownOpen, setIsVehiclesDropdownOpen] = useState(false);
  const [isMobileVehiclesOpen, setIsMobileVehiclesOpen] = useState(false);
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem('travelBy_admin');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [driver, setDriver] = useState(() => {
    try {
      const stored = localStorage.getItem('travelBy_driver');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [driverAuthMode, setDriverAuthMode] = useState('login'); // 'login' or 'register'

  // Dashboard Modal States
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [dashboardActiveTab, setDashboardActiveTab] = useState('profile');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editProfilePic, setEditProfilePic] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('travelBy_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Run connection test on mount (fully safe since client returns null instead of throwing on missing config)
    if (supabase) {
      supabase.from('app_users').select('id').limit(1)
        .then(({ error }) => {
          if (error && (error.code === 'PGRST301' || error.message?.includes('JWT') || error.status === 401)) {
            console.error('❌ Supabase connection failed: Invalid API key or configuration.', error.message);
          } else if (error && error.message?.includes('Failed to fetch')) {
            console.error('❌ Supabase connection failed: Network error. Check your connection or Supabase URL.', error.message);
          } else {
            console.log('⚡ Supabase connection successfully established with project!');
          }
        })
        .catch((err) => {
          console.error('❌ Supabase health check query crashed:', err);
        });
    } else {
      console.warn('⚠️ Supabase client is not initialized. Please verify your environment variables in .env.');
    }
  }, []);

  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.header-avatar-badge-container')) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isProfileDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('travelBy_user');
    setUser(null);
    setCurrentPage('home');
    alert('Logged out successfully. Have a nice day! 👋');
  };

  const openDashboard = (tab = 'profile') => {
    if (!user) return;
    setDashboardActiveTab(tab);
    setEditFirstName(user.first_name || '');
    setEditLastName(user.last_name || '');
    setEditProfilePic(user.profile_pic || '');
    setIsDashboardModalOpen(true);
  };

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
        setEditProfilePic(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!editFirstName.trim() || !editLastName.trim()) {
      alert("First name and last name are required.");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const updatedUser = await updateUser(user.id, {
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        profile_pic: editProfilePic
      });

      localStorage.setItem('travelBy_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert("🎉 Profile updated successfully!");
      setIsDashboardModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update profile: " + (err.message || err));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('travelBy_user', JSON.stringify(userData));
    setUser(userData);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAuth = (mode) => {
    setAuthMode(mode);
    setCurrentPage('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageDetails = () => {
    switch (currentPage) {
      case 'about':
        return { title: 'About Us', subtitle: 'Learn more about our journey and values.' };
      case 'vehicles':
        return { 
          title: vehiclesFilter ? `Our Fleet: ${vehiclesFilter.charAt(0).toUpperCase() + vehiclesFilter.slice(1)}` : 'Our Premium Fleet', 
          subtitle: 'Explore our fleet of fully sanitized, clean, and top-tier vehicles.' 
        };
      case 'trips':
        return { title: 'Your Trips', subtitle: 'Plan and view your travel itineraries.' };
      case 'client-response':
        return { title: 'Client Reviews', subtitle: 'What our happy travelers say about us.' };
      case 'contact':
        return { title: 'Contact Us', subtitle: 'Get in touch with our 24/7 support team.' };
      case 'booking-vehicles':
        return { title: 'Booking Status', subtitle: 'Manage your active vehicle bookings.' };
      case 'book-ride':
        return { title: 'Book a Ride', subtitle: 'Start your journey today with Travel_by.' };
      case 'parcel-booking':
        return { title: 'Parcel Booking', subtitle: 'Secure door-to-door logistics delivery.' };
      case 'vehicle-transport':
        return { title: 'Vehicle Transport', subtitle: 'Interstate flatbed vehicle relocation.' };
      default:
        return null;
    }
  };

  const pageDetails = getPageDetails();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'about':
        return <AboutUs />;
      case 'auth':
        return <Auth onLoginSuccess={handleLoginSuccess} initialMode={authMode} key={authMode} />;
      case 'trips':
        return user ? <Trips /> : <Auth onLoginSuccess={handleLoginSuccess} initialMode="signup" key="signup" />;
      case 'vehicles':
        return user ? <Vehicles categoryFilter={vehiclesFilter} /> : <Auth onLoginSuccess={handleLoginSuccess} initialMode="signup" key="signup" />;
      case 'client-response':
        return user ? <ClientResponse /> : <Auth onLoginSuccess={handleLoginSuccess} initialMode="signup" key="signup" />;
      case 'contact':
        return user ? <ContactUs /> : <Auth onLoginSuccess={handleLoginSuccess} initialMode="signup" key="signup" />;
      case 'booking-vehicles':
        return user ? <BookingVehicles /> : <Auth onLoginSuccess={handleLoginSuccess} initialMode="signup" key="signup" />;
      case 'book-ride':
        return <BookRide />;
      case 'parcel-booking':
        return user ? (
          <div className="page-view flex-center-vertical" style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ margin: '2rem auto', padding: '3rem 2rem', borderRadius: '24px', background: '#ffffff', border: '1px dashed #cbd5e1', maxWidth: '500px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>📦</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>Parcel Booking</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                We are launching our direct door-to-door high-speed delivery service very soon. Stay tuned for updates!
              </p>
              <button 
                onClick={() => setCurrentPage('home')} 
                style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : <Auth onLoginSuccess={handleLoginSuccess} initialMode="signup" key="signup" />;
      case 'vehicle-transport':
        return user ? (
          <div className="page-view flex-center-vertical" style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ margin: '2rem auto', padding: '3rem 2rem', borderRadius: '24px', background: '#ffffff', border: '1px dashed #cbd5e1', maxWidth: '500px', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>🚛</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>Vehicle Transport</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Need to move your vehicle across cities? Our premium interstate flatbed vehicle logistics service is coming soon!
              </p>
              <button 
                onClick={() => setCurrentPage('home')} 
                style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : <Auth onLoginSuccess={handleLoginSuccess} initialMode="signup" key="signup" />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  const isAdminPath = window.location.pathname === '/admin';

  if (isAdminPath) {
    if (!admin) {
      return (
        <AdminLogin 
          onLoginSuccess={(data) => {
            setAdmin(data);
            localStorage.setItem('travelBy_admin', JSON.stringify(data));
          }} 
        />
      );
    }
    return (
      <AdminDashboard 
        admin={admin} 
        onLogout={() => {
          setAdmin(null);
          localStorage.removeItem('travelBy_admin');
        }} 
        onAdminUpdate={(updatedAdmin) => {
          setAdmin(updatedAdmin);
          localStorage.setItem('travelBy_admin', JSON.stringify(updatedAdmin));
        }}
      />
    );
  }

  const isDriverPath = window.location.pathname === '/driver' || window.location.pathname === '/drivers';

  if (isDriverPath) {
    if (!driver) {
      if (driverAuthMode === 'register') {
        return (
          <DriverRegister 
            onRegisterSuccess={(data) => {
              setDriver(data);
              localStorage.setItem('travelBy_driver', JSON.stringify(data));
            }}
            onNavigateToLogin={() => setDriverAuthMode('login')}
          />
        );
      }
      return (
        <DriverLogin 
          onLoginSuccess={(data) => {
            setDriver(data);
            localStorage.setItem('travelBy_driver', JSON.stringify(data));
          }}
          onNavigateToRegister={() => setDriverAuthMode('register')}
        />
      );
    }
    return (
      <DriverDashboard 
        driver={driver}
        onLogout={() => {
          setDriver(null);
          localStorage.removeItem('travelBy_driver');
        }}
        onDriverUpdate={(updatedDriver) => {
          setDriver(updatedDriver);
          localStorage.setItem('travelBy_driver', JSON.stringify(updatedDriver));
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="main-header">
        <div className="nav-logo">
          <img src={travelByLogo} alt="Travel_by Logo" className="logo-img" />
        </div>
        
        {/* Desktop Navigation */}
        <nav className="nav-menu desktop-only">
          <button 
            onClick={() => setCurrentPage('home')} 
            className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentPage('about')} 
            className={`nav-item ${currentPage === 'about' ? 'active' : ''}`}
          >
            About Us
          </button>
          <div 
            className="nav-dropdown-container"
            onMouseEnter={() => setIsVehiclesDropdownOpen(true)}
            onMouseLeave={() => setIsVehiclesDropdownOpen(false)}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <button 
              onClick={() => {
                if (user) {
                  setVehiclesFilter(null);
                  setCurrentPage('vehicles');
                } else {
                  handleNavigateToAuth('signup');
                }
              }} 
              className={`nav-item ${
                currentPage === 'vehicles' || 
                currentPage === 'parcel-booking' || 
                currentPage === 'vehicle-transport' 
                  ? 'active' : ''
              }`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Vehicles <span style={{ fontSize: '0.65rem' }}>{isVehiclesDropdownOpen ? '▲' : '▼'}</span>
            </button>
            {isVehiclesDropdownOpen && (
              <div className="nav-dropdown-menu">
                <button onClick={() => {
                  if (user) { setVehiclesFilter('bikes'); setCurrentPage('vehicles'); }
                  else { handleNavigateToAuth('signup'); }
                  setIsVehiclesDropdownOpen(false);
                }} style={{ border: 'none', background: 'none' }}>Bikes</button>
                <button onClick={() => {
                  if (user) { setVehiclesFilter('cars'); setCurrentPage('vehicles'); }
                  else { handleNavigateToAuth('signup'); }
                  setIsVehiclesDropdownOpen(false);
                }} style={{ border: 'none', background: 'none' }}>Cars</button>
                <button onClick={() => {
                  if (user) { setVehiclesFilter('auto'); setCurrentPage('vehicles'); }
                  else { handleNavigateToAuth('signup'); }
                  setIsVehiclesDropdownOpen(false);
                }} style={{ border: 'none', background: 'none' }}>Auto</button>
                <button onClick={() => {
                  if (user) { setVehiclesFilter(null); setCurrentPage('parcel-booking'); }
                  else { handleNavigateToAuth('signup'); }
                  setIsVehiclesDropdownOpen(false);
                }} style={{ border: 'none', background: 'none' }}>Parcel Booking</button>
                <button onClick={() => {
                  if (user) { setVehiclesFilter(null); setCurrentPage('vehicle-transport'); }
                  else { handleNavigateToAuth('signup'); }
                  setIsVehiclesDropdownOpen(false);
                }} style={{ border: 'none', background: 'none' }}>Vehicle Transport</button>
              </div>
            )}
          </div>
          <button 
            onClick={() => {
              if (user) {
                setCurrentPage('trips');
              } else {
                handleNavigateToAuth('signup');
              }
            }} 
            className={`nav-item ${currentPage === 'trips' ? 'active' : ''}`}
          >
            Trips
          </button>
          <button 
            onClick={() => {
              if (user) {
                setCurrentPage('client-response');
              } else {
                handleNavigateToAuth('signup');
              }
            }} 
            className={`nav-item ${currentPage === 'client-response' ? 'active' : ''}`}
          >
            Client Reviews
          </button>
          <button 
            onClick={() => {
              if (user) {
                setCurrentPage('contact');
              } else {
                handleNavigateToAuth('signup');
              }
            }} 
            className={`nav-item ${currentPage === 'contact' ? 'active' : ''}`}
          >
            Contact Us
          </button>
        </nav>

        <div className="nav-actions desktop-only">
          {user ? (
            <div className="header-user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setCurrentPage('booking-vehicles')} 
                className="btn-booking"
              >
                Booking Vehicles
              </button>
              <div className="header-avatar-badge-container" style={{ position: 'relative' }}>
                <div 
                  className="header-avatar-badge" 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <img src={user.profile_pic} alt={user.first_name} className="header-avatar-img" />
                  <span className="header-username" title={`${user.first_name} ${user.last_name}`}>
                    {user.first_name}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '2px' }}>
                    {isProfileDropdownOpen ? '▲' : '▼'}
                  </span>
                </div>
                {isProfileDropdownOpen && (
                  <div className="profile-dropdown-menu" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                    zIndex: 20,
                    minWidth: '240px',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease-out',
                    padding: '6px'
                  }}>
                    {/* 1) Profile Option */}
                    <button
                      onClick={() => {
                        openDashboard('profile');
                        setIsProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        color: '#f1f5f9',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      className="dropdown-opt-btn"
                    >
                      <User size={18} style={{ color: 'var(--color-accent)' }} />
                      Profile Details
                    </button>

                    {/* 2) Vehicle booking details */}
                    <button
                      onClick={() => {
                        setCurrentPage('booking-vehicles');
                        setIsProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        color: '#f1f5f9',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      className="dropdown-opt-btn"
                    >
                      <Car size={18} style={{ color: 'var(--color-accent)' }} />
                      Vehicle Bookings
                    </button>

                    {/* 3) Trips details */}
                    <button
                      onClick={() => {
                        setCurrentPage('trips');
                        setIsProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        color: '#f1f5f9',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      className="dropdown-opt-btn"
                    >
                      <Compass size={18} style={{ color: 'var(--color-accent)' }} />
                      Trips Details
                    </button>

                    {/* 4) Payment */}
                    <button
                      onClick={() => {
                        openDashboard('payment');
                        setIsProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        color: '#f1f5f9',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      className="dropdown-opt-btn"
                    >
                      <CreditCard size={18} style={{ color: 'var(--color-accent)' }} />
                      Payment Methods
                    </button>

                    {/* 5) History */}
                    <button
                      onClick={() => {
                        openDashboard('history');
                        setIsProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        color: '#f1f5f9',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      className="dropdown-opt-btn"
                    >
                      <History size={18} style={{ color: 'var(--color-accent)' }} />
                      Booking History
                    </button>

                    {/* Divider line */}
                    <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '6px 8px' }} />

                    {/* 6) Logout */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        color: '#f87171',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      className="dropdown-logout-btn"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={() => handleNavigateToAuth('signup')} className="btn-signin-nav">
              Create an Account
            </button>
          )}
        </div>

        {/* Hamburger Toggle Button (Mobile Only) */}
        <button 
          className="mobile-toggle-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <img src={travelByLogo} alt="Travel_by Logo" className="logo-img-mobile" />
          <button 
            className="mobile-close-btn" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close Menu"
          >
            <X size={32} />
          </button>
        </div>

        {/* Vertical Profile Section at top of the page */}
        {user && (
          <div className="mobile-top-profile-container">
            <div className="mobile-vertical-profile">
              <div 
                className="mobile-vertical-avatar-wrapper"
                onClick={() => { openDashboard('profile'); setIsMobileMenuOpen(false); }}
                style={{ cursor: 'pointer' }}
              >
                <img src={user.profile_pic} alt={user.first_name} className="mobile-vertical-avatar" />
              </div>
              <h4 className="mobile-vertical-name">
                <span 
                  onClick={() => { openDashboard('profile'); setIsMobileMenuOpen(false); }}
                  style={{ cursor: 'pointer' }}
                >
                  {user.first_name} {user.last_name}
                </span>
                <span 
                  className="dropdown-caret" 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  style={{ cursor: 'pointer', padding: '0 8px' }}
                >
                  {isProfileDropdownOpen ? ' ▲' : ' ▼'}
                </span>
              </h4>
              <p 
                className="mobile-vertical-email"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                style={{ cursor: 'pointer' }}
              >
                {user.email}
              </p>
            </div>

            {/* Top-down Collapsible Dropdown list */}
            {isProfileDropdownOpen && (
              <div className="mobile-profile-dropdown">
                <button 
                  onClick={() => { openDashboard('profile'); setIsMobileMenuOpen(false); }} 
                  className="mobile-dropdown-btn"
                >
                  <User size={18} style={{ color: 'var(--color-accent)' }} />
                  <span>Profile Details</span>
                </button>
                <button 
                  onClick={() => { setCurrentPage('booking-vehicles'); setIsMobileMenuOpen(false); }} 
                  className="mobile-dropdown-btn"
                >
                  <Car size={18} style={{ color: 'var(--color-accent)' }} />
                  <span>Vehicle Bookings</span>
                </button>
                <button 
                  onClick={() => { setCurrentPage('trips'); setIsMobileMenuOpen(false); }} 
                  className="mobile-dropdown-btn"
                >
                  <Compass size={18} style={{ color: 'var(--color-accent)' }} />
                  <span>Trips Details</span>
                </button>
                <button 
                  onClick={() => { openDashboard('payment'); setIsMobileMenuOpen(false); }} 
                  className="mobile-dropdown-btn"
                >
                  <CreditCard size={18} style={{ color: 'var(--color-accent)' }} />
                  <span>Payments</span>
                </button>
                <button 
                  onClick={() => { openDashboard('history'); setIsMobileMenuOpen(false); }} 
                  className="mobile-dropdown-btn"
                >
                  <History size={18} style={{ color: 'var(--color-accent)' }} />
                  <span>Booking History</span>
                </button>
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                  className="mobile-dropdown-logout-btn"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}

        <nav className="mobile-nav-links">
          <button 
            onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }} 
            className={`mobile-nav-item ${currentPage === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => { setCurrentPage('about'); setIsMobileMenuOpen(false); }} 
            className={`mobile-nav-item ${currentPage === 'about' ? 'active' : ''}`}
          >
            About Us
          </button>
          <div className="mobile-nav-dropdown-container" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <button 
              onClick={() => setIsMobileVehiclesOpen(!isMobileVehiclesOpen)} 
              className={`mobile-nav-item ${
                currentPage === 'vehicles' || 
                currentPage === 'parcel-booking' || 
                currentPage === 'vehicle-transport' 
                  ? 'active' : ''
              }`}
              style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', background: 'none', border: 'none', textAlign: 'left' }}
            >
              <span>Vehicles</span>
              <span style={{ fontSize: '0.8rem' }}>{isMobileVehiclesOpen ? '▲' : '▼'}</span>
            </button>
            {isMobileVehiclesOpen && (
              <div className="mobile-sub-menu" style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <button onClick={() => { if (user) { setVehiclesFilter('bikes'); setCurrentPage('vehicles'); } else { handleNavigateToAuth('signup'); } setIsMobileMenuOpen(false); }} className="mobile-sub-item" style={{ border: 'none', background: 'none', textAlign: 'left' }}>Bikes</button>
                <button onClick={() => { if (user) { setVehiclesFilter('cars'); setCurrentPage('vehicles'); } else { handleNavigateToAuth('signup'); } setIsMobileMenuOpen(false); }} className="mobile-sub-item" style={{ border: 'none', background: 'none', textAlign: 'left' }}>Cars</button>
                <button onClick={() => { if (user) { setVehiclesFilter('auto'); setCurrentPage('vehicles'); } else { handleNavigateToAuth('signup'); } setIsMobileMenuOpen(false); }} className="mobile-sub-item" style={{ border: 'none', background: 'none', textAlign: 'left' }}>Auto</button>
                <button onClick={() => { if (user) { setVehiclesFilter(null); setCurrentPage('parcel-booking'); } else { handleNavigateToAuth('signup'); } setIsMobileMenuOpen(false); }} className="mobile-sub-item" style={{ border: 'none', background: 'none', textAlign: 'left' }}>Parcel Booking</button>
                <button onClick={() => { if (user) { setVehiclesFilter(null); setCurrentPage('vehicle-transport'); } else { handleNavigateToAuth('signup'); } setIsMobileMenuOpen(false); }} className="mobile-sub-item" style={{ border: 'none', background: 'none', textAlign: 'left' }}>Vehicle Transport</button>
              </div>
            )}
          </div>
          <button 
            onClick={() => { 
              if (user) {
                setCurrentPage('trips'); 
              } else {
                handleNavigateToAuth('signup');
              }
              setIsMobileMenuOpen(false); 
            }} 
            className={`mobile-nav-item ${currentPage === 'trips' ? 'active' : ''}`}
          >
            Trips
          </button>
          <button 
            onClick={() => { 
              if (user) {
                setCurrentPage('client-response'); 
              } else {
                handleNavigateToAuth('signup');
              }
              setIsMobileMenuOpen(false); 
            }} 
            className={`mobile-nav-item ${currentPage === 'client-response' ? 'active' : ''}`}
          >
            Client Reviews
          </button>
          <button 
            onClick={() => { 
              if (user) {
                setCurrentPage('contact'); 
              } else {
                handleNavigateToAuth('signup');
              }
              setIsMobileMenuOpen(false); 
            }} 
            className={`mobile-nav-item ${currentPage === 'contact' ? 'active' : ''}`}
          >
            Contact Us
          </button>
          
          {user && (
            <button 
              onClick={() => { 
                handleLogout(); 
                setIsMobileMenuOpen(false); 
              }} 
              className="mobile-nav-item mobile-logout-nav-item"
            >
              Logout
            </button>
          )}
          
          <div className="mobile-btn-container">
            {!user && (
              <button 
                onClick={() => { handleNavigateToAuth('signup'); setIsMobileMenuOpen(false); }} 
                className="btn-booking mobile-booking-btn"
              >
                Create an Account
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Main Page Area */}
      <main className="content-area">
        {pageDetails && currentPage !== 'home' && currentPage !== 'auth' && (
          <div className="inner-page-banner">
            <div className="banner-left-img"></div>
            <div className="banner-right-img"></div>
            <div className="banner-overlay"></div>
            <div className="banner-center-content">
              <h1>{pageDetails.title}</h1>
              <p>{pageDetails.subtitle}</p>
            </div>
          </div>
        )}
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* User Dashboard Modal (Profile, Payments, History) */}
      {isDashboardModalOpen && (
        <div className="dashboard-modal-overlay" onClick={() => setIsDashboardModalOpen(false)}>
          <div className="dashboard-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="dashboard-modal-close" onClick={() => setIsDashboardModalOpen(false)}>
              <X size={20} />
            </button>
            
            {/* Sidebar Tab Selector */}
            <aside className="dashboard-sidebar">
              <div className="dashboard-sidebar-profile">
                <img 
                  src={editProfilePic || user.profile_pic} 
                  alt="User Avatar" 
                  className="dashboard-sidebar-avatar"
                  onError={(e) => {
                    e.target.src = user.profile_pic;
                  }}
                />
                <h4>{user.first_name} {user.last_name}</h4>
                <p>{user.email}</p>
              </div>
              <nav className="dashboard-sidebar-nav">
                <button 
                  className={`dashboard-nav-btn ${dashboardActiveTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setDashboardActiveTab('profile')}
                >
                  <User size={18} />
                  <span>Profile Info</span>
                </button>
                <button 
                  className={`dashboard-nav-btn ${dashboardActiveTab === 'payment' ? 'active' : ''}`}
                  onClick={() => setDashboardActiveTab('payment')}
                >
                  <CreditCard size={18} />
                  <span>Payments</span>
                </button>
                <button 
                  className={`dashboard-nav-btn ${dashboardActiveTab === 'history' ? 'active' : ''}`}
                  onClick={() => setDashboardActiveTab('history')}
                >
                  <History size={18} />
                  <span>History</span>
                </button>
              </nav>
            </aside>
            
            {/* Active Content Area */}
            <main className="dashboard-main-content">
              {dashboardActiveTab === 'profile' && (
                <div className="dashboard-tab-pane">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 className="tab-pane-title">Personal Profile</h3>
                    <span className="tab-pane-tag">Edit Mode</span>
                  </div>
                  
                  <form onSubmit={handleProfileUpdate} className="dashboard-profile-form">
                    {/* Large Editable Avatar */}
                    <div className="profile-pic-edit-container">
                      <div className="profile-pic-wrapper">
                        <img 
                          src={editProfilePic} 
                          alt="Profile Preview" 
                          className="profile-pic-preview-large"
                          onError={(e) => {
                            e.target.src = user.profile_pic;
                          }}
                        />
                        <label htmlFor="dashboard-file-input" className="avatar-edit-overlay">
                          <Camera size={18} />
                          <span>Change Photo</span>
                        </label>
                        <input 
                          id="dashboard-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePicChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                      <div className="avatar-info-text">
                        <h5>Avatar Preview</h5>
                        <p>Click image to upload. Recommended: 150x150. Max size: 5MB.</p>
                      </div>
                    </div>

                    {/* Form Input fields */}
                    <div className="dashboard-form-row">
                      <div className="form-group flex-1">
                        <label>First Name</label>
                        <input 
                          type="text" 
                          required 
                          value={editFirstName} 
                          onChange={(e) => setEditFirstName(e.target.value)} 
                          placeholder="First Name"
                          className="dashboard-input"
                        />
                      </div>
                      <div className="form-group flex-1">
                        <label>Last Name</label>
                        <input 
                          type="text" 
                          required 
                          value={editLastName} 
                          onChange={(e) => setEditLastName(e.target.value)} 
                          placeholder="Last Name"
                          className="dashboard-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Email Address (Read-only)</label>
                      <input 
                        type="email" 
                        disabled 
                        value={user.email} 
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        className="dashboard-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Street Address (Read-only)</label>
                      <input 
                        type="text" 
                        disabled 
                        value={user.address || 'Not Provided'} 
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        className="dashboard-input"
                      />
                    </div>

                    <div className="dashboard-form-row">
                      <div className="form-group flex-1">
                        <label>Pin Code (Read-only)</label>
                        <input 
                          type="text" 
                          disabled 
                          value={user.pin_code || 'Not Provided'} 
                          style={{ opacity: 0.6, cursor: 'not-allowed' }}
                          className="dashboard-input"
                        />
                      </div>
                      <div className="form-group flex-1">
                        <label>State (Read-only)</label>
                        <input 
                          type="text" 
                          disabled 
                          value={user.state || 'Not Provided'} 
                          style={{ opacity: 0.6, cursor: 'not-allowed' }}
                          className="dashboard-input"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-dashboard-save" disabled={isUpdatingProfile}>
                      {isUpdatingProfile ? (
                        <span>Saving...</span>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
              
              {dashboardActiveTab === 'payment' && (
                <div className="dashboard-tab-pane">
                  <h3 className="tab-pane-title" style={{ marginBottom: '1.25rem' }}>Payment & Billing</h3>
                  
                  {/* Neon Credit Card Mock-up */}
                  <div className="payment-card-mock">
                    <div className="card-overlay-noise"></div>
                    <div className="card-top-row">
                      <span className="card-type">TRAVEL_BY SIGNATURE</span>
                      <div className="card-chip"></div>
                    </div>
                    <div className="card-number">•••• •••• •••• 4820</div>
                    <div className="card-details">
                      <div className="card-holder">
                        <span className="card-label">CARD HOLDER</span>
                        <span className="card-value">{user.first_name} {user.last_name}</span>
                      </div>
                      <div className="card-expiry">
                        <span className="card-label">EXPIRES</span>
                        <span className="card-value">12 / 30</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ color: '#ffffff', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saved Payment Methods</h4>
                    <div className="payment-method-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="card-mini-icon">VISA</div>
                        <div>
                          <p style={{ color: '#ffffff', fontWeight: 'bold', margin: '0', fontSize: '0.85rem' }}>Visa Signature ending in 4820</p>
                          <p style={{ color: '#94a3b8', margin: '0', fontSize: '0.75rem' }}>Default billing method</p>
                        </div>
                      </div>
                      <span className="payment-active-badge">Active</span>
                    </div>
                  </div>
                </div>
              )}
              
              {dashboardActiveTab === 'history' && (
                <div className="dashboard-tab-pane" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' }}>
                  <History size={48} style={{ color: 'var(--color-accent)', marginBottom: '1.25rem', opacity: 0.8 }} />
                  <h3 className="tab-pane-title" style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#ffffff' }}>Available Soon</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>We are currently integrating live booking details for your account.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
