import React from 'react';
import { Link } from 'react-router-dom';

const WhoWeArePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Title */}
      <div className="px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 text-left max-w-7xl mx-auto">
          Who are we
        </h1>
      </div>

      {/* First Section - Image Left, Text Right */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image - First on mobile, Left on desktop */}
          <div className="order-1 lg:order-1">
            <img
              src="https://res.cloudinary.com/dynsmjvfb/image/upload/v1749973980/396dc08c-fe78-49be-8037-974e130cd03e.png"
              alt="Person meditating with temple view"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          
          {/* Text Content - Second on mobile, Right on desktop */}
          <div className="order-2 lg:order-2 space-y-6">
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <span className="font-semibold text-gray-900">Urban Pilgrim</span> is a modern-day sanctuary for those seeking balance, healing, and purpose in an increasingly fast-paced world.
              </p>
              
              <p>
                Rooted in the timeless wisdom of Indian traditions, we are a curated platform that brings together holistic wellness, spiritual practices, mindful travel, and cultural immersion—all under one roof.
              </p>
              
              <p>
                We believe that wellness is not a trend—it's a way of living. At Urban Pilgrim, our mission is to help individuals reconnect with themselves through authentic experiences that blend <span className="font-semibold">ancient Indian practices</span> with <span className="font-semibold">modern well-being needs</span>. Whether it's a guided yoga session, a spiritual ritual, a therapeutic retreat, or a curated cultural getaway—everything we offer is crafted to <span className="font-semibold">awaken the soul, restore balance, and inspire transformation</span>.
              </p>
            </div>
            
            <div className="pt-4">
              <Link
                to="/"
                className="inline-block bg-gray-900 text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Second Section - Text Left, Image Right on desktop, but Image First on mobile */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image - First on mobile, Right on desktop */}
          <div className="order-1 lg:order-2">
            <img
              src="https://res.cloudinary.com/dynsmjvfb/image/upload/v1749974138/Screenshot_2025-06-15_132449_r92zjx.png"
              alt="Manu Indrayan - Founder"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          
          {/* Text Content - Second on mobile, Left on desktop */}
          <div className="order-2 lg:order-1 space-y-6">
            <h2 className="text-2xl md:text-3xl font-light text-gray-900">
              Our Founder
            </h2>
            
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Urban Pilgrim is the vision of <span className="font-semibold text-gray-900">Manu Indrayan</span>, a seasoned entrepreneur and wellness advocate with over 25 years of experience in building purposeful consumer ventures. With a background in engineering (BITS Pilani) and business (IIM Bangalore), Manu's journey has evolved from leading successful fashion and retail brands to now nurturing soulful, impact-driven ventures.
              </p>
              
              <p>
                Through Urban Pilgrim, he seeks to bridge India's deep spiritual and wellness traditions with the aspirations of a global, modern audience—creating a platform that helps people live better, more connected lives.
              </p>
            </div>
            
            <div className="pt-4">
              <Link
                to="/"
                className="inline-block bg-gray-600 text-white px-8 py-3 text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Explore our programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Third Section - Promise Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-8">
            The Urban Pilgrim Promise
          </h2>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg md:text-xl">
              In a world overflowing with information and noise, we bring you <span className="font-semibold">authenticity, simplicity, and purpose</span>.
            </p>
            
            <p className="text-base md:text-lg">
              Because your journey to wellness deserves more than a quick fix—it deserves meaning.
            </p>
            
            <div className="pt-8">
              <p className="text-lg md:text-xl font-semibold text-gray-900">
                Urban Wellness. Rooted in Indian Wisdom.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhoWeArePage;