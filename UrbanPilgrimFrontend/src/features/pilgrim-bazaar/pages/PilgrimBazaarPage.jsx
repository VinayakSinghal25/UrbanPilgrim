import React from 'react';
import FadeInSection from '../../home/components/FadeInSection';

const BazaarMerchandiseSection = () => (
  <div style={{ background: '#fff', padding: '3rem 1rem 2rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
    <h2 style={{
      textAlign: 'center',
      fontSize: '2.8rem',
      fontWeight: 400,
      marginBottom: '2.5rem',
      letterSpacing: '0.5px',
    }}>
      Merchandise and spiritual wellness tools
    </h2>
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2rem',
      justifyContent: 'center',
      alignItems: 'flex-start',
    }}>
      <ul style={{ flex: 1, minWidth: 340, fontSize: '1.15rem', color: '#222', listStyle: 'circle inside', lineHeight: 2, maxWidth: 600 }}>
        <li>Curated collection of <b>ritual tools, wellness kits, artisanal goods, and sacred accessories</b></li>
        <li>Products rooted in Indian craftsmanship and spiritual traditions</li>
        <li>Explore incense, mala beads, ayurvedic blends, copperware, spiritual books, and more</li>
      </ul>
      <ul style={{ flex: 1, minWidth: 340, fontSize: '1.15rem', color: '#222', listStyle: 'circle inside', lineHeight: 2, maxWidth: 600 }}>
        <li>Ethically sourced, soulfully designed, consciously packaged</li>
        <li>Support <b>heritage artisans and mindful living</b></li>
      </ul>
    </div>
  </div>
);

const PilgrimBazaarPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <div style={{
        width: '100%',
        height: '600px',
        overflow: 'hidden',
        position: 'relative',
        background: '#f8f8f8',
        marginBottom: '2rem',
      }}>
        <img
          src="/5.webp"
          alt="Pilgrim Bazaar Hero"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
      <FadeInSection><BazaarMerchandiseSection /></FadeInSection>
    </div>
  );
};

export default PilgrimBazaarPage; 