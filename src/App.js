import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n"; // i18n config

import LandingPage from "./components/LandingPage";
import JobListings from "./components/JobListings";
import JobDetailsPage from "./components/JobDetailsPage";
import LoginPage from "./components/LoginPage"; // <-- added
import RegisterPage from "./components/RegisterPage"; // <-- added
import ApplicationPage from "./components/ApplicationPage";
import AboutPage from "./components/AboutPage";

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/apply" element={<ApplicationPage />} />
          <Route path="/apply/:id" element={<ApplicationPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Admin routes removed for public-only build */}
        </Routes>
      </Router>
    </I18nextProvider>
  );
};

export default App;
