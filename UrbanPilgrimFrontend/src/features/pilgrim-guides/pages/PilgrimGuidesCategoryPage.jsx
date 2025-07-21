import React from 'react';
import { useParams } from 'react-router-dom';

const PilgrimGuidesCategoryPage = () => {
  const { category } = useParams();

  // Capitalize the first letter of the category for display
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{displayCategory}</h1>
      <p style={{ fontSize: '1.25rem', color: '#666' }}>
        Find and connect with our trusted {displayCategory.toLowerCase()}.
      </p>
    </div>
  );
};

export default PilgrimGuidesCategoryPage; 