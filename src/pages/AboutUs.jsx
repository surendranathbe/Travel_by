import { useState } from 'react';
import aboutSectionImg from '../assets/about-section.png';

const FAQS = [
  { q: 'Who is eligible to rent a vehicle from Travel_by?', a: 'Any individual aged 21 or above with a valid active driving license and credit/debit card is eligible to rent.' },
  { q: 'What documents do I need to submit before pickup?', a: 'You need to upload a government-approved ID (Aadhaar or Passport) and your active driving license on the booking portal.' },
  { q: 'Is fuel included in the rental price?', a: 'No, rentals exclude fuel. We deliver the vehicle with a certain fuel level, and you are expected to return it with the same level.' },
  { q: 'Are all Travel_by vehicles insured?', a: 'Yes, our entire fleet is fully comprehensive-insured, covering major third-party liabilities and damage limits.' },
  { q: 'How does the doorstep delivery and pickup service work?', a: 'Our delivery executive brings the vehicle directly to your chosen address, verifies your active ID/license, and hands over keys.' },
  { q: 'Can I drive across state lines with a Travel_by rental?', a: 'Yes, all our vehicles have active national permits, allowing seamless interstate travel across major highway routes.' },
  { q: 'Is there a distance cap or mileage limit on my trip?', a: 'No! We offer zero distance caps so you can explore the open road freely without worrying about excess mileage fees.' },
  { q: 'What should I do in the event of an accident or breakdown?', a: 'Contact our 24/7 dedicated roadside assistance immediately via the support details on your active booking screen.' },
  { q: 'Can I extend my booking period mid-trip?', a: 'Yes, extension requests can be submitted through your dashboard, subject to fleet and vehicle availability.' },
  { q: 'What is your cancellation policy?', a: 'Free cancellation is available up to 24 hours prior to the scheduled pickup time. Cancellations within 24 hours incur minor processing fees.' },
  { q: 'How is the security deposit managed?', a: 'We hold a nominal, fully refundable security deposit during booking, which is released within 48 hours of vehicle return inspection.' },
  { q: 'Are the vehicles sanitized before delivery?', a: 'Yes, every vehicle undergoes a deep mechanical inspection and thorough sanitization before every key handoff.' }
];

export default function AboutUs() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  return (
    <div className="about-page-container">
      {/* Brand Showcase Section under the Banner */}
      <div className="about-showcase-section">
        <div className="about-showcase-grid">
          {/* Left Column: Branded Showcase Image */}
          <div className="about-showcase-visual">
            <div className="about-image-card">
              <img 
                src={aboutSectionImg} 
                alt="Travel_by Vehicles and Team" 
                className="about-section-showcase-img"
              />
            </div>
          </div>

          {/* Right Column: Paragraph about Travel_by */}
          <div className="about-showcase-content">
            <h3>Our Journey & Identity</h3>
            <p className="about-brand-description">
              <strong>Travel_by</strong> is India's leading self-drive mobility platform, redefining how people explore the open roads. 
              Founded on the principles of trust, freedom, and seamless logistics, we provide travelers with an extensive, 
              expertly curated fleet of premium cars, high-performance bikes, and urban mobility scooters. Every vehicle 
              in our fleet undergoes a rigorous multi-point inspection and sanitation process to guarantee a safe, comfortable, 
              and reliable journey.
            </p>
            <p className="about-brand-description">
              Whether you are planning a weekend mountain road trip, a cross-country adventure, or simple daily commutes, 
              Travel_by offers transparent budget-friendly pricing, zero distance caps, and 24/7 dedicated roadside assistance. 
              Our mission is to empower you to create unforgettable travel stories, with the key to your next destination 
              always just a few clicks away.
            </p>
          </div>
        </div>
      </div>

      <div className="page-view-inner" style={{ padding: '2rem 2rem 4rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', marginBottom: '5rem', marginTop: '2rem' }}>
        {/* Card 1: Our Mission */}
        <div className="about-mission-card mission-card-1">
          <div className="about-card-icon-wrapper">
            <span>🎯</span>
          </div>
          <h3>Our Mission</h3>
          <p>
            To deliver unmatched convenience, safety, and open-road freedom at prices that fit every budget, ensuring memories that last a lifetime.
          </p>
        </div>

        {/* Card 2: Safety First */}
        <div className="about-mission-card mission-card-2">
          <div className="about-card-icon-wrapper">
            <span>🛡️</span>
          </div>
          <h3>Safety First</h3>
          <p>
            Every car and bike undergoes deep sanitation and rigorous mechanical checks before delivery, backed by 24/7 roadside assistance.
          </p>
        </div>

        {/* Card 3: Seamless Service */}
        <div className="about-mission-card mission-card-3">
          <div className="about-card-icon-wrapper">
            <span>✨</span>
          </div>
          <h3>Seamless Service</h3>
          <p>
            Book in under two minutes, unlock keyless entry, choose doorstep delivery, and enjoy zero distance caps on your journeys.
          </p>
        </div>
      </div>

      {/* FAQ Accordion Section replacing Numbers section */}
      <div className="about-faq-section">
        <div className="faq-header">
          <h3>Curious About How We Roll?</h3>
          <p>Find answers to everything you need to know about the Travel_by experience.</p>
        </div>
        
        <div className="faq-accordion-list">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button className="faq-question-btn" onClick={() => toggleFaq(idx)}>
                  <span>{faq.q}</span>
                  <span className="faq-icon-arrow">{isOpen ? '−' : '+'}</span>
                </button>
                <div className="faq-answer-wrapper">
                  <p className="faq-answer-text">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
  );
}
