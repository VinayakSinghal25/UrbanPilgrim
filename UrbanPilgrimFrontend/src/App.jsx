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
import ClassBookingReview from './features/wellness-guides/components/WellnessGuideClasses/ClassBookingReview';
import ClassPaymentStatus from './features/wellness-guides/components/WellnessGuideClasses/ClassPaymentStatus';
import EmailVerificationPage from './features/auth/pages/EmailVerificationPage';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import ProtectedRoute from './components/ui/ProtectedRoute';
import HomePage from './features/home/pages/HomePage';
import PilgrimRetreatsPage from './features/pilgrim-retreats/pages/PilgrimRetreatsPage';
import PilgrimBazaarPage from './features/pilgrim-bazaar/pages/PilgrimBazaarPage';
import AboutPage from './features/static/pages/AboutPage';
import PilgrimGuidesCategoryPage from './features/pilgrim-guides/pages/PilgrimGuidesCategoryPage';
import PilgrimSessionsPage from './features/pilgrim-sessions/pages/PilgrimSessionsPage';
import BookingReview from './features/pilgrim-experiences/components/BookingReview';
import PaymentStatus from './features/pilgrim-experiences/components/PaymentStatus';
import './App.css';

const App = () => {
  return (
    <Provider store={store}>
      <Banner />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pilgrim-experiences" element={<PilgrimExperiences />} />
          <Route path="/pilgrim-experiences/:id" element={<PilgrimExperienceDetail />} />
          <Route path="/experience-booking/:id" element={<ExperienceDetail />} />
          <Route path="/wellness-guide-classes" element={<WellnessGuideClasses />} />
          <Route path="/class/:id" element={<WellnessGuideClassPage />} />
          <Route path="/class-booking/:id" element={<WellnessGuideClassBooking />} />
          <Route path="/wellness-class-booking/review" element={<ClassBookingReview />} />
          <Route path="/class-payment/status" element={<ClassPaymentStatus />} />
          <Route path="/who-we-are" element={<WhoWeArePage />} />
          <Route path="/why-choose-us" element={<WhyChooseUsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/join-curators" element={<JoinCuratorsPage />} />
          <Route path="/join-guides" element={<JoinGuidesPage />} />
          <Route path="/become-a-wellness-guide" element={<WellnessGuideFormPage />} />
          <Route path="/email-verification" element={<EmailVerificationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/booking/review" element={<BookingReview />} />
          <Route path="/payment/status" element={<PaymentStatus />} />

          {/* New Routes */}
          <Route path="/pilgrim-retreats" element={<PilgrimRetreatsPage />} />
          <Route path="/pilgrim-sessions" element={<PilgrimSessionsPage />} />
          <Route path="/pilgrim-bazaar" element={<PilgrimBazaarPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pilgrim-guides/:category" element={<PilgrimGuidesCategoryPage />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wellness-guide-dashboard"
            element={
              <ProtectedRoute requiredRole="wellness_guide">
                <WellnessGuideDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-class"
            element={
              <ProtectedRoute requiredRole="wellness_guide">
                <CreateWellnessGuideClass />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </Provider>
  );
};

export default App;