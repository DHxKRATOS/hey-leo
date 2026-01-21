import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Home } from "./Home";
import { AuthContainer } from "./AuthContainer";
import { DashboardContainer } from "./DashboardContainer";
import { ProtectedRoute } from "./ProtectedRoute";
import { OnboardingContainer } from "./OnboardingContainer";
import { LandingPage } from "./marketing/LandingPage";
import { PreLaunchPage } from "./marketing/PreLaunchPage";
import BlogPage from "./marketing/BlogPage copy";
import { PricingPage } from "./marketing/PricingPage";
import { AboutPage } from "./marketing/AboutPage";
import { AirtableContactsPage } from "./AirtableContactsPage";
import { AnalyticsPage } from "./AnalyticsPage";
import { SettingsPage } from "./SettingsPage";
import { Layout } from "./layout/Layout";
import AuthCallback from "./AuthCallback";
import { EndUserPage } from "./endUserView/EndUserPage";

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {/* <Route path="/" element={<PreLaunchPage />} /> */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthContainer />} />
        <Route path="/:username" element={<EndUserPage />} />
        <Route path="/prelaunach" element={<PreLaunchPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blogs" element={<BlogPage />} />
        {/* Protected Routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/onboarding" element={<OnboardingContainer />} />
          <Route path="/dashboard" element={<DashboardContainer />} />
          <Route path="/contacts" element={<AirtableContactsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route
            path="/settings"
            element={
              <SettingsPage
                user={undefined}
                userProfile={null}
                setUserProfile={() => {}}
              />
            }
          />
        </Route>

        {/* Placeholder routes for terms and privacy */}

        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/terms"
          element={<div className="p-8">Terms of Service</div>}
        />
        <Route
          path="/privacy"
          element={<div className="p-8">Privacy Policy</div>}
        />
        <Route
          path="/learn-more"
          element={<div className="p-8">Learn More</div>}
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};
