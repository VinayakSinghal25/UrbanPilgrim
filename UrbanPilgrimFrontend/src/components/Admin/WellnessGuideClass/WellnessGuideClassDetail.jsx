import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  getClassDetails,
  updateWellnessGuideClassApproval 
} from '../../../api/WellnessGuideClassApi';
import { getWellnessGuideByIdAdmin } from '../../../api/wellnessGuideApi';
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  PhotoIcon,
  TagIcon,
  ChatBubbleLeftEllipsisIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  LanguageIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const WellnessGuideClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [classDetails, setClassDetails] = useState(null);
  const [guideDetails, setGuideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchClassAndGuideDetails();
  }, [id]);

  const fetchClassAndGuideDetails = async () => {
    try {
      setLoading(true);
      
      // First, get the class details
      console.log('🔍 Fetching class details for ID:', id);
      const classResponse = await getClassDetails(id);
      console.log('📋 Class response:', classResponse);
      
      setClassDetails(classResponse.classDetails);
      
      // Then, get the full guide details using the guide ID
      if (classResponse.classDetails?.wellnessGuide?._id) {
        console.log('👤 Fetching guide details for ID:', classResponse.classDetails.wellnessGuide._id);
        const guideResponse = await getWellnessGuideByIdAdmin(token, classResponse.classDetails.wellnessGuide._id);
        console.log('🧘 Guide response:', guideResponse);
        setGuideDetails(guideResponse.wellnessGuide);
      } else {
        console.log('⚠️ No guide ID found in class details');
      }
    } catch (error) {
      console.error('❌ Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setUpdating(true);
      await updateWellnessGuideClassApproval(id, true);
      
      // Refresh the data
      await fetchClassAndGuideDetails();
      
      // Show success message or redirect
      alert('Class approved successfully!');
    } catch (error) {
      console.error('Error approving class:', error);
      alert('Error approving class: ' + (error.message || 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setUpdating(true);
      await updateWellnessGuideClassApproval(id, false, rejectionReason.trim());
      
      // Refresh the data
      await fetchClassAndGuideDetails();
      
      // Close modal and show success
      setShowRejectModal(false);
      setRejectionReason('');
      alert('Class rejected successfully!');
    } catch (error) {
      console.error('Error rejecting class:', error);
      alert('Error rejecting class: ' + (error.message || 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Class Not Found</h2>
          <p className="text-gray-600 mb-4">The requested wellness guide class could not be found.</p>
          <button
            onClick={() => navigate('/admin/dashboard/pending-wellness-guide-classes')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Pending Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/dashboard/pending-wellness-guide-classes')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Pending Classes
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{classDetails.title}</h1>
            <p className="text-gray-600 mt-1">Detailed Review for Admin Approval</p>
          </div>
          
          {/* Admin Action Buttons */}
          {classDetails.status !== 'active' && classDetails.status !== 'rejected' && (
            <div className="flex space-x-3">
              <button
                onClick={handleApprove}
                disabled={updating}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {updating ? 'Approving...' : 'Approve Class'}
              </button>
              
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={updating}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Reject Class
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Class Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Class Photos */}
          {classDetails.photos && classDetails.photos.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="h-5 w-5 text-amber-600 mr-2" />
                Class Photos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classDetails.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Class photo ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed">{classDetails.description}</p>
          </div>

          {/* About Sections */}
          {classDetails.aboutSections && classDetails.aboutSections.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-amber-600 mr-2" />
                About This Class
              </h3>
              <div className="space-y-4">
                {classDetails.aboutSections.map((section, index) => (
                  <div key={index} className="border-l-4 border-amber-200 pl-4">
                    {section.header && (
                      <h4 className="font-medium text-gray-900 mb-2">
                        {section.header}
                      </h4>
                    )}
                    {section.paragraph && (
                      <p className="text-gray-700 leading-relaxed">
                        {section.paragraph}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Modes */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Modes</h3>
            
            {/* Online Mode */}
            {classDetails.modes.online.enabled && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <GlobeAltIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-900">Online Mode</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Max Capacity:</span>
                    <span className="ml-2 font-medium">{classDetails.modes.online.maxCapacity} students</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-2 font-medium text-blue-600">₹{classDetails.modes.online.price}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Offline Mode */}
            {classDetails.modes.offline.enabled && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-green-900">Offline Mode</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Max Capacity:</span>
                    <span className="ml-2 font-medium">{classDetails.modes.offline.maxCapacity} students</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-2 font-medium text-green-600">₹{classDetails.modes.offline.price}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="mb-1">
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-medium">{classDetails.modes.offline.location}</span>
                  </div>
                  {classDetails.modes.offline.address && (
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <span className="ml-2">
                        {classDetails.modes.offline.address.street}, {classDetails.modes.offline.address.city}, {classDetails.modes.offline.address.state} - {classDetails.modes.offline.address.zipCode || classDetails.modes.offline.address.pincode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Guide Certifications */}
          {classDetails.guideCertifications && classDetails.guideCertifications.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <StarIcon className="h-5 w-5 text-amber-600 mr-2" />
                Guide Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {classDetails.guideCertifications.map((cert, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills to Learn */}
          {classDetails.skillsToLearn && classDetails.skillsToLearn.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AcademicCapIcon className="h-5 w-5 text-amber-600 mr-2" />
                Skills You'll Learn
              </h3>
              <div className="flex flex-wrap gap-2">
                {classDetails.skillsToLearn.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {classDetails.tags && classDetails.tags.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TagIcon className="h-5 w-5 text-amber-600 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {classDetails.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Guide Info & Quick Stats */}
        <div className="space-y-6">
          
          {/* Guide Information */}
          {guideDetails && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 text-amber-600 mr-2" />
                Guide Information
              </h3>
              
              <div className="space-y-4">
                {/* Profile Picture */}
                {guideDetails.profilePictures && guideDetails.profilePictures.length > 0 && (
                  <div className="flex justify-center">
                    <img
                      src={guideDetails.profilePictures[0]}
                      alt="Guide profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                )}
                
                {/* Name */}
                <div className="text-center">
                  <h4 className="font-medium text-gray-900">
                    {guideDetails.user?.firstName} {guideDetails.user?.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">{guideDetails.user?.email}</p>
                </div>

                {/* Contact */}
                {guideDetails.contactNumber && (
                  <div className="flex items-center text-sm">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{guideDetails.contactNumber}</span>
                  </div>
                )}

                {/* Email */}
                <div className="flex items-center text-sm">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{guideDetails.email}</span>
                </div>

                {/* Gender */}
                {guideDetails.gender && (
                  <div className="text-sm">
                    <span className="text-gray-600">Gender:</span>
                    <span className="ml-2 font-medium">
                      {guideDetails.gender === 'other' ? guideDetails.customGender : guideDetails.gender}
                    </span>
                  </div>
                )}

                {/* Languages */}
                {guideDetails.languages && guideDetails.languages.length > 0 && (
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <LanguageIcon className="h-4 w-4 mr-2" />
                      Languages:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {guideDetails.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expertise */}
                {guideDetails.areaOfExpertise && guideDetails.areaOfExpertise.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Expertise:</div>
                    <div className="flex flex-wrap gap-1">
                      {guideDetails.areaOfExpertise.map((expertise, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                        >
                          {expertise.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  classDetails.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                  classDetails.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {classDetails.difficulty}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Specialty:</span>
                <span className="font-medium">{classDetails.specialty?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(classDetails.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Timezone:</span>
                <span className="font-medium">{classDetails.timezone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reject Class</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (Required)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Please explain why this class is being rejected..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || updating}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {updating ? 'Rejecting...' : 'Reject Class'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessGuideClassDetail;