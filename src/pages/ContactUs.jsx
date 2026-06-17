export default function ContactUs() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('📧 Message sent successfully! We will get back to you within 2 hours.');
    e.target.reset();
  };

  return (
    <div className="page-view" style={{ padding: '2rem 2rem 4rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
        {/* Contact Info */}
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>Get in Touch</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            We provide roadside assistance, custom rental queries, corporate fleet solutions, and route suggestions 24 hours a day, 7 days a week.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-primary)', fontWeight: '700' }}>
              <span style={{ fontSize: '1.8rem', padding: '0.4rem', backgroundColor: 'rgba(249, 115, 22, 0.08)', borderRadius: '10px' }}>📞</span>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>Call Support</span>
                <span>+91 98765 43210</span>
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-primary)', fontWeight: '700' }}>
              <span style={{ fontSize: '1.8rem', padding: '0.4rem', backgroundColor: 'rgba(249, 115, 22, 0.08)', borderRadius: '10px' }}>📧</span>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>Email Address</span>
                <span>support@travelby.com</span>
              </div>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-primary)', fontWeight: '700' }}>
              <span style={{ fontSize: '1.8rem', padding: '0.4rem', backgroundColor: 'rgba(249, 115, 22, 0.08)', borderRadius: '10px' }}>🏢</span>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>Corporate Office</span>
                <span>Travel_by Towers, Hitech City, Hyderabad, India</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Contact Form */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>Send a Message</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Full Name</label>
              <input type="text" required placeholder="Enter name" style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Email Address</label>
              <input type="email" required placeholder="Enter email" style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Message Details</label>
              <textarea required rows="4" placeholder="How can we help you?" style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', resize: 'none' }}></textarea>
            </div>
            <button type="submit" style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', transition: 'var(--transition)', marginTop: '0.5rem', boxShadow: '0 4px 12px rgba(249,115,22,0.2)' }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-accent-hover)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-accent)'}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
