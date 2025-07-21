import React from 'react';

const programs = [
  {
    image: '/program1.png',
    title: 'Pilgrim Guides',
  },
  {
    image: '/program2.png',
    title: 'Pilgrim retreats',
  },
  {
    image: '/program3.png',
    title: 'Pilgrim sessions',
  },
  {
    image: '/program4.png',
    title: 'Pilgrim Events',
  },
  {
    image: '/program5.png',
    title: 'Pilgrim Bazaar',
  },
];

const ExplorePrograms = () => {
  return (
    <div style={{
      backgroundColor: '#f0f0f0',
      padding: '4rem 2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '2.5rem',
          textAlign: 'left'
        }}>
          Explore our Programs
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem'
        }}>
          {programs.map((program, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              transition: 'transform 0.3s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img src={program.image} alt={program.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{program.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExplorePrograms; 