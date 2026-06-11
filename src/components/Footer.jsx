import { useState } from 'react';
import travelByLogo from '../assets/travel_by.png';

export default function Footer({ setCurrentPage }) {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`📧 Subscription successful! Thank you for joining the Travel_by newsletter list.`);
    setEmail('');
  };

  const navigateTo = (pageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="main-footer">
      {/* Overlapping Floating CTA Card */}
      <div className="footer-cta-wrap">
        <div className="footer-cta-card">
          <div className="footer-cta-content">
            <span className="cta-tag">Limited Time Offer</span>
            <h3>Ready to Experience Self-Drive Freedom?</h3>
            <p>Get flat 15% off on your first booking. Explore premium cars and bikes across India.</p>
          </div>
          <button onClick={() => navigateTo('booking-vehicles')} className="footer-cta-btn">
            <span>Book Your Ride</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="cta-arrow">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div className="footer-container">
        {/* Branding Column */}
        <div className="footer-col branding-col">
          <button onClick={() => navigateTo('home')} className="footer-logo-btn">
            <div className="footer-logo-wrapper">
              <img src={travelByLogo} alt="Travel_by Logo" className="footer-logo-img" />
            </div>
          </button>
          <p className="footer-desc">
            India's leading self-drive mobility platform. We deliver comfort, freedom, and memories right to your doorstep.
          </p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="18" height="18">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>

        {/* Explore Links Column */}
        <div className="footer-col">
          <h4 className="footer-title">Explore</h4>
          <ul className="footer-links-list">
            <li><button onClick={() => navigateTo('home')} className="footer-link-item">Home</button></li>
            <li><button onClick={() => navigateTo('about')} className="footer-link-item">About Us</button></li>
            <li><button onClick={() => navigateTo('trips')} className="footer-link-item">Trips & Packages</button></li>
            <li><button onClick={() => navigateTo('vehicles')} className="footer-link-item">Our Fleet</button></li>
            <li><button onClick={() => navigateTo('client-response')} className="footer-link-item">Reviews</button></li>
            <li><button onClick={() => navigateTo('contact')} className="footer-link-item">Contact Us</button></li>
          </ul>
        </div>

        {/* Fleet Categories Column */}
        <div className="footer-col">
          <h4 className="footer-title">Our Fleet</h4>
          <ul className="footer-links-list">
            <li><button onClick={() => navigateTo('vehicles')} className="footer-link-item">Cruiser Bikes</button></li>
            <li><button onClick={() => navigateTo('vehicles')} className="footer-link-item">Sports Bikes</button></li>
            <li><button onClick={() => navigateTo('vehicles')} className="footer-link-item">Premium Sedans</button></li>
            <li><button onClick={() => navigateTo('vehicles')} className="footer-link-item">Family SUVs</button></li>
            <li><button onClick={() => navigateTo('vehicles')} className="footer-link-item">City Commutes</button></li>
          </ul>
        </div>

        {/* Newsletter & Contact Column */}
        <div className="footer-col newsletter-col">
          <h4 className="footer-title">Stay Updated</h4>
          <p className="newsletter-desc">Subscribe to get notifications on vehicle arrivals and hot road-trip deals.</p>
          <form onSubmit={handleSubscribe} className="footer-newsletter-form">
            <div className="newsletter-input-group">
              <input 
                type="email" 
                placeholder="Enter your email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="footer-email-input"
              />
              <button type="submit" className="footer-subscribe-btn" aria-label="Subscribe">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </form>

          <ul className="footer-contact-inline">
            <li>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer-contact-icon">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>+91 98765 43210</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer-contact-icon">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>support@travelby.com</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom-bar">
        <p>&copy; {new Date().getFullYear()} Travel_by. All rights reserved. Created with ❤️ for premium journeys.</p>
      </div>
    </footer>
  );
}
