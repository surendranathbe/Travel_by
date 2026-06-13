import { useState, useEffect } from 'react';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Trips from './pages/Trips';
import Vehicles from './pages/Vehicles';
import ClientResponse from './pages/ClientResponse';
import ContactUs from './pages/ContactUs';
import BookingVehicles from './pages/BookingVehicles';
import Auth from './pages/Auth';
import travelByLogo from './assets/travel_by.png';
import Footer from './components/Footer';
import { Menu, X } from 'lucide-react';
import { supabase } from './utils/supabase';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // Default to signup
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
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
      supabase.from('_connection_test').select('*').limit(1)
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

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'about':
        return <AboutUs />;
      case 'auth':
        return <Auth onLoginSuccess={handleLoginSuccess} initialMode={authMode} key={authMode} />;
      case 'trips':
        return user ? <Trips /> : <Auth onLoginSuccess={handleLoginSuccess} initialMode="signup" key="signup" />;
      case 'vehicles':
        return user ? <Vehicles /> : <Auth onLoginSuccess={handleLoginSuccess} initialMode="signup" key="signup" />;
      case 'client-response':
        return user ? <ClientResponse /> : <Auth onLoginSuccess={handleLoginSuccess} initialMode="signup" key="signup" />;
      case 'contact':
        return user ? <ContactUs /> : <Auth onLoginSuccess={handleLoginSuccess} initialMode="signup" key="signup" />;
      case 'booking-vehicles':
        return user ? <BookingVehicles /> : <Auth onLoginSuccess={handleLoginSuccess} initialMode="signup" key="signup" />;
      default:
        return <Home />;
    }
  };

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
          <button 
            onClick={() => {
              if (user) {
                setCurrentPage('vehicles');
              } else {
                handleNavigateToAuth('signup');
              }
            }} 
            className={`nav-item ${currentPage === 'vehicles' ? 'active' : ''}`}
          >
            Vehicles
          </button>
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
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                    zIndex: 20,
                    minWidth: '160px',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        color: '#ef4444',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'var(--transition)'
                      }}
                      className="dropdown-logout-btn"
                    >
                      🚪 Logout
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
          <button 
            onClick={() => { 
              if (user) {
                setCurrentPage('vehicles'); 
              } else {
                handleNavigateToAuth('signup');
              }
              setIsMobileMenuOpen(false); 
            }} 
            className={`mobile-nav-item ${currentPage === 'vehicles' ? 'active' : ''}`}
          >
            Vehicles
          </button>
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
          
          <div className="mobile-btn-container">
            {user ? (
              <div className="mobile-user-profile-wrap">
                <div className="mobile-avatar-badge">
                  <img src={user.profile_pic} alt={`${user.first_name} ${user.last_name}`} className="mobile-avatar-img" />
                  <span className="mobile-username">{user.first_name} {user.last_name}</span>
                </div>
                <button 
                  onClick={() => { setCurrentPage('booking-vehicles'); setIsMobileMenuOpen(false); }} 
                  className="btn-booking mobile-booking-btn"
                >
                  Booking Vehicles
                </button>
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                  className="btn-logout-mobile"
                >
                  Logout
                </button>
              </div>
            ) : (
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
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;
