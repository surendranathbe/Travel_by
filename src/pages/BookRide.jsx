export default function BookRide() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('🎉 Ride request submitted! Checking driver & vehicle availability in your area...');
    e.target.reset();
  };

  return (
    <div className="page-view" style={{ padding: '2rem 2rem 4rem', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Full Name</label>
              <input type="text" required placeholder="Your name" style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Phone Number</label>
              <input type="tel" required placeholder="Phone number" style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Pickup Location</label>
            <input type="text" required placeholder="Enter pickup address or city" style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Drop Location</label>
            <input type="text" required placeholder="Enter destination address or city" style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Vehicle Type</label>
              <select required defaultValue="" style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', backgroundColor: '#ffffff' }}>
                <option value="" disabled>Select vehicle type</option>
                <option value="bike">Bike (Self-Drive)</option>
                <option value="scooty">Scooty (Self-Drive)</option>
                <option value="car">Car (Self-Drive)</option>
                <option value="cab">Premium Cab (with Chauffeur)</option>
                <option value="auto">Auto Rickshaw</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Pickup Date & Time</label>
              <input type="datetime-local" required style={{ padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }} />
            </div>
          </div>

          <button type="submit" style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff', border: 'none', padding: '1rem', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem', transition: 'var(--transition)', marginTop: '1rem', boxShadow: '0 6px 20px rgba(249, 115, 22, 0.25)' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-accent-hover)'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-accent)'}>
            Request Ride Allocation
          </button>
        </form>
      </div>
    </div>
  );
}
