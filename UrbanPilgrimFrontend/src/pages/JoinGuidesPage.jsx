import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkWellnessGuideEligibility } from '../api/wellnessGuideApi';

const JoinGuidesPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [eligibilityStatus, setEligibilityStatus] = useState(null);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const handleJoinClick = async () => {
    // Check if user is logged in
    if (!user || !token) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const eligibilityResult = await checkWellnessGuideEligibility(token);
      setEligibilityStatus(eligibilityResult);
      
      // If eligible, navigate to the form
      if (eligibilityResult.isEligible) {
        navigate('/wellness-guide-form');
      }
    } catch (err) {
      setError(err.message || 'Failed to check eligibility');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = () => {
    // Navigate to email verification page with redirect info
    navigate('/verify-email', { 
      state: { redirectTo: '/wellness-guide-form' } 
    });
  };

  const renderEligibilityMessage = () => {
    if (!eligibilityStatus) return null;

    if (!eligibilityStatus.isEligible) {
      const hasEmailIssue = eligibilityStatus.reasons.some(reason => 
        reason.includes('Email must be verified')
      );
      const isAlreadyGuide = eligibilityStatus.reasons.some(reason => 
        reason.includes('already has a wellness guide profile')
      );

      if (isAlreadyGuide) {
        return (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  You're already a wellness guide!
                </h3>
                <p className="mt-2 text-sm text-blue-700">
                  You already have a wellness guide profile. You can manage your profile from your dashboard.
                </p>
              </div>
            </div>
          </div>
        );
      }

      if (hasEmailIssue) {
        return (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Email Verification Required
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  You need to verify your email address before becoming a wellness guide.
                </p>
                <div className="mt-4">
                  <button
                    onClick={handleVerifyEmail}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors duration-200"
                  >
                    Verify Email Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Other reasons
      return (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Unable to proceed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {eligibilityStatus.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1">
            <div className="max-w-2xl">
              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="text-gray-900">Urban Pilgrim Guide</span>
                <span className="text-gray-700"> – Share Your Expertise with a Global Audience</span>
              </h1>

              {/* Why Join Section */}
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
                  Why Join Urban Pilgrim?
                </h2>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  At <span className="font-semibold text-gray-900">Urban Pilgrim</span>, we are building a curated ecosystem of wellness professionals rooted in Indian traditions.
                </p>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  We invite yoga instructors, meditation guides, mental wellness coaches, nutritionists, ritual practitioners, and holistic healers to join our platform as <span className="font-semibold text-gray-900">Pilgrim Guides</span>.
                </p>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  As a guide, you can focus on what you do best—<span className="font-semibold text-gray-900">helping others live healthier, more balanced lives</span>—while we handle the rest.
                </p>
                
                <p className="text-gray-700 mb-8 leading-relaxed">
                  From marketing to client acquisition and bookings, our platform enables you to reach a <span className="font-semibold text-gray-900">global audience</span> without the stress of managing the business side of things.
                </p>
              </div>

              {/* Onboarding Process */}
              <div className="mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  Onboarding Process
                </h2>
                
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold text-sm mr-4">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Submit Your Application</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Use the link at the bottom of this page to complete your application.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold text-sm mr-4">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Profile Review (5-7 Days)</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Our team will carefully assess your experience and expertise.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold text-sm mr-4">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Introductory Interaction</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        If shortlisted, you'll be invited for a brief interview to align on values and offerings.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold text-sm mr-4">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Onboarding & Launch (Within 5-7 Days)</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Once selected, we'll guide you through a smooth onboarding process and get your profile ready for bookings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* CTA Button */}
              <div className="mb-8">
                <button
                  onClick={handleJoinClick}
                  disabled={isLoading}
                  className="bg-gray-900 text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Checking Eligibility...' : 'Join us as Urban Pilgrim Guide'}
                </button>
              </div>

              {/* Eligibility Message */}
              {renderEligibilityMessage()}
            </div>
          </div>

          {/* Right Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <img
                src="https://res.cloudinary.com/dynsmjvfb/image/upload/v1750577176/Join_as_pilgrim_guide_image_ii8z7c.png"
                alt="Urban Pilgrim Guide - Wellness professionals in meditation"
                className="w-full h-auto rounded-lg shadow-2xl"
                style={{ maxHeight: '600px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinGuidesPage;