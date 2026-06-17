export default function Vehicles({ categoryFilter }) {
  const fleet = [
    { name: 'Royal Enfield Himalayan 450', category: 'Bikes', price: '₹1,200/day', type: 'Adventure', rating: '4.9', icon: '🏍️' },
    { name: 'KTM Duke 390 Naked', category: 'Bikes', price: '₹1,500/day', type: 'Street', rating: '4.8', icon: '🏍️' },
    { name: 'Mahindra Thar 4x4 Premium', category: 'Cars', price: '₹3,500/day', type: 'SUV Off-Road', rating: '4.9', icon: '🚗' },
    { name: 'Toyota Innova Crysta Lux', category: 'Cars', price: '₹4,500/day', type: 'MUV Luxury', rating: '4.9', icon: '🚙' },
    { name: 'Honda City i-VTEC Sedan', category: 'Cars', price: '₹2,500/day', type: 'Sedan Executive', rating: '4.7', icon: '🚗' },
    { name: 'Vespa VXL 150 Classic', category: 'Scooty', price: '₹700/day', type: 'Scooter Retro', rating: '4.6', icon: '🛵' },
    { name: 'Honda Activa 6G Active', category: 'Scooty', price: '₹450/day', type: 'Scooter Commute', rating: '4.5', icon: '🛵' },
    { name: 'Mahindra Treo Electric', category: 'Auto', price: '₹12/km', type: 'Electric Rickshaw', rating: '4.7', icon: '⚡' },
  ];

  const filteredFleet = categoryFilter
    ? fleet.filter(v => v.category.toLowerCase() === categoryFilter.toLowerCase())
    : fleet;

  return (
    <div className="page-view" style={{ padding: '2rem 2rem 4rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {filteredFleet.map((vehicle, index) => (
          <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.01)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.2rem', padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '14px' }}>{vehicle.icon}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', padding: '0.35rem 0.75rem', borderRadius: '99px', backgroundColor: 'rgba(249, 115, 22, 0.08)', color: 'var(--color-accent)' }}>
                  {vehicle.category}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: 'var(--color-text-primary)' }}>{vehicle.name}</h3>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                <span>🔧 {vehicle.type}</span>
                <span>⭐ {vehicle.rating} (Reviews)</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--color-text-secondary)' }}>Pricing starts at</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-accent)' }}>{vehicle.price}</span>
              </div>
              <button style={{ backgroundColor: 'var(--color-text-primary)', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)' }}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-accent)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-text-primary)'}>
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
