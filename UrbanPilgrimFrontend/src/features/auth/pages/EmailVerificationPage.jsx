import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendVerificationOTP, verifyEmail } from '../../../api/emailVerificationApi';

const EmailVerificationPage = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent

  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector((state) => state.auth);
  
  // Refs for OTP inputs
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // Get redirect destination from location state, default to profile
  const redirectTo = location.state?.redirectTo || '/profile';

  // Use useCallback to prevent function recreation on every render
  const handleSendOTP = useCallback(async () => {
    if (isSendingOTP) return; // Prevent double submission
    
    setIsSendingOTP(true);
    setError(null);
    
    try {
      const result = await sendVerificationOTP(token);
      setUserEmail(result.email);
      setCanResend(false);
      setResendTimer(60);
      setOtpSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsSendingOTP(false);
    }
  }, [token, isSendingOTP]);

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    // Auto-send OTP when page loads, but only once
    if (!otpSent && !isSendingOTP) {
      handleSendOTP();
    }
  }, [user, token, otpSent, isSendingOTP, handleSendOTP, navigate]);

  useEffect(() => {
    // Timer for resend functionality
    if (!canResend && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent double submission
    
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      setError('Please enter a complete 4-digit OTP');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await verifyEmail(token, otpString);
      setSuccess(true);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate(redirectTo);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to verify email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (isSendingOTP) return; // Prevent double submission
    
    setOtp(['', '', '', '']);
    setError(null);
    setSuccess(false);
    setOtpSent(false); // Reset the sent flag
    otpRefs[0].current?.focus();
    handleSendOTP();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="mt-2 text-sm text-gray-600">
                Your email has been successfully verified. Redirecting you now...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 4-digit verification code to
          </p>
          <p className="text-sm font-medium text-gray-900">{userEmail}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isSendingOTP ? (
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending verification code...
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 text-center mb-4">
                  Enter verification code
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-center">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Verify Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 4}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend || isSendingOTP}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isSendingOTP ? (
                    'Sending...'
                  ) : canResend ? (
                    'Resend verification code'
                  ) : (
                    `Resend in ${resendTimer}s`
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;