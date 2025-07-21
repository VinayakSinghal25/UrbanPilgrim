import React from 'react';

const AboutPage = () => {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>About Us</h1>
      <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: '800px', textAlign: 'center' }}>
        Learn more about Urban Pilgrim's mission to provide authentic, expert-verified wellness experiences.
      </p>
    </div>
  );
};

export default AboutPage; 