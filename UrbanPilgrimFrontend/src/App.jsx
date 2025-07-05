// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Header from './components/Header';
import Footer from './components/Footer';
import Banner from './components/Banner';
import PilgrimExperiences from './components/PilgrimExperiences/PilgrimExperiences';
import PilgrimExperienceDetail from './components/PilgrimExperiences/PilgrimExperienceDetail';
import ExperienceDetail from './components/User/PilgrimExperienceBooking/ExperienceDetail';
import BookingReview from './components/User/PilgrimExperienceBooking/BookingReview';
import PaymentStatus from './components/User/PilgrimExperienceBooking/PaymentStatus';
import WellnessGuideClasses from './components/WellnessGuideClasses/WellnessGuideClasses';
import WhoWeArePage from './pages/WhoWeArePage';
import WhyChooseUsPage from './pages/WhyChooseUsPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import JoinCuratorsPage from './pages/JoinCuratorsPage';
import JoinGuidesPage from './pages/JoinGuidesPage';
import WellnessGuideFormPage from './pages/WellnessGuideFormPage';
import WellnessGuideDashboard from './pages/WellnessGuideDashboard';
import CreateWellnessGuideClass from './pages/CreateWellnessGuideClass';
import WellnessGuideClassPage from './components/WellnessGuideClasses/WellnessGuideClassPage';
import WellnessGuideClassBooking from './components/WellnessGuideClasses/WellnessGuideClassBooking';
import EmailVerificationPage from './pages/EmailVerificationPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <Banner />
                <PilgrimExperiences />
              </>
            } />
            
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/pilgrim-experiences" element={<PilgrimExperiences />} />
            <Route path="/pilgrim-experiences/:id" element={<PilgrimExperienceDetail />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/wellness-guides" element={<WellnessGuideClasses />} />
            <Route path="/wellness-guide-classes/:id" element={<WellnessGuideClassPage />} />
            <Route path="/wellness-guide-classes/:id/book" element={<WellnessGuideClassBooking />} />
            <Route path="/who-we-are" element={<WhoWeArePage />} />
            <Route path="/why-choose-us" element={<WhyChooseUsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/join-curators" element={<JoinCuratorsPage />} />
            <Route path="/join-guides" element={<JoinGuidesPage />} />
            <Route path="/wellness-guide-form" element={<WellnessGuideFormPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/booking/review" 
              element={
                <ProtectedRoute>
                  <BookingReview />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/payment/status" 
              element={
                <ProtectedRoute>
                  <PaymentStatus />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Add profile settings route */}
            <Route 
              path="/profile/settings" 
              element={
                <ProtectedRoute>
                  <div>Profile Settings - Coming Soon</div>
                </ProtectedRoute>
              } 
            />
            
            {/* Wellness Guide Dashboard */}
            <Route 
              path="/wellness-guide-dashboard" 
              element={
                <ProtectedRoute>
                  <WellnessGuideDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Wellness Guide Create Class */}
            <Route 
              path="/wellness-guide/create-class" 
              element={
                <ProtectedRoute requiredRole="WELLNESS_GUIDE">
                  <CreateWellnessGuideClass />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Dashboard Routes - Fixed role check */}
            <Route 
              path="/admin/dashboard/*" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Add a redirect for just /admin */}
            <Route 
              path="/admin" 
              element={<Navigate to="/admin/dashboard" replace />}
            />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Provider>
  );
}

export default App;