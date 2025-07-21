import React from 'react';

const WhyChooseUsPage = () => {
  const features = [
    {
      id: 1,
      image: "https://res.cloudinary.com/dynsmjvfb/image/upload/v1749975215/Screenshot_2025-06-15_134323_ozwsfb.png",
      title: "Authentic, Indian-Rooted Wellness",
      description: "We bring you practices and experiences deeply grounded in India's timeless wisdom—from yoga and Ayurveda to spiritual rituals and mindful travel."
    },
    {
      id: 2,
      image: "https://res.cloudinary.com/dynsmjvfb/image/upload/v1749976821/Screenshot_2025-06-15_141004_qkiu7d.png",
      title: "Expert-Led& Curated with Care",
      description: "All our guides, retreats, and products are handpicked by our team of wellness and heritage experts.",
      subtitle: "No noise, no fluff—just substance and sincerity."
    },
    {
      id: 3,
      image: "https://res.cloudinary.com/dynsmjvfb/image/upload/v1749976870/Screenshot_2025-06-15_141049_izzkww.png",
      title: "Accessible from Anywhere",
      description: "Join a virtual session, book a retreat, or browse spiritual offerings—",
      highlight: "wherever you are in the world",
      continuation: ", at your pace."
    },
    {
      id: 4,
      image: "https://res.cloudinary.com/dynsmjvfb/image/upload/v1749976916/Screenshot_2025-06-15_141140_sxqkgx.png",
      title: "Experiences that Transform",
      description: "Our programs are not just about health—they're about",
      highlight: "meaningful inner change",
      continuation: ". Short or long, every journey on Urban Pilgrim is designed to",
      finalHighlight: "awaken, explore, and transform",
      ending: "."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Page Title */}
      <div className="px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 text-left max-w-7xl mx-auto">
          Why choose us
        </h1>
      </div>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {features.map((feature) => (
            <div key={feature.id} className="bg-gray-50 rounded-lg overflow-hidden">
              {/* Image */}
              <div className="aspect-[4/3] w-full">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight">
                  {feature.title}
                </h2>
                
                <div className="text-sm md:text-base text-gray-700 leading-relaxed space-y-2">
                  {/* Regular description */}
                  <p>
                    {feature.description}
                    {feature.highlight && (
                      <>
                        <span className="font-semibold text-gray-900">{feature.highlight}</span>
                        {feature.continuation}
                      </>
                    )}
                    {feature.finalHighlight && (
                      <>
                        <span className="font-semibold text-gray-900">{feature.finalHighlight}</span>
                        {feature.ending}
                      </>
                    )}
                  </p>
                  
                  {/* Subtitle for Expert-Led section */}
                  {feature.subtitle && (
                    <p className="italic text-gray-600">
                      {feature.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WhyChooseUsPage;