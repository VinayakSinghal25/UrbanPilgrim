import React, { useState, useEffect, useRef } from 'react';
import UpcomingEvents from '../components/UpcomingEvents';
import ExplorePrograms from '../components/ExplorePrograms';
import CoreValues from '../components/CoreValues';
import FindGuides from '../components/FindGuides';
import WellnessRetreats from '../components/WellnessRetreats';
import WellnessPrograms from '../components/WellnessPrograms';
import PilgrimBazaar from '../components/PilgrimBazaar';
import FadeInSection from '../components/FadeInSection';

const images = ['/2.webp', '/1.webp', '/2.webp'];

const HomePage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [currentIndex]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <div style={{
        height: '600px',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: '#f8f8f8',
      }}>
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
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
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                flex: '0 0 100%',
                display: 'block',
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
      <FadeInSection><UpcomingEvents /></FadeInSection>
      <FadeInSection delay={100}><ExplorePrograms /></FadeInSection>
      <FadeInSection delay={200}><CoreValues /></FadeInSection>
      <FadeInSection delay={300}><FindGuides /></FadeInSection>
      <FadeInSection delay={400}><WellnessRetreats /></FadeInSection>
      <FadeInSection delay={500}><WellnessPrograms /></FadeInSection>
      <FadeInSection delay={600}><PilgrimBazaar /></FadeInSection>
    </>
  );
};

export default HomePage; 