// src/components/Admin/DiscountManagement/ClassDiscountSettings.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CurrencyDollarIcon, 
  GlobeAltIcon, 
  BuildingOfficeIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { getClassDetails, updateDiscountSettings } from '../../../api/WellnessGuideClassApi';

const ClassDiscountSettings = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Discount settings state
  const [onlineDiscount, setOnlineDiscount] = useState({
    isEnabled: false,
    tiers: []
  });
  const [offlineDiscount, setOfflineDiscount] = useState({
    isEnabled: false,
    tiers: []
  });

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const data = await getClassDetails(classId);
      setClassDetails(data.classDetails);

      // Initialize discount settings from existing data
      const adminSettings = data.classDetails.adminSettings || {};
      
      setOnlineDiscount({
        isEnabled: adminSettings.onlineDiscount?.isEnabled || false,
        tiers: adminSettings.onlineDiscount?.tiers || []
      });
      
      setOfflineDiscount({
        isEnabled: adminSettings.offlineDiscount?.isEnabled || false,
        tiers: adminSettings.offlineDiscount?.tiers || []
      });
    } catch (err) {
      setError(err.message || 'Failed to load class details');
      console.error('Error fetching class details:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTier = (mode) => {
    const newTier = { minClasses: 1, discountPercentage: 0 };
    
    if (mode === 'online') {
      setOnlineDiscount(prev => ({
        ...prev,
        tiers: [...prev.tiers, newTier]
      }));
    } else {
      setOfflineDiscount(prev => ({
        ...prev,
        tiers: [...prev.tiers, newTier]
      }));
    }
  };

  const removeTier = (mode, index) => {
    if (mode === 'online') {
      setOnlineDiscount(prev => ({
        ...prev,
        tiers: prev.tiers.filter((_, i) => i !== index)
      }));
    } else {
      setOfflineDiscount(prev => ({
        ...prev,
        tiers: prev.tiers.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTier = (mode, index, field, value) => {
    const numValue = field === 'minClasses' ? parseInt(value) || 0 : parseFloat(value) || 0;
    
    if (mode === 'online') {
      setOnlineDiscount(prev => ({
        ...prev,
        tiers: prev.tiers.map((tier, i) => 
          i === index ? { ...tier, [field]: numValue } : tier
        )
      }));
    } else {
      setOfflineDiscount(prev => ({
        ...prev,
        tiers: prev.tiers.map((tier, i) => 
          i === index ? { ...tier, [field]: numValue } : tier
        )
      }));
    }
  };

  const toggleMode = (mode) => {
    if (mode === 'online') {
      setOnlineDiscount(prev => ({
        ...prev,
        isEnabled: !prev.isEnabled,
        tiers: !prev.isEnabled ? [] : prev.tiers // Clear tiers when disabling
      }));
    } else {
      setOfflineDiscount(prev => ({
        ...prev,
        isEnabled: !prev.isEnabled,
        tiers: !prev.isEnabled ? [] : prev.tiers // Clear tiers when disabling
      }));
    }
  };

  const validateSettings = () => {
    const errors = [];

    if (onlineDiscount.isEnabled) {
      if (onlineDiscount.tiers.length === 0) {
        errors.push('Online discount requires at least one tier');
      } else {
        onlineDiscount.tiers.forEach((tier, index) => {
          if (tier.minClasses < 1) {
            errors.push(`Online tier ${index + 1}: Minimum classes must be at least 1`);
          }
          if (tier.discountPercentage < 0 || tier.discountPercentage > 100) {
            errors.push(`Online tier ${index + 1}: Discount percentage must be between 0 and 100`);
          }
        });
      }
    }

    if (offlineDiscount.isEnabled) {
      if (offlineDiscount.tiers.length === 0) {
        errors.push('Offline discount requires at least one tier');
      } else {
        offlineDiscount.tiers.forEach((tier, index) => {
          if (tier.minClasses < 1) {
            errors.push(`Offline tier ${index + 1}: Minimum classes must be at least 1`);
          }
          if (tier.discountPercentage < 0 || tier.discountPercentage > 100) {
            errors.push(`Offline tier ${index + 1}: Discount percentage must be between 0 and 100`);
          }
        });
      }
    }

    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateSettings();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('; '));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await updateDiscountSettings(
        classId,
        onlineDiscount.isEnabled ? onlineDiscount : { isEnabled: false, tiers: [] },
        offlineDiscount.isEnabled ? offlineDiscount : { isEnabled: false, tiers: [] }
      );

      setSuccessMessage('Discount settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update discount settings');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price) => {
    return price ? `₹${price.toLocaleString()}` : 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (error && !classDetails) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Class</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => navigate('/admin/dashboard/discount-management')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Back to Discount Management
        </button>
      </div>
    );
  }

  const TierRow = ({ tier, index, mode, onUpdate, onRemove }) => (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Minimum Sessions
        </label>
        <input
          type="number"
          min="1"
          value={tier.minClasses}
          onChange={(e) => onUpdate(index, 'minClasses', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          placeholder="e.g., 5"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Discount Percentage
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={tier.discountPercentage}
            onChange={(e) => onUpdate(index, 'discountPercentage', e.target.value)}
            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            placeholder="e.g., 10"
          />
          <span className="absolute right-3 top-2 text-gray-500">%</span>
        </div>
      </div>
      <div className="flex items-end">
        <button
          onClick={() => onRemove(index)}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
          title="Remove tier"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard/discount-management')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Discount Settings</h1>
              <p className="text-gray-600">Configure discount tiers for this class</p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => navigate('/admin/dashboard/discount-management')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Class Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{classDetails?.title}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>
              Guide: {classDetails?.wellnessGuide?.user?.firstName} {classDetails?.wellnessGuide?.user?.lastName}
            </span>
            {classDetails?.specialty && (
              <span>Specialty: {classDetails.specialty.name}</span>
            )}
            {classDetails?.modes?.online?.enabled && (
              <span>Online: {formatPrice(classDetails.modes.online.price)}</span>
            )}
            {classDetails?.modes?.offline?.enabled && (
              <span>Offline: {formatPrice(classDetails.modes.offline.price)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
            <div className="text-red-700">{error}</div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
            <div className="text-green-700">{successMessage}</div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          <div className="text-blue-700 text-sm">
            <p className="font-medium mb-1">How Discount Tiers Work:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Set minimum number of sessions required to unlock a discount</li>
              <li>Users who book the minimum sessions or more will automatically receive the highest applicable discount</li>
              <li>Discounts are calculated on the total booking amount before taxes</li>
              <li>You can create multiple tiers with different requirements and percentages</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Online Discount Settings */}
      {classDetails?.modes?.online?.enabled && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Online Mode Discounts</h3>
                  <p className="text-sm text-gray-600">
                    Current Price: {formatPrice(classDetails.modes.online.price)}
                  </p>
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={onlineDiscount.isEnabled}
                  onChange={() => toggleMode('online')}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Enable Discounts</span>
              </label>
            </div>
          </div>

          {onlineDiscount.isEnabled && (
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {onlineDiscount.tiers.map((tier, index) => (
                  <TierRow
                    key={index}
                    tier={tier}
                    index={index}
                    mode="online"
                    onUpdate={(idx, field, value) => updateTier('online', idx, field, value)}
                    onRemove={(idx) => removeTier('online', idx)}
                  />
                ))}
                
                <button
                  onClick={() => addTier('online')}
                  className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors duration-200"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Discount Tier</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Offline Discount Settings */}
      {classDetails?.modes?.offline?.enabled && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Offline Mode Discounts</h3>
                  <p className="text-sm text-gray-600">
                    Current Price: {formatPrice(classDetails.modes.offline.price)} • 
                    Location: {classDetails.modes.offline.location}
                  </p>
                </div>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={offlineDiscount.isEnabled}
                  onChange={() => toggleMode('offline')}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Enable Discounts</span>
              </label>
            </div>
          </div>

          {offlineDiscount.isEnabled && (
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {offlineDiscount.tiers.map((tier, index) => (
                  <TierRow
                    key={index}
                    tier={tier}
                    index={index}
                    mode="offline"
                    onUpdate={(idx, field, value) => updateTier('offline', idx, field, value)}
                    onRemove={(idx) => removeTier('offline', idx)}
                  />
                ))}
                
                <button
                  onClick={() => addTier('offline')}
                  className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors duration-200"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Discount Tier</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Section */}
      {(onlineDiscount.isEnabled || offlineDiscount.isEnabled) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount Preview</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {onlineDiscount.isEnabled && onlineDiscount.tiers.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Online Discounts</h4>
                <div className="space-y-2 text-sm">
                  {onlineDiscount.tiers
                    .sort((a, b) => a.minClasses - b.minClasses)
                    .map((tier, index) => (
                      <div key={index} className="flex justify-between bg-blue-50 p-2 rounded">
                        <span>Book {tier.minClasses}+ sessions</span>
                        <span className="font-medium">{tier.discountPercentage}% off</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {offlineDiscount.isEnabled && offlineDiscount.tiers.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-700 mb-2">Offline Discounts</h4>
                <div className="space-y-2 text-sm">
                  {offlineDiscount.tiers
                    .sort((a, b) => a.minClasses - b.minClasses)
                    .map((tier, index) => (
                      <div key={index} className="flex justify-between bg-orange-50 p-2 rounded">
                        <span>Book {tier.minClasses}+ sessions</span>
                        <span className="font-medium">{tier.discountPercentage}% off</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDiscountSettings; 