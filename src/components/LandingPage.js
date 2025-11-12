import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FaUserTie, FaClipboardCheck, FaRobot, FaChartLine, FaUpload, FaCheckCircle } from "react-icons/fa";
import personImg from "../assets/person.png";
import Navbar from "./Navbar";

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const onStorage = () => setIsAuth(localStorage.getItem('isAuthenticated') === 'true');
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleUploadClick = () => {
    if (isAuth) {
      navigate('/apply');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 via-white to-indigo-100 text-gray-800 overflow-hidden">
      <Navbar />
      <div style={{ height: 70 }} />

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row justify-between items-center px-10 md:px-20 pt-28 pb-20 relative overflow-hidden">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl space-y-6 mt-10 md:mt-0"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900">
            <span style={{
              background: "linear-gradient(135deg, #00B2FF 0%, #0083FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>Find Your {t("Next Job")}</span> <span style={{
              background: "linear-gradient(135deg, #00B2FF 0%, #0083FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>{t("Faster")}</span><br />
            <span style={{
              background: "linear-gradient(135deg, #00B2FF 0%, #0083FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>{t("with AI")}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            {t("Empower your recruitment journey")}
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="bg-[#0477BF] border-2 border-[#0477BF] text-white hover:opacity-90 px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-md transition" onClick={handleUploadClick}>
              📄 {t("Upload Resume")}
            </button>
            <button className="border-2 border-[#0477BF] text-[#0477BF] px-6 py-3 rounded-full font-semibold hover:bg-[#0477BF]/10 transition" onClick={() => navigate('/about')}>
              {t("Learn More")}
            </button>
          </div>
        </motion.div>

        {/* Right visual */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="relative flex items-center justify-center w-full">
  {/* Decorative gradient blobs */}
  <div className="absolute -top-16 -left-16 w-96 h-96 bg-sky-300 rounded-full blur-3xl opacity-50"></div>
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-40"></div>

  {/* Image container */}
  <div className="relative w-[400px] md:w-[600px] lg:w-[850px] z-10">
    <img
      src={personImg}
      alt="AI Recruitment"
      className="w-full drop-shadow-2xl"
    />
  </div>
</div>


        </motion.div>
      </section>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowAuthModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900">{t("Please sign in to continue")}</h3>
            <p className="text-gray-600 mt-2">{t("To upload your resume, join JobSpeedy AI by logging in or creating an account.")}</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setShowAuthModal(false)}>{t("Cancel")}</button>
              <button className="px-4 py-2 rounded-full border-2 border-[#0477BF] text-[#0477BF] bg-transparent hover:bg-[#0477BF]/10" onClick={() => { setShowAuthModal(false); navigate('/login'); }}>{t("Login")}</button>
              <button className="px-4 py-2 rounded-full border-2 border-[#0477BF] text-[#0477BF] bg-transparent hover:bg-[#0477BF]/10" onClick={() => { setShowAuthModal(false); navigate('/register'); }}>{t("Register")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Removed admin-only feature grid section from landing page */}

      {/* Workflow Chain */}
      <section className="relative px-6 md:px-16 py-24 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-[#0477BF]">
            {t("Your Journey to Getting Hired")}
          </h2>
          <div className="grid grid-cols-[80px_1fr] gap-6 relative">
            {/* vertical gradient line */}
          <div className="absolute left-[40px] top-0 bottom-0 w-[3px] bg-gradient-to-b from-sky-300 via-blue-400 to-blue-500"></div>

            {[
              {
                icon: <FaUpload />,
                title: t("Upload Resume"),
                desc: t("Start by uploading your resume in PDF. Our AI scans and extracts relevant data instantly."),
              },
              {
                icon: <FaRobot />,
                title: t("AI Parsing"),
                desc: t("AI automatically identifies skills, experience, and education details to create a structured profile."),
              },
              {
                icon: <FaClipboardCheck />,
                title: t("Profile Review"),
                desc: t("Review your extracted profile data — edit or update details before submitting."),
              },
              {
                icon: <FaChartLine />,
                title: t("Skill Insights"),
                desc: t("Receive AI-powered analytics that show how your skills compare to top candidates in your field."),
              },
              {
                icon: <FaUserTie />,
                title: t("Job Matching"),
                desc: t("Get instantly matched with available roles based on your experience, keywords, and preferences."),
              },
              {
                icon: <FaCheckCircle />,
                title: t("Apply Seamlessly"),
                desc: t("Submit your profile to matched roles directly from JobSpeedy AI — fast and simple."),
              },
            ].map((item, idx) => (
              <React.Fragment key={item.title}>
                {/* left number bubble */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="relative flex items-start justify-center pt-4"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-b from-sky-500 to-blue-600 text-white font-extrabold flex items-center justify-center z-10 shadow-lg">
                    {idx + 1}
                  </div>
                </motion.div>

                {/* right card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="absolute left-[-20px] top-8 h-[2px] w-5 bg-indigo-400/70"></div>
                  <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 text-indigo-700 font-bold text-lg md:text-xl">
                      <span className="text-[#0477BF] text-2xl">{item.icon}</span>
                      {item.title}
                    </div>
                    <p className="text-gray-600 mt-2 text-sm md:text-base">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gradient-to-r from-indigo-100 via-white to-purple-100 text-center text-gray-700 text-sm font-medium">
        © 2025 JobSpeedy AI | {t("All Rights Reserved")} | Language: 🇬🇧 🇩🇪
      </footer>
    </div>
  );
};

export default LandingPage;
