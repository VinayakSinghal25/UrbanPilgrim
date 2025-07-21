import React from 'react';

const RetreatsShortFormat = () => (
  <div style={{ background: '#fff', padding: '3rem 1rem 2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
    <h2 style={{
      textAlign: 'center',
      fontSize: '2.5rem',
      fontWeight: 400,
      marginBottom: '2.5rem',
      letterSpacing: '0.5px',
    }}>
      Short format retreats and soulful getaways
    </h2>
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2rem',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }}>
      <ul style={{ flex: 1, minWidth: 320, fontSize: '1.15rem', color: '#222', listStyle: 'circle inside', lineHeight: 2 }}>
        <li>Handpicked 3–5 day retreats blending <b>wellness, culture, and nature</b></li>
        <li>Hosted in soulful destinations with local character and spiritual energy</li>
        <li>Designed around <b>Indian rituals, mindful travel</b> and immersive storytelling</li>
      </ul>
      <ul style={{ flex: 1, minWidth: 320, fontSize: '1.15rem', color: '#222', listStyle: 'circle inside', lineHeight: 2 }}>
        <li>Includes activities like yoga, guided reflection, forest walks, cultural visits, and rituals</li>
        <li>Ideal for seekers looking for more than rest—<b>looking for reconnection</b></li>
      </ul>
    </div>
  </div>
);

export default RetreatsShortFormat; 