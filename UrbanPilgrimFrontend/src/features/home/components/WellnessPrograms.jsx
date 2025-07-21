import React from 'react';

const programs = [
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

const WellnessPrograms = () => {
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
            Find your Pilgrim wellness programs
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#666'
          }}>
            Join expert-led Pilgrim Sessions rooted in Indian wisdom—offering yoga, meditation, and wellness practices for balance, clarity, and holistic living
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          {programs.map((program, index) => (
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
              <img src={program.image} alt={program.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
              <div style={{ padding: '1rem 0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'normal', marginBottom: '0.5rem', minHeight: '60px' }}>{program.title}</h3>
                <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>{program.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WellnessPrograms; 