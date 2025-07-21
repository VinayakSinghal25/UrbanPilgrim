import React from 'react';

const SessionsShortFormat = () => (
  <div style={{ background: '#fff', padding: '3rem 1rem 2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
    <h2 style={{
      textAlign: 'center',
      fontSize: '2.5rem',
      fontWeight: 400,
      marginBottom: '2.5rem',
      letterSpacing: '0.5px',
    }}>
      Short format wellness programs and sessions
    </h2>
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2rem',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }}>
      <ul style={{ flex: 1, minWidth: 320, fontSize: '1.15rem', color: '#222', listStyle: 'circle inside', lineHeight: 2 }}>
        <li>Expert-led sessions in <b>yoga, meditation, and holistic wellness</b></li>
        <li>Rooted in Indian wisdom, designed for modern lifestyles</li>
        <li>Flexible formats: group, private, and online options</li>
      </ul>
      <ul style={{ flex: 1, minWidth: 320, fontSize: '1.15rem', color: '#222', listStyle: 'circle inside', lineHeight: 2 }}>
        <li>Focus on <b>balance, clarity, and holistic living</b></li>
        <li>Ideal for seekers at any stage—beginner to advanced</li>
      </ul>
    </div>
  </div>
);

export default SessionsShortFormat; 