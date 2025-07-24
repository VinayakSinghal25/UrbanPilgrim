// src/components/layout/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';

const Header = () => {
  const location = useLocation();
  const [showGuidesDropdown, setShowGuidesDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const guidesDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);

  useEffect(() => {
    function handleClickOutside(event) {
      if (guidesDropdownRef.current && !guidesDropdownRef.current.contains(event.target)) {
        setShowGuidesDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }
    if (showGuidesDropdown || showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGuidesDropdown, showUserDropdown]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    setShowUserDropdown(false);
    window.location.href = '/';
  };

  return (
    <header>
      {/* Animated underline styles and responsive styles */}
      <style>{`
        .nav-link-animated {
          position: relative;
          color: #222;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        .nav-link-animated::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 100%;
          height: 2px;
          background: #133A5E;
          transform: scaleX(0);
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
          transform-origin: left;
        }
        .nav-link-animated:hover::after,
        .nav-link-animated.active::after {
          transform: scaleX(1);
        }
        @media (max-width: 900px) {
          .header-main {
            padding: 0.7rem 1rem !important;
            min-height: 80px !important;
          }
          .header-logo-img {
            height: 60px !important;
          }
        }
        @media (max-width: 700px) {
          .header-main {
            min-height: 70px !important;
            padding: 0.5rem 0.7rem !important;
          }
          .header-logo-img {
            height: 50px !important;
          }
          .header-desktop-nav, .header-desktop-icons {
            display: none !important;
          }
          .header-mobile-menu-btn {
            display: flex !important;
          }
        }
        .header-mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          padding: 0 0.5rem;
        }
        .header-mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(255,255,255,0.98);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 90px;
        }
        .header-mobile-menu .nav-link-animated {
          font-size: 1.2rem;
          margin: 1.2rem 0;
        }
        .header-mobile-menu .header-mobile-icons {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
        }
      `}</style>
      {/* Main Header */}
      <div className="header-main" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1rem 2rem', 
        background: 'white', 
        minHeight: '90px',
        maxHeight: '90px',
        boxSizing: 'border-box'
      }}>
        {/* Logo */}
        <Link to="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          textDecoration: 'none',
          height: '70px',
          flexShrink: 0
        }}>
          <img 
            src="/logo.webp" 
            alt="Urban Pilgrim" 
            className="header-logo-img" 
            style={{ 
              height: '70px', 
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="header-desktop-nav" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2.2rem', 
          flex: 1, 
          justifyContent: 'center',
          height: '70px'
        }}>
          <Link 
            to="/" 
            className="nav-link-animated" 
            style={{ 
              color: isActive('/') ? '#133A5E' : '#222', 
              fontWeight: 400, 
              fontSize: '16px',
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Home
          </Link>
          <Link 
            to="/pilgrim-retreats" 
            className={`nav-link-animated${isActive('/pilgrim-retreats') ? ' active' : ''}`} 
            style={{ 
              color: isActive('/pilgrim-retreats') ? '#133A5E' : '#222', 
              fontWeight: 400, 
              fontSize: '16px',
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Pilgrim Retreats
          </Link>
          <Link 
            to="/pilgrim-sessions" 
            className={`nav-link-animated${isActive('/pilgrim-sessions') ? ' active' : ''}`} 
            style={{ 
              color: isActive('/pilgrim-sessions') ? '#133A5E' : '#222', 
              fontWeight: 400, 
              fontSize: '16px',
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Pilgrim Sessions
          </Link>
          
          {/* Pilgrim Guides Dropdown */}
          <div style={{ 
            position: 'relative',
            height: '100%',
            display: 'flex',
            alignItems: 'center'
          }} ref={guidesDropdownRef}>
            <span
              className={`nav-link-animated${isActive('/pilgrim-guides') ? ' active' : ''}`}
              style={{ 
                color: isActive('/pilgrim-guides') ? '#133A5E' : '#222', 
                fontWeight: 400, 
                fontSize: '16px', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                height: '100%'
              }}
              onClick={() => setShowGuidesDropdown((prev) => !prev)}
            >
              Pilgrim Guides 
              <svg style={{ marginLeft: 4 }} width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M5 8L10 13L15 8" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {showGuidesDropdown && (
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                background: 'white', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
                borderRadius: 6, 
                minWidth: 210, 
                zIndex: 10, 
                padding: '0.7rem 0',
                marginTop: '8px'
              }}>
                <div style={{ padding: '0.5rem 1.2rem', color: '#222', fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Yoga gurus</div>
                <div style={{ padding: '0.5rem 1.2rem', color: '#222', fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Meditation guides</div>
                <div style={{ padding: '0.5rem 1.2rem', color: '#222', fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Mental wellness counsellors</div>
                <div style={{ padding: '0.5rem 1.2rem', color: '#222', fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Nutrition experts</div>
                <div style={{ padding: '0.5rem 1.2rem', color: '#222', fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Ritual Pandits</div>
              </div>
            )}
          </div>
          
          <Link 
            to="/pilgrim-bazaar" 
            className={`nav-link-animated${isActive('/pilgrim-bazaar') ? ' active' : ''}`} 
            style={{ 
              color: isActive('/pilgrim-bazaar') ? '#133A5E' : '#222', 
              fontWeight: 400, 
              fontSize: '16px',
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Pilgrim Bazaar
          </Link>
          <Link 
            to="/contact" 
            className={`nav-link-animated${isActive('/contact') ? ' active' : ''}`} 
            style={{ 
              color: isActive('/contact') ? '#133A5E' : '#222', 
              fontWeight: 400, 
              fontSize: '16px',
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Contact
          </Link>
        </nav>
        
        {/* Desktop Icons */}
        <div className="header-desktop-icons" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2.2rem',
          height: '70px',
          flexShrink: 0
        }}>
          {/* Search Icon */}
          <button style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '44px',
            width: '44px'
          }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#222">
              <circle cx="11" cy="11" r="7" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          
          {/* User Icon with Dropdown */}
          <div style={{ 
            position: 'relative',
            height: '100%',
            display: 'flex',
            alignItems: 'center'
          }} ref={userDropdownRef}>
            <button
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '44px',
                width: '44px'
              }}
              aria-haspopup="true"
              aria-expanded={showUserDropdown}
              onClick={() => setShowUserDropdown((prev) => !prev)}
              tabIndex={0}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#222">
                <circle cx="12" cy="8" r="4" strokeWidth="2"/>
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" strokeWidth="2"/>
              </svg>
            </button>
            {showUserDropdown && (
              <div style={{ 
                position: 'absolute', 
                right: 0, 
                top: '100%', 
                background: 'white', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
                borderRadius: 6, 
                minWidth: 160, 
                zIndex: 20, 
                padding: '0.7rem 0',
                marginTop: '8px'
              }}>
                {token && user ? (
                  <>
                    <Link 
                      to="/profile" 
                      style={{ 
                        display: 'block', 
                        padding: '0.6rem 1.2rem', 
                        color: '#222', 
                        fontSize: 15, 
                        textDecoration: 'none', 
                        whiteSpace: 'nowrap' 
                      }} 
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{ 
                        display: 'block', 
                        width: '100%', 
                        textAlign: 'left', 
                        padding: '0.6rem 1.2rem', 
                        color: '#b91c1c', 
                        fontSize: 15, 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        whiteSpace: 'nowrap' 
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      style={{ 
                        display: 'block', 
                        padding: '0.6rem 1.2rem', 
                        color: '#222', 
                        fontSize: 15, 
                        textDecoration: 'none', 
                        whiteSpace: 'nowrap' 
                      }} 
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      style={{ 
                        display: 'block', 
                        padding: '0.6rem 1.2rem', 
                        color: '#222', 
                        fontSize: 15, 
                        textDecoration: 'none', 
                        whiteSpace: 'nowrap' 
                      }} 
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Bag Icon */}
          <button style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '44px',
            width: '44px'
          }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#222">
              <path d="M6 7V6a6 6 0 1112 0v1" strokeWidth="2"/>
              <rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="2"/>
            </svg>
          </button>
        </div>
        
        {/* Mobile Hamburger Button */}
        <button className="header-mobile-menu-btn" onClick={() => setMobileMenuOpen((prev) => !prev)}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#133A5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="header-mobile-menu">
          <Link to="/" className="nav-link-animated" style={{ color: isActive('/') ? '#133A5E' : '#222', fontWeight: 400 }} onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/pilgrim-retreats" className="nav-link-animated" style={{ color: isActive('/pilgrim-retreats') ? '#133A5E' : '#222', fontWeight: 400 }} onClick={() => setMobileMenuOpen(false)}>Pilgrim Retreats</Link>
          <Link to="/pilgrim-sessions" className="nav-link-animated" style={{ color: isActive('/pilgrim-sessions') ? '#133A5E' : '#222', fontWeight: 400 }} onClick={() => setMobileMenuOpen(false)}>Pilgrim Sessions</Link>
          {/* Pilgrim Guides Dropdown in Mobile */}
          <div style={{ width: '100%', textAlign: 'center', margin: '1.2rem 0' }}>
            <span className="nav-link-animated" style={{ color: isActive('/pilgrim-guides') ? '#133A5E' : '#222', fontWeight: 400, cursor: 'pointer' }}>
              Pilgrim Guides
            </span>
            <div style={{ marginTop: '0.7rem' }}>
              <div style={{ padding: '0.5rem 1.2rem', color: '#222', fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Yoga gurus</div>
              <div style={{ padding: '0.5rem 1.2rem', color: '#222', fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Meditation guides</div>
              <div style={{ padding: '0.5rem 1.2rem', color: '#222', fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Mental wellness counsellors</div>
              <div style={{ padding: '0.5rem 1.2rem', color: '#222', fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Nutrition experts</div>
              <div style={{ padding: '0.5rem 1.2rem', color: '#222', fontSize: '16px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Ritual Pandits</div>
            </div>
          </div>
          <Link to="/pilgrim-bazaar" className="nav-link-animated" style={{ color: isActive('/pilgrim-bazaar') ? '#133A5E' : '#222', fontWeight: 400 }} onClick={() => setMobileMenuOpen(false)}>Pilgrim Bazaar</Link>
          <Link to="/contact" className="nav-link-animated" style={{ color: isActive('/contact') ? '#133A5E' : '#222', fontWeight: 400 }} onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <div className="header-mobile-icons">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#222"><circle cx="11" cy="11" r="7" strokeWidth="2"/><path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#222"><circle cx="12" cy="8" r="4" strokeWidth="2"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7" strokeWidth="2"/></svg>
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#222"><path d="M6 7V6a6 6 0 1112 0v1" strokeWidth="2"/><rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="2"/></svg>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;