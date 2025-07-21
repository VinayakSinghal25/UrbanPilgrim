import React from 'react';

const values = [
  {
    title: 'Rooted in Indian Wisdom',
    description: 'Authentic, not commercialized wellness.',
  },
  {
    title: 'Expert-verified Programs',
    description: 'Only qualified, experienced professionals on our platform.',
  },
  {
    title: 'Trusted, Global Community',
    description: 'Your wellness, globally curated and locally rooted.',
  },
  {
    title: 'Transparent Listings & Reviews',
    description: 'Read real reviews. Choose what resonates. No surprises.',
  },
];

const CoreValues = () => {
  return (
    <div style={{
      padding: '4rem 2rem',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        textAlign: 'center'
      }}>
        {values.map((value, index) => (
          <div key={index} style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              {value.title}
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.5',
              maxWidth: '250px'
            }}>
              {value.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoreValues; 