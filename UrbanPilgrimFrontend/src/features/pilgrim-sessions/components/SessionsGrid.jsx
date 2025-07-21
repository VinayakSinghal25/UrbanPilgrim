import React from 'react';

const sessions = [
  {
    image: '/wellness-program-1.png',
    title: 'Menopausal fitness - A 4 day regime curated by Aarti Prasad',
    price: 'Rs. 4,000.00',
  },
  {
    image: '/wellness-program-2.png',
    title: 'Discover your true self - A 28 day soul search journey with Rohini Singh Sisodia',
    price: 'Rs. 14,999.00',
  },
];

const SessionsGrid = () => (
  <div style={{ background: '#fff', padding: '2rem 1rem 4rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
    {/* Filter/Sort Bar */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '1.1rem', color: '#444' }}>
        <span style={{ color: '#888' }}>Filter:</span>
        <span style={{ cursor: 'pointer' }}>Availability <span style={{ fontSize: '1.2em' }}>▼</span></span>
        <span style={{ cursor: 'pointer' }}>Price <span style={{ fontSize: '1.2em' }}>▼</span></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '1.1rem', color: '#444' }}>
        <span>Sort by:</span>
        <span style={{ cursor: 'pointer' }}>Featured <span style={{ fontSize: '1.2em' }}>▼</span></span>
        <span style={{ color: '#888' }}>{sessions.length} products</span>
      </div>
    </div>
    {/* Sessions Cards Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '2.5rem',
      justifyContent: 'center',
    }}>
      {sessions.map((session, idx) => (
        <div key={idx} style={{ textAlign: 'center', background: '#fff' }}>
          <img src={session.image} alt={session.title} style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '2px', marginBottom: '1.2rem' }} />
          <div style={{ fontSize: '1.08rem', color: '#222', marginBottom: '0.7rem', minHeight: '48px', textAlign: 'center' }}>
            {session.title}
          </div>
          <div style={{ fontSize: '1.15rem', color: '#222', fontWeight: 500 }}>{session.price}</div>
        </div>
      ))}
    </div>
  </div>
);

export default SessionsGrid; 