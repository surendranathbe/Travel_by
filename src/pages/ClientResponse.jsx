export default function ClientResponse() {
  const reviews = [
    { name: 'Aditya Verma', city: 'Mumbai', text: 'Renting a Thar for our trip to Lonavala was a breeze! The vehicle was fully sanitized and ran perfectly. High quality customer service!', rating: '⭐⭐⭐⭐⭐', initials: 'AV' },
    { name: 'Sneha Patel', city: 'Pune', text: 'I booked the Himalayan for a weekend solo ride. Super easy booking system and door delivery was right on time. Highly recommended!', rating: '⭐⭐⭐⭐⭐', initials: 'SP' },
    { name: 'Rahul Sharma', city: 'Delhi', text: 'The pricing is extremely transparent. Renting an Innova for our family road trip made it comfortable and hassle-free. Thanks Travel_by!', rating: '⭐⭐⭐⭐⭐', initials: 'RS' },
    { name: 'Priya Nair', city: 'Bangalore', text: 'Vespa scooty rentals are super neat and convenient for daily commutes. Absolutely loved the retro look and clean running state.', rating: '⭐⭐⭐⭐☆', initials: 'PN' }
  ];

  return (
    <div className="page-view" style={{ padding: '2rem 2rem 4rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {reviews.map((rev, index) => (
          <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', backgroundColor: '#ffffff', boxShadow: '0 4px 15px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(249, 115, 22, 0.1)', color: 'var(--color-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
                  {rev.initials}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.15rem 0', fontWeight: '800', color: 'var(--color-text-primary)' }}>{rev.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>📍 Traveler from {rev.city}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
                {rev.rating}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                "{rev.text}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
