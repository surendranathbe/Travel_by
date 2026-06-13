import bannerBg from '../assets/indian_travel_banner.png';
import servicesImg from '../assets/travel_services.png';
import quickDeliveryImg from '../assets/quick_delivery.png';
import reasonablePricesImg from '../assets/reasonable_prices.png';
import indiaMapImg from '../assets/india_map_coverage.png';

export default function Home() {
  return (
    <div className="home-page-container">
      {/* 1920*600 Banner Section */}
      <div className="home-banner-section">
        <div 
          className="banner-bg-container" 
          style={{ backgroundImage: `url(${bannerBg})` }}
        >
          <div className="banner-overlay"></div>
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
                <div className="card-icon-box bike-color">🏍️</div>
              </div>

              {/* Car Rent Card */}
              <div className="service-card">
                <div className="card-info">
                  <h4>Car Rent</h4>
                  <p>Premium cars for memorable family trips and special occasion getaways.</p>
                </div>
                <div className="card-icon-box car-color">🚗</div>
              </div>

              {/* Auto & Scooty Card */}
              <div className="service-card">
                <div className="card-info">
                  <h4>Auto & Scooty</h4>
                  <p>Efficient and simple rides for quick everyday town commutes.</p>
                </div>
                <div className="card-icon-box auto-color">🛺</div>
              </div>

              {/* Parcel Card */}
              <div className="service-card">
                <div className="card-info">
                  <h4>Parcel</h4>
                  <p>Quick, secure, and insured door-to-door parcel delivery.</p>
                </div>
                <div className="card-icon-box parcel-color">📦</div>
              </div>

              {/* Travel and Stay Card */}
              <div className="service-card">
                <div className="card-info">
                  <h4>Travel and Stay</h4>
                  <p>One unified application to plan your entire tourist itinerary.</p>
                </div>
                <div className="card-icon-box travel-color">🌴</div>
              </div>

              {/* Animated Alternate Card (Replacing Metro Ticket) */}
              <div className="service-card animated-card">
                <div className="card-info">
                  <h4 className="animated-heading">Self-Drive Freedom</h4>
                  <p className="animated-subtext">Infinite open routes, zero distance caps. Key off now.</p>
                </div>
                <div className="card-icon-box animated-icon">✨</div>
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
