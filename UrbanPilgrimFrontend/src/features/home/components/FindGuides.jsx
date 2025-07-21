import React from 'react';

const guides = [
  {
    image: '/guide1.png',
    title: 'Yoga hour - by Manish Kumar (Bihar School of Yoga)',
    price: 'From Rs. 1,000.00',
  },
  {
    image: '/guide2.png',
    title: 'Yoga hour - by Manjunath',
    price: 'From Rs. 450.00',
  },
  {
    image: '/guide3.png',
    title: 'Iyengar Yoga Workshop with Navita – Precision, Balance, and Alignment',
    price: 'Rs. 1,000.00',
  },
  {
    image: '/guide4.png',
    title: 'Online group yoga session - by Meghaa Chaudhri',
    price: 'Rs. 600.00',
  },
  {
    image: '/guide5.png',
    title: 'Yoga hour - with Prerna Sinha',
    price: 'Rs. 450.00',
  },
];

const FindGuides = () => {
  return (
    <div style={{
      padding: '4rem 2rem',
      backgroundColor: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}>
            Find your Pilgrim Guides
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#666'
          }}>
            Discover, connect, and book sessions with experts who truly align with your path.
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem'
        }}>
          {guides.map((guide, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '4px',
              overflow: 'hidden',
              transition: 'transform 0.3s',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img src={guide.image} alt={guide.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
              <div style={{ padding: '1rem 0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'normal', marginBottom: '0.5rem', minHeight: '40px' }}>{guide.title}</h3>
                <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>{guide.price}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button style={{
            backgroundColor: '#11705E',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2.5rem',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0e5a4a'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#11705E'}
          >
            View all
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindGuides; 