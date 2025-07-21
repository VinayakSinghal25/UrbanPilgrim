import React from 'react';
import RetreatsShortFormat from '../components/RetreatsShortFormat';
import RetreatsGrid from '../components/RetreatsGrid';
import FadeInSection from '../../home/components/FadeInSection';

const PilgrimRetreatsPage = () => {
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
          src="/3.webp"
          alt="Pilgrim Retreats Hero"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
      <FadeInSection><RetreatsShortFormat /></FadeInSection>
      <FadeInSection delay={100}><RetreatsGrid /></FadeInSection>
    </div>
  );
};

export default PilgrimRetreatsPage; 