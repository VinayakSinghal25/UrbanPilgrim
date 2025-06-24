import { Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import './index.css';

import SignupPage from './pages/SignupPage';
import Header from './components/Header';
import Banner from './components/Banner';
import Footer from './components/Footer';
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PilgrimExperiences from './components/PilgrimExperiences/PilgrimExperiences';
import PilgrimExperienceDetail from './components/PilgrimExperiences/PilgrimExperienceDetail';

// Footer link pages
import JoinGuidesPage from './pages/JoinGuidesPage';
import JoinCuratorsPage from './pages/JoinCuratorsPage';
import WhoWeArePage from './pages/WhoWeArePage';
import WhyChooseUsPage from './pages/WhyChooseUsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ContactPage from './pages/ContactPage';

// Wellness Guide Form, Dashboard and Email Verification
import WellnessGuideFormPage from './pages/WellnessGuideFormPage';
import WellnessGuideDashboard from './pages/WellnessGuideDashboard';
import EmailVerificationPage from './pages/EmailVerificationPage';

import { Provider } from 'react-redux';
import { store } from './store/store';

function App() {
  return (
    <Provider store={store}>
      <div className="app-container">
        <Banner />
        <Header />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/pilgrim-experiences" element={<PilgrimExperiences />} />
            <Route path="/pilgrim-experiences/:id" element={<PilgrimExperienceDetail />} />
            
            {/* Footer link pages */}
            <Route path="/join-guides" element={<JoinGuidesPage />} />
            <Route path="/join-curators" element={<JoinCuratorsPage />} />
            <Route path="/who-we-are" element={<WhoWeArePage />} />
            <Route path="/why-choose-us" element={<WhyChooseUsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Email Verification - Protected Route */}
            <Route 
              path="/verify-email" 
              element={
                <ProtectedRoute>
                  <EmailVerificationPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Wellness Guide Form - Protected Route */}
            <Route 
              path="/wellness-guide-form" 
              element={
                <ProtectedRoute>
                  <WellnessGuideFormPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Wellness Guide Dashboard - Protected Route */}
            <Route 
              path="/wellness-guide-dashboard" 
              element={
                <ProtectedRoute>
                  <WellnessGuideDashboard />
                </ProtectedRoute>
              } 
            />
            
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
            
            {/* Admin Dashboard Routes */}
            <Route 
              path="/admin/dashboard/*" 
              element={
                <ProtectedRoute requiredRole="admin">
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