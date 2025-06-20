import './Banner.css';
import { FaInstagram } from 'react-icons/fa';

export default function Banner() {
  return (
    <div className="banner">
      <div className="banner-icon">
        <FaInstagram />
      </div>
      <p className="banner-text">Explore. Heal. Transform.</p>
    </div>
  );
}
