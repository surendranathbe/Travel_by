export default function BookingVehicles() {
  const activeBookings = [
    { id: 'TB-78291', vehicle: 'Mahindra Thar 4x4', pickup: '18 June, 2026', dropoff: '22 June, 2026', status: 'Confirmed', price: '₹14,000', label: 'SUV' },
    { id: 'TB-76281', vehicle: 'Royal Enfield Himalayan 450', pickup: '25 June, 2026', dropoff: '28 June, 2026', status: 'Pending Approval', price: '₹3,600', label: 'Bike' }
  ];

  return (
    <div className="page-view" style={{ padding: '2rem 2rem 4rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>

      {activeBookings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeBookings.map((booking, index) => (
            <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', backgroundColor: '#ffffff', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(249, 115, 22, 0.08)', borderRadius: '16px', fontSize: '2rem' }}>
                  {booking.label === 'SUV' ? '🚗' : '🏍️'}
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-text-secondary)' }}>ID: {booking.id}</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0.25rem 0' }}>{booking.vehicle}</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                    <span>📅 Pickup: <strong>{booking.pickup}</strong></span>
                    <span>📅 Dropoff: <strong>{booking.dropoff}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Total Paid</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>{booking.price}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '700', backgroundColor: booking.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)', color: booking.status === 'Confirmed' ? '#10b981' : '#f59e0b', textAlign: 'center' }}>
                    ● {booking.status}
                  </span>
                  <button style={{ background: 'none', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-primary)', cursor: 'pointer', transition: 'var(--transition)' }}
                          onMouseOver={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                          onMouseOut={(e) => e.target.style.borderColor = '#cbd5e1'}>
                    Manage Booking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed #cbd5e1', borderRadius: '24px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>No Active Bookings</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>You don't have any upcoming vehicle rentals booked at the moment.</p>
          <button style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>
            Book a Vehicle
          </button>
        </div>
      )}
    </div>
  );
}
