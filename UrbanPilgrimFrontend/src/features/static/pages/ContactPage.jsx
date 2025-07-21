import React from 'react';

const ContactPage = () => {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Contact Us</h1>
      <p style={{ fontSize: '1.1rem', color: '#444', marginBottom: '1.5rem' }}>
        Get in touch with the Urban Pilgrim team. We'd love to hear from you!
      </p>
      <p style={{ color: '#888', marginBottom: '2.5rem' }}>
        This page is currently under development. Please check back soon for our contact form and information.
      </p>
      <button
        style={{
          background: 'linear-gradient(90deg, #11705E 0%, #1DBF73 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          padding: '1rem 2.5rem',
          fontSize: '1.15rem',
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(17,112,94,0.10)',
          cursor: 'pointer',
          transition: 'background 0.2s, transform 0.2s',
          marginTop: '1rem',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1DBF73 0%, #11705E 100%)'}
        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #11705E 0%, #1DBF73 100%)'}
      >
        Contact Us
      </button>
    </div>
  );
};

export default ContactPage;