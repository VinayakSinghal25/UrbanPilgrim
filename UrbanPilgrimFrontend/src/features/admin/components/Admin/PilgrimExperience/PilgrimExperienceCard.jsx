// src/components/Admin/PilgrimExperience/PilgrimExperienceCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const PilgrimExperienceCard = ({ experience, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/admin/dashboard/pilgrim-experiences/edit/${experience._id}`);
  };

  const handleView = () => {
    // Navigate to public view or detailed admin view
    window.open(`/experiences/${experience._id}`, '_blank');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      onDelete(experience._id);
    }
  };

  const getActiveTimeSlots = () => {
    if (!experience.availableDates) return 0;
    return experience.availableDates.reduce((total, date) => {
      if (date.isActive) {
        return total + (date.timeSlots?.length || 0);
      }
      return total;
    }, 0);
  };

  const getActiveDatesCount = () => {
    if (!experience.availableDates) return 0;
    return experience.availableDates.filter(date => date.isActive).length;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {experience.images && experience.images.length > 0 ? (
          <img
            src={experience.images[0].url}
            alt={experience.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <MapPinIcon className="h-12 w-12" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            Active
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{experience.name}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2" />
            {experience.location}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {getActiveDatesCount()} active dates
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-2" />
            {getActiveTimeSlots()} time slots available
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyRupeeIcon className="h-4 w-4 mr-2" />
            ₹{experience.price?.toLocaleString()}
          </div>
        </div>

        {/* Recurring Days */}
        {experience.recurringDays && experience.recurringDays.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Recurring on:</p>
            <div className="flex flex-wrap gap-1">
              {experience.recurringDays.map((day) => (
                <span 
                  key={day} 
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {day.substring(0, 3)}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {experience.whatToExpected}
        </p>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={handleView}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="View"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleEdit}
              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
              title="Edit"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
          
          <span className="text-xs text-gray-500">
            Created {new Date(experience.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PilgrimExperienceCard;