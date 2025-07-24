import React from 'react';
import usePilgrimExperiences from '../../../hooks/usePilgrimExperience';
import '../components/RetreatGrid.css';
import { Link } from 'react-router-dom';

const RetreatsGrid = () => {
  const { experiences, loading, error } = usePilgrimExperiences();
  console.log("Experiences data:", experiences);


  return (
    <div style={{ background: '#fff', padding: '2rem 1rem 4rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Filter/Sort Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '1.1rem', color: '#444' }}>
          <span style={{ color: '#888' }}>Filter:</span>
          <span style={{ cursor: 'pointer' }}>Availability <span style={{ fontSize: '1.2em' }}>▼</span></span>
          <span style={{ cursor: 'pointer' }}>Price <span style={{ fontSize: '1.2em' }}>▼</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '1.1rem', color: '#444' }}>
          <span>Sort by:</span>
          <span style={{ cursor: 'pointer' }}>Featured <span style={{ fontSize: '1.2em' }}>▼</span></span>
          <span style={{ color: '#888' }}>{experiences.length} products</span>
        </div>
      </div>

      {/* Loading and Error Handling */}
      {loading && <div style={{ textAlign: 'center', fontSize: '1.2rem' }}>Loading...</div>}
      {error && <div style={{ textAlign: 'center', color: 'red', fontSize: '1.1rem' }}>{error}</div>}

      {/* Retreat Cards Grid */}
      <div className="retreats-grid">
        {!loading && !error && experiences.map((exp, idx) => (
          <Link
            to={`/pilgrim-experiences/${exp._id}`}
            key={exp._id || idx}
            className="retreat-card-link"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="retreat-card">
              <img
                src={exp.images?.[0]?.url || '/fallback.jpg'}
                alt={exp.title || 'Pilgrim Experience'}
                className="retreat-image"
              />
              <div style={{ padding: '1rem 0.5rem 0.5rem 0.5rem' }}>
                <div className="retreat-title">{exp.name}</div>
                <div className="retreat-price">
                  {exp.price ? `From Rs. ${Number(exp.price).toLocaleString('en-IN')}` : 'Price on request'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RetreatsGrid;
