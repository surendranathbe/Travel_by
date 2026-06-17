export default function Trips() {
  const packages = [
    { title: 'Western Ghats Roadtrip', duration: '3 Nights / 4 Days', route: 'Mumbai - Lonavala - Mahabaleshwar', price: '₹12,499/person', icon: '⛰️', desc: 'Experience misty mountain passes, lush waterfalls, and scenic viewpoints.' },
    { title: 'Coastal Route Escape', duration: '4 Nights / 5 Days', route: 'Goa - Gokarna - Karwar', price: '₹14,999/person', icon: '🏖️', desc: 'Drive along sandy beaches, historic coastal forts, and enjoy water sports.' },
    { title: 'Royal Rajasthan Journey', duration: '5 Nights / 6 Days', route: 'Jaipur - Jodhpur - Udaipur', price: '₹18,999/person', icon: '🏰', desc: 'Discover heritage palaces, vibrant desert culture, and majestic lake cities.' },
    { title: 'Himalayan Ridge Explorer', duration: '6 Nights / 7 Days', route: 'Manali - Rohtang Pass - Kasol', price: '₹22,499/person', icon: '🏔️', desc: 'Navigate high altitude paths, pine forests, and serene riverside cafes.' }
  ];

  return (
    <div className="page-view" style={{ padding: '2rem 2rem 4rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {packages.map((pkg, index) => (
          <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2rem', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.01)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', backgroundColor: 'var(--color-accent)' }}></div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{pkg.icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-secondary)', padding: '0.35rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  🕒 {pkg.duration}
                </span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 0.5rem 0' }}>{pkg.title}</h3>
              <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-accent)', margin: '0 0 1rem 0' }}>📍 {pkg.route}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>{pkg.desc}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--color-text-secondary)' }}>All-inclusive package</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>{pkg.price}</span>
              </div>
              <button style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)', boxShadow: '0 4px 12px rgba(249,115,22,0.2)' }}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-accent-hover)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-accent)'}>
                Explore Package
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
