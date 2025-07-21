import React from 'react';

const retreats = [
  {
    image: '/retreat1.png',
    title: 'Rejuvenate in the Himalayas - Immerse in nature & local culture at Kasol (3N4D)',
    price: 'From Rs. 15,999.00',
  },
  {
    image: '/retreat2.png',
    title: 'Reflect & Reboot by the Ganges - Spiritual immersion at Rishikesh (3N4D)',
    price: 'From Rs. 14,999.00',
  },
  {
    image: '/retreat3.png',
    title: 'Whispers of the valley - Spiritual immersion in nature at Dharamshala (3N4D)',
    price: 'From Rs. 14,999.00',
  },
  {
    image: '/retreat4.png',
    title: 'Return to the source - A spiritual immersion at Varanasi (3N/4D)',
    price: 'From Rs. 12,599.00',
  },
];

const RetreatsGrid = () => (
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
        <span style={{ color: '#888' }}>{retreats.length} products</span>
      </div>
    </div>
    {/* Retreat Cards Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '2.5rem',
      justifyContent: 'center',
    }}>
      {retreats.map((retreat, idx) => (
        <div key={idx} style={{ textAlign: 'center', background: '#fff' }}>
          <img src={retreat.image} alt={retreat.title} style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '2px', marginBottom: '1.2rem' }} />
          <div style={{ fontSize: '1.08rem', color: '#222', marginBottom: '0.7rem', minHeight: '48px', textAlign: 'center', textDecoration: idx === 2 ? 'underline' : 'none' }}>
            {retreat.title}
          </div>
          <div style={{ fontSize: '1.15rem', color: '#222', fontWeight: 500 }}>{retreat.price}</div>
        </div>
      ))}
    </div>
  </div>
);

export default RetreatsGrid; 