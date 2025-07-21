import React from 'react';
import SessionsLiveOrDemand from '../components/SessionsLiveOrDemand';
import SessionsGrid from '../components/SessionsGrid';
import FadeInSection from '../../home/components/FadeInSection';

const PilgrimSessionsPage = () => {
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
          src="/4.webp"
          alt="Pilgrim Sessions Hero"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
      <FadeInSection><SessionsLiveOrDemand /></FadeInSection>
      <FadeInSection delay={100}><SessionsGrid /></FadeInSection>
    </div>
  );
};

export default PilgrimSessionsPage; 