import React from 'react';

const SessionsLiveOrDemand = () => (
  <div style={{ background: '#fff', padding: '3rem 1rem 2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
    <h2 style={{
      textAlign: 'center',
      fontSize: '2.5rem',
      fontWeight: 400,
      marginBottom: '2.5rem',
      letterSpacing: '0.5px',
    }}>
      Live or on-demand classes
    </h2>
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2rem',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }}>
      <ul style={{ flex: 1, minWidth: 320, fontSize: '1.15rem', color: '#222', listStyle: 'circle inside', lineHeight: 2 }}>
        <li>Join guided sessions from anywhere—yoga, meditation, stress healing, breathwork & more</li>
        <li>Flexible time slots, <b>real-time interaction</b>, personalized experience</li>
        <li>Deeply rooted in <b>Indian wellness philosophies</b>, adapted for modern lifestyles</li>
      </ul>
      <ul style={{ flex: 1, minWidth: 320, fontSize: '1.15rem', color: '#222', listStyle: 'circle inside', lineHeight: 2 }}>
        <li>Book with ease: pay-per-session or sign up for curated programs</li>
        <li>Led by experienced Urban Pilgrim guides</li>
      </ul>
    </div>
  </div>
);

export default SessionsLiveOrDemand; 