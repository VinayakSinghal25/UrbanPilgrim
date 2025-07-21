import React from 'react';

const UpcomingEvents = () => {
  return (
    <div style={{ 
      padding: '4rem 2rem', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'left'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#333'
        }}>
          Upcoming events
        </h2>
        <p style={{ 
          fontSize: '15px', 
          color: '#666', 
          marginBottom: '2rem',
          lineHeight: '1.5'
        }}>
          Find and book upcoming wellness events, workshops, and classes led by trusted Urban Pilgrim guides—happening near you and across soulful spaces
        </p>
        <p style={{
          fontSize: '16px',
          color: '#888',
          fontStyle: 'italic',
          padding: '2rem 0'
        }}>
          Event cards will be available soon...
        </p>
      </div>
    </div>
  );
};

export default UpcomingEvents;
 