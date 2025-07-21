// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Banner from './components/layout/Banner';
import PilgrimExperiences from './features/pilgrim-experiences/components/PilgrimExperiences/PilgrimExperiences';
import PilgrimExperienceDetail from './features/pilgrim-experiences/components/PilgrimExperiences/PilgrimExperienceDetail';
import ExperienceDetail from './features/pilgrim-experiences/components/User/PilgrimExperienceBooking/ExperienceDetail';
import WellnessGuideClasses from './features/wellness-guides/components/WellnessGuideClasses/WellnessGuideClasses';
import WhoWeArePage from './features/static/pages/WhoWeArePage';
import WhyChooseUsPage from './features/static/pages/WhyChooseUsPage';
import ContactPage from './features/static/pages/ContactPage';
import PrivacyPolicyPage from './features/static/pages/PrivacyPolicyPage';
import JoinCuratorsPage from './features/static/pages/JoinCuratorsPage';
import JoinGuidesPage from './features/static/pages/JoinGuidesPage';
import WellnessGuideFormPage from './features/wellness-guides/pages/WellnessGuideFormPage';
import WellnessGuideDashboard from './features/wellness-guides/pages/WellnessGuideDashboard';
import CreateWellnessGuideClass from './features/wellness-guides/pages/CreateWellnessGuideClass';
import WellnessGuideClassPage from './features/wellness-guides/components/WellnessGuideClasses/WellnessGuideClassPage';
import WellnessGuideClassBooking from './features/wellness-guides/components/WellnessGuideClasses/WellnessGuideClassBooking';
import EmailVerificationPage from './features/auth/pages/EmailVerificationPage';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import ProtectedRoute from './components/ui/ProtectedRoute';
import HomePage from './features/home/pages/HomePage';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
       <Banner />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            
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