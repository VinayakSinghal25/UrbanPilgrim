import React from 'react';

const PilgrimBazaar = () => {
  const containerStyle = {
    position: 'relative',
    backgroundImage: "url('/bazaar-bg.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif'
  };

  const contentBoxStyle = {
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
    padding: '3rem',
    maxWidth: '600px',
    width: '90%',
  };

  const buttonStyle = {
    backgroundColor: '#222',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1.5rem',
    transition: 'background-color 0.3s'
  };

  return (
    <div style={containerStyle}>
      <div style={contentBoxStyle}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Pilgrim Bazaar
        </h2>
        <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
          A soulful marketplace for spiritual, wellness, and heritage-inspired products
        </p>
        <button 
          style={buttonStyle}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#444'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#222'}
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default PilgrimBazaar; 