// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Urban Pilgrim</h3>
            <p className="text-gray-400">
              Awaken. Explore. Transform. Your trusted companion for transformative spiritual journeys.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/who-we-are" className="text-gray-400 hover:text-white">Who We Are</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              <li><Link to="/join-guides" className="text-gray-400 hover:text-white">Join as a Guide</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Experiences */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li><Link to="/pilgrim-experiences" className="text-gray-400 hover:text-white">Pilgrim Experiences</Link></li>
              <li><Link to="/wellness-guides" className="text-gray-400 hover:text-white">Wellness Guides</Link></li>
              <li><Link to="/pilgrim-bazaar" className="text-gray-400 hover:text-white">Pilgrim Bazaar</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><FaFacebookF /></a>
              <a href="#" className="text-gray-400 hover:text-white"><FaTwitter /></a>
              <a href="#" className="text-gray-400 hover:text-white"><FaInstagram /></a>
              <a href="#" className="text-gray-400 hover:text-white"><FaLinkedinIn /></a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Urban Pilgrim. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 