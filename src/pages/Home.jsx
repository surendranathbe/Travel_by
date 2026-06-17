import bannerBg from '../assets/indian_travel_banner.png';
import servicesImg from '../assets/travel_services.png';
import quickDeliveryImg from '../assets/quick_delivery.png';
import reasonablePricesImg from '../assets/reasonable_prices.png';
import indiaMapImg from '../assets/india_map_coverage.png';
import bikeThumbnail from '../assets/bike_thumbnail.png';
import carThumbnail from '../assets/car_thumbnail.png';
import autoThumbnail from '../assets/auto_thumbnail.png';
import parcelThumbnail from '../assets/parcel_thumbnail.png';
import travelThumbnail from '../assets/travel_thumbnail.png';
import freedomThumbnail from '../assets/freedom_thumbnail.png';



export default function Home({ setCurrentPage }) {
  return (
    <div className="home-page-container">
      {/* 1920*600 Banner Section */}
      <div className="home-banner-section">
        <div 
          className="banner-bg-container" 
          style={{ backgroundImage: `url(${bannerBg})` }}
        >
          <div className="banner-overlay"></div>
          
          <div className="banner-content">
            {/* Left side: vehicles availability form */}
            <div className="banner-left">
              <div className="booking-card">
                <h3>Check Availability</h3>
                <p>Find the perfect vehicle for your trip</p>
                <form className="availability-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-group">
                    <label htmlFor="vehicle-type">Vechicals Type</label>
                    <select id="vehicle-type" name="vehicle-type" defaultValue="">
                      <option value="" disabled>Select vehicle type</option>
                      <option value="bikes">Bikes</option>
                      <option value="cars">Cars</option>
                      <option value="scooty">Scooty</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-check-avail">
                    Check Availability
                  </button>
                </form>
              </div>
            </div>

            {/* Right side: Book a Ride button */}
            <div className="banner-right">
              <div className="book-ride-cta">
                <h2>Explore the Open Road</h2>
                <p>Rent high-quality vehicles for family trips, solo adventures, or daily commutes.</p>
                <button onClick={() => setCurrentPage('book-ride')} className="btn-book-ride-hero">
                  <span>Book a Ride</span>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-arrow">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="services-section">
        <div className="services-container">
          <div className="services-header">
            <h2>Our Services</h2>
            <div className="services-title-underline"></div>
          </div>

          <div className="services-content-layout">
            {/* Services Grid (6 Cards) */}
            <div className="services-grid">
              {/* Bike Rent Card */}
              <div className="service-card">
                <div className="card-info">
                  <h4>Rent Bike</h4>
                  <p>Flexible bike rentals with convenient dropping and pickup facilities.</p>
                </div>
                <div className="card-icon-box bike-color">
                  <img src={bikeThumbnail} alt="Bike Rent" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                </div>
              </div>

              {/* Car Rent Card */}
              <div className="service-card">
                <div className="card-info">
                  <h4>Car Rent</h4>
                  <p>Premium cars for memorable family trips and special occasion getaways.</p>
                </div>
                <div className="card-icon-box car-color">
                  <img src={carThumbnail} alt="Car Rent" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                </div>
              </div>

              {/* Auto & Scooty Card */}
              <div className="service-card">
                <div className="card-info">
                  <h4>Auto & Scooty</h4>
                  <p>Efficient and simple rides for quick everyday town commutes.</p>
                </div>
                <div className="card-icon-box auto-color">
                  <img src={autoThumbnail} alt="Auto & Scooty Rent" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                </div>
              </div>

              {/* Parcel Card */}
              <div className="service-card">
                <div className="card-info">
                  <h4>Parcel</h4>
                  <p>Quick, secure, and insured door-to-door parcel delivery.</p>
                </div>
                <div className="card-icon-box parcel-color">
                  <img src={parcelThumbnail} alt="Parcel Delivery" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                </div>
              </div>

              {/* Travel and Stay Card */}
              <div className="service-card">
                <div className="card-info">
                  <h4>Travel and Stay</h4>
                  <p>One unified application to plan your entire tourist itinerary.</p>
                </div>
                <div className="card-icon-box travel-color">
                  <img src={travelThumbnail} alt="Travel and Stay" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                </div>
              </div>

              {/* Animated Alternate Card (Replacing Metro Ticket) */}
              <div className="service-card animated-card">
                <div className="card-info">
                  <h4 className="animated-heading">Self-Drive Freedom</h4>
                  <p className="animated-subtext">Infinite open routes, zero distance caps. Key off now.</p>
                </div>
                <div className="card-icon-box animated-icon">
                  <img src={freedomThumbnail} alt="Self-Drive Freedom" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                </div>
              </div>
            </div>

            {/* Right Side: Services Isometric Image Illustration */}
            <div className="services-visual">
              <div className="services-image-frame">
                <img 
                  src={servicesImg} 
                  alt="Travel_by Mobility Platform illustration" 
                  className="services-image" 
                />
                <div className="services-image-details">
                  <h4>All-In-One Travel Suite</h4>
                  <p>We combine city logistics, premium road trip rentals, and safety guidelines into one sleek plain-themed ecosystem.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="offer-section">
        <div className="offer-container">
          <div className="offer-header">
            <h2>What we offer</h2>
            <div className="offer-title-underline"></div>
          </div>

          <div className="offer-grid">
            {/* Feature 1: Quick Vehicle Delivery */}
            <div className="offer-card">
              <div className="offer-image-wrap">
                <img 
                  src={quickDeliveryImg} 
                  alt="Quick Vehicle Delivery" 
                  className="offer-image" 
                />
              </div>
              <h3 className="offer-card-title">Quick Vehicle Delivery</h3>
              <p className="offer-card-text">
                Get your rented vehicle delivered directly to your doorstep in minutes. Hassle-free drop-off and pick-up services right at your convenience.
              </p>
            </div>

            {/* Feature 2: Reasonable Prices */}
            <div className="offer-card">
              <div className="offer-image-wrap">
                <img 
                  src={reasonablePricesImg} 
                  alt="Reasonable Prices" 
                  className="offer-image" 
                />
              </div>
              <h3 className="offer-card-title">Reasonable Prices</h3>
              <p className="offer-card-text">
                Unbeatable, transparent pricing structure with no hidden charges. Rent premium cars and bikes at the best budget-friendly rates in the market.
              </p>
            </div>

            {/* Feature 3: All Over India Map Coverage */}
            <div className="offer-card">
              <div className="offer-image-wrap">
                <img 
                  src={indiaMapImg} 
                  alt="All Over India Map Coverage" 
                  className="offer-image" 
                />
              </div>
              <h3 className="offer-card-title">All Over India Coverage</h3>
              <p className="offer-card-text">
                Present across major cities, tourist hubs, and highway routes. Travel seamlessly across India with national permits, active navigation support, and road assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
