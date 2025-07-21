import './Banner.css';

export default function Banner() {
  return (
    <div className="banner-green">
      <div className="banner-green-icon">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="5" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/></svg>
        </a>
      </div>
      <div className="banner-green-text">Explore. Heal. Transform.</div>
    </div>
  );
} 