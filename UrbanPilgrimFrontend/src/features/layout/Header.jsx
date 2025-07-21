import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={`nav-link-animated ${isActive ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
      {children}
    </Link>
  );
};

const guides = [
  { name: 'Yoga gurus', path: '/pilgrim-guides/yoga-gurus' },
  { name: 'Meditation guides', path: '/pilgrim-guides/meditation-guides' },
  { name: 'Mental wellness counsellors', path: '/pilgrim-guides/mental-wellness-counsellors' },
  { name: 'Nutrition experts', path: '/pilgrim-guides/nutrition-experts' },
  { name: 'Ritual Pandits', path: '/pilgrim-guides/ritual-pandits' },
];

const Header = () => {
  const [showGuidesDropdown, setShowGuidesDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const guidesDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const closeDropdowns = () => {
    setShowGuidesDropdown(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guidesDropdownRef.current && !guidesDropdownRef.current.contains(event.target)) {
        setShowGuidesDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.header-mobile-menu-btn')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header style={{ position: 'fixed', top: '40px', left: '0', width: '100%', zIndex: 1000, backgroundColor: 'white' }}>
      <style>{`
        .nav-link-animated {
          position: relative;
          color: #333;
          text-decoration: none;
          padding: 10px 0;
          font-size: 16px;
          transition: color 0.3s;
        }

        .nav-link-animated::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: #11705E;
          transform-origin: bottom right;
          transition: transform 0.25s ease-out;
        }

        .nav-link-animated:hover::after, .nav-link-animated.active::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
        
        .nav-link-animated.active {
          color: #11705E;
        }
        
        /* Mobile menu styles */
        .header-mobile-menu {
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          right: 0;
          width: 80%;
          max-width: 300px;
          height: 100%;
          background: white;
          box-shadow: -2px 0 5px rgba(0,0,0,0.1);
          transform: translateX(100%);
          transition: transform 0.3s ease-in-out;
          padding: 2rem;
          z-index: 1100;
        }

        .header-mobile-menu.open {
          transform: translateX(0);
        }
        
        @media (max-width: 1024px) {
          .header-desktop-nav, .header-desktop-icons {
            display: none;
          }
          .header-mobile-menu-btn {
            display: block;
          }
        }
        @media (min-width: 1025px) {
          .header-mobile-menu-btn {
            display: none;
          }
        }
      `}</style>
      <div
        className="header-main"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '80px',
          padding: '0 2rem',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <Link to="/" style={{ flexShrink: 0 }}>
          <img src="/logo.webp" alt="Urban Pilgrim" style={{ height: '50px' }} />
        </Link>

        <nav className="header-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <NavLink to="/">Home</NavLink>
          <div style={{ position: 'relative' }} ref={guidesDropdownRef}>
            <span
              onClick={() => setShowGuidesDropdown((prev) => !prev)}
              className="nav-link-animated"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Pilgrim Guides
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: showGuidesDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
            {showGuidesDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '10px',
                width: '280px',
                zIndex: '1200'
              }}>
                {guides.map((guide) => (
                  <Link
                    key={guide.name}
                    to={guide.path}
                    onClick={closeDropdowns}
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      color: '#333',
                      textDecoration: 'none',
                      fontSize: '16px',
                      borderRadius: '6px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {guide.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/pilgrim-retreats">Pilgrim Retreats</NavLink>
          <NavLink to="/pilgrim-bazaar">Pilgrim Bazaar</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <div className="header-desktop-icons" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Icons */}
        </div>
        
        <button className="header-mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          {/* Hamburger Icon */}
        </button>
      </div>
      
      <div ref={mobileMenuRef} className={`header-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Mobile menu content */}
      </div>
    </header>
  );
};

export default Header; 