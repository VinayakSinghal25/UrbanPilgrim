import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassDetails } from '../../api/WellnessGuideClassApi';

const WellnessGuideClassPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching wellness guide class details for ID:', id);
      const response = await getClassDetails(id);
      console.log('Class details response:', response);
      setClassDetails(response.classDetails);
    } catch (error) {
      console.error('Error fetching class details:', error);
      setError(error.message || 'Failed to fetch class details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wellness guide class...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Class</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500 mb-4">Class ID: {id}</p>
          <button
            onClick={() => navigate('/wellness-guides')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 mr-4"
          >
            Back to Classes
          </button>
          <button
            onClick={fetchClassDetails}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Class Not Found</h2>
          <p className="text-gray-600 mb-6">The requested wellness guide class could not be found.</p>
          <p className="text-sm text-gray-500 mb-4">Class ID: {id}</p>
          <button
            onClick={() => navigate('/wellness-guides')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
          >
            Browse All Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <button
              onClick={() => navigate('/wellness-guides')}
              className="flex items-center text-emerald-600 hover:text-emerald-800 mb-4"
            >
              ← Back to Classes
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {classDetails.title}
          </h1>
          
          <div className="space-y-4">
            <p><strong>Class ID:</strong> {id}</p>
            
            {classDetails.description && (
              <p><strong>Description:</strong> {classDetails.description}</p>
            )}
            
            {classDetails.wellnessGuide && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Guide Information:</h3>
                <p><strong>Guide ID:</strong> {classDetails.wellnessGuide._id}</p>
                {classDetails.wellnessGuide.user && (
                  <p><strong>Guide Name:</strong> {classDetails.wellnessGuide.user.firstName} {classDetails.wellnessGuide.user.lastName}</p>
                )}
                {classDetails.wellnessGuide.email && (
                  <p><strong>Guide Email:</strong> {classDetails.wellnessGuide.email}</p>
                )}
              </div>
            )}
            
            {classDetails.modes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Available Modes:</h3>
                {classDetails.modes.online?.enabled && (
                  <div className="mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">Online</span>
                    <span>Price: ₹{classDetails.modes.online.price}</span>
                  </div>
                )}
                {classDetails.modes.offline?.enabled && (
                  <div className="mb-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">Offline</span>
                    <span>Price: ₹{classDetails.modes.offline.price}</span>
                    {classDetails.modes.offline.location && (
                      <span className="ml-2">Location: {classDetails.modes.offline.location}</span>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {classDetails.specialty && (
              <p><strong>Specialty:</strong> {classDetails.specialty.name}</p>
            )}
            
            {classDetails.difficulty && (
              <p><strong>Difficulty:</strong> {classDetails.difficulty}</p>
            )}
            
            {classDetails.timezone && (
              <p><strong>Timezone:</strong> {classDetails.timezone}</p>
            )}
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Debug Information:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(classDetails, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessGuideClassPage; 