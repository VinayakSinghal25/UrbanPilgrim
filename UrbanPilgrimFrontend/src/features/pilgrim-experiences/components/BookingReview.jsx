import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const experienceId = params.get('experienceId');
  const occupancy = params.get('occupancy');
  const sessionCount = params.get('sessionCount');
  const selectedDates = params.get('selectedDates');

  let selectedDatesDisplay = '';
  try {
    if (selectedDates) {
      const parsed = JSON.parse(selectedDates);
      if (parsed.from && parsed.to) {
        const fromDate = new Date(parsed.from);
        const toDate = new Date(parsed.to);
        selectedDatesDisplay = `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`;
      }
    }
  } catch (error) {
    console.error('Error parsing selected dates:', error);
  }

  const handleBackToExperiences = () => {
    navigate('/pilgrim-experiences');
  };

  if (!experienceId || !occupancy || !sessionCount || !selectedDates) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Error</h2>
          <p className="text-gray-600 mb-6">
            Some booking information is missing. Please try booking again.
          </p>
          <button
            onClick={handleBackToExperiences}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Experiences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Booking Review</h1>
          
          <div className="space-y-4 mb-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Booking Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Experience ID</p>
                  <p className="font-medium">{experienceId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Occupancy</p>
                  <p className="font-medium">{occupancy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Number of Sessions</p>
                  <p className="font-medium">{sessionCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Selected Dates</p>
                  <p className="font-medium">{selectedDatesDisplay}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleBackToExperiences}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Experiences
            </button>
            <button
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
              disabled
            >
              Confirm Booking (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReview; 