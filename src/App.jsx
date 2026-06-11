import { useState } from 'react';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Trips from './pages/Trips';
import Vehicles from './pages/Vehicles';
import ClientResponse from './pages/ClientResponse';
import ContactUs from './pages/ContactUs';
import BookingVehicles from './pages/BookingVehicles';
import travelByLogo from './assets/travel_by.png';
import Footer from './components/Footer';
import { Menu, X } from 'lucide-react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'about':
        return <AboutUs />;
      case 'trips':
        return <Trips />;
      case 'vehicles':
        return <Vehicles />;
      case 'client-response':
        return <ClientResponse />;
      case 'contact':
        return <ContactUs />;
      case 'booking-vehicles':
        return <BookingVehicles />;
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
            onClick={() => setCurrentPage('trips')} 
            className={`nav-item ${currentPage === 'trips' ? 'active' : ''}`}
          >
            Trips
          </button>
          <button 
            onClick={() => setCurrentPage('vehicles')} 
            className={`nav-item ${currentPage === 'vehicles' ? 'active' : ''}`}
          >
            Vehicles
          </button>
          <button 
            onClick={() => setCurrentPage('client-response')} 
            className={`nav-item ${currentPage === 'client-response' ? 'active' : ''}`}
          >
            Client Response
          </button>
          <button 
            onClick={() => setCurrentPage('contact')} 
            className={`nav-item ${currentPage === 'contact' ? 'active' : ''}`}
          >
            Contact Us
          </button>
        </nav>

        <div className="nav-actions desktop-only">
          <button 
            onClick={() => setCurrentPage('booking-vehicles')} 
            className="btn-booking"
          >
            Booking Vehicles
          </button>
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
            onClick={() => { setCurrentPage('trips'); setIsMobileMenuOpen(false); }} 
            className={`mobile-nav-item ${currentPage === 'trips' ? 'active' : ''}`}
          >
            Trips
          </button>
          <button 
            onClick={() => { setCurrentPage('vehicles'); setIsMobileMenuOpen(false); }} 
            className={`mobile-nav-item ${currentPage === 'vehicles' ? 'active' : ''}`}
          >
            Vehicles
          </button>
          <button 
            onClick={() => { setCurrentPage('client-response'); setIsMobileMenuOpen(false); }} 
            className={`mobile-nav-item ${currentPage === 'client-response' ? 'active' : ''}`}
          >
            Client Response
          </button>
          <button 
            onClick={() => { setCurrentPage('contact'); setIsMobileMenuOpen(false); }} 
            className={`mobile-nav-item ${currentPage === 'contact' ? 'active' : ''}`}
          >
            Contact Us
          </button>
          
          <div className="mobile-btn-container">
            <button 
              onClick={() => { setCurrentPage('booking-vehicles'); setIsMobileMenuOpen(false); }} 
              className="btn-booking mobile-booking-btn"
            >
              Booking Vehicles
            </button>
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
