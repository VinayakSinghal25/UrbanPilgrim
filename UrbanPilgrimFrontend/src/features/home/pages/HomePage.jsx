import React, { useState, useEffect } from 'react';

const images = ['/2.webp', '/1.webp', '/2.webp'];

const HomePage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // 5-second gap

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div style={{ height: '600px', width: '100vw', overflow: 'hidden', position: 'relative', left: '50%', transform: 'translateX(-50%)', background: '#f8f8f8' }}>
      <div
        style={{
          display: 'flex',
          height: '100%',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Hero slide ${index + 1}`}
            style={{
              width: '100vw',
              height: '100%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      {/* Navigation Dots */}
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: currentIndex === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              padding: 0,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage; 