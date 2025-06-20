import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // TODO: Add email subscription logic later
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <footer className="bg-gray-200 py-12 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Quick Links Section */}
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-gray-700 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/join-guides" 
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                >
                  Join us as guides
                </Link>
              </li>
              <li>
                <Link 
                  to="/join-curators" 
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                >
                  Join us as Trip Curators
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links Section */}
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-gray-700 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/who-we-are" 
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                >
                  Who we are
                </Link>
              </li>
              <li>
                <Link 
                  to="/why-choose-us" 
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                >
                  Why choose us
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-gray-700 mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                >
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-gray-700 mb-4">Subscribe to our emails</h3>
            <form onSubmit={handleEmailSubmit} className="mt-2">
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <button 
                  type="submit" 
                  className="absolute right-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-all"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="border-t border-gray-300 pt-6 flex justify-center">
          <div className="flex gap-4">
            <a 
              href="#" 
              className="text-gray-500 hover:text-gray-700 transition-colors" 
              aria-label="Instagram"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;