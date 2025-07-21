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

const WellnessRetreats = () => {
  return (
    <div style={{
      padding: '4rem 2rem',
      backgroundColor: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}>
            Book your Pilgrim Wellness Retreat
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#666'
          }}>
            Embark on soulful retreats that blend Indian wellness, nature, and culture—crafted to reconnect your mind, body, and spirit
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          {retreats.map((retreat, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '4px',
              overflow: 'hidden',
              transition: 'transform 0.3s',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img src={retreat.image} alt={retreat.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
              <div style={{ padding: '1rem 0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'normal', marginBottom: '0.5rem', minHeight: '60px', textDecoration: 'underline' }}>{retreat.title}</h3>
                <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>{retreat.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WellnessRetreats; 