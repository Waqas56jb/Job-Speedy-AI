import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";
import Navbar from "./Navbar";

const JobDetailsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:4000/api/jobs/${id}`);
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setJob(data.job);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    const onStorage = () => setIsAuth(localStorage.getItem('isAuthenticated') === 'true');
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleApplyClick = () => {
    if (isAuth) {
      navigate(`/apply/${id}`);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={{ height: 70 }} />

      {/* Job Details */}
      <div style={styles.detailsContainer}>
        {loading ? (
          <p>{t("Loading...")}</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            <div style={styles.headerRow}>
              <FaArrowLeft onClick={() => navigate('/jobs')} style={styles.backIcon} />
              <h1 style={styles.jobTitle}>{job.title}</h1>
            </div>
            <p style={styles.jobCompany}>{job.company}</p>
            <p style={styles.jobLocation}>{job.location}</p>
            <p style={styles.jobDesc}>{job.description}</p>
            {Array.isArray(job.required_skills) && job.required_skills.length > 0 && (
              <p><strong>{t("Required skills:")}</strong> {job.required_skills.join(', ')}</p>
            )}
            <button style={styles.applyButton} onClick={handleApplyClick}>{t("Apply Now")}</button>
          </>
        )}
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowAuthModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900">{t("Please sign in to continue")}</h3>
            <p className="text-gray-600 mt-2">{t("To upload your resume, join JobSpeedy AI by logging in or creating an account.")}</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setShowAuthModal(false)}>{t("Cancel")}</button>
              <button className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => { setShowAuthModal(false); navigate('/login'); }}>{t("Login")}</button>
              <button className="px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700" onClick={() => { setShowAuthModal(false); navigate('/register'); }}>{t("Register")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <p style={styles.footerText}>
        © 2025 JobSpeedy AI | {t("All Rights Reserved")} | Language: 🇬🇧 🇩🇪
      </p>
    </div>
  );
};

const styles = {
  page: { fontFamily: "'Poppins', sans-serif", backgroundColor: "#f8f8ff", color: "#2e236c", minHeight: "100vh", position: "relative" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 60px", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 10 },
  logo: { fontSize: "24px", fontWeight: "700", color: "#4b2aad", cursor: "pointer" },
  logoSpan: { color: "#7b47ff" },
  navLinks: { display: "flex", gap: "25px", listStyle: "none", alignItems: "center", margin: 0 },
  navItem: { cursor: "pointer", fontWeight: 500, color: "#555", transition: "color 0.2s ease", fontSize: "18px" },
  registerBtn: { background: "#6a4cff", color: "#fff", borderRadius: "25px", padding: "12px 25px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "17px", boxShadow: "0 4px 10px rgba(106, 76, 255, 0.3)" },
  detailsContainer: { maxWidth: "700px", margin: "80px auto", backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  headerRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 },
  backIcon: { cursor: 'pointer', color: '#0477BF', fontSize: 20 },
  jobTitle: { fontSize: "32px", marginBottom: "10px", color: "#0477BF" },
  jobCompany: { fontWeight: "bold", color: "#0477BF", marginBottom: "5px" },
  jobLocation: { color: "#666", marginBottom: "15px" },
  jobDesc: { fontSize: "16px", color: "#444", marginBottom: "10px" },
  applyButton: { backgroundColor: "#0477BF", color: "white", border: "2px solid #0477BF", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginRight: "10px" , marginTop:"10px" },
  backButton: { backgroundColor: "#ccc", color: "#333", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" },
  waveContainer: { position: "absolute", bottom: 0, left: 0, width: "100%", textAlign: "center", zIndex: -1, pointerEvents: "none" },
  wave: { width: "100%", height: "auto", display: "block" },
  footerText: { position: "fixed", bottom: 0, left: 0, width: "100%", textAlign: "center", background: "#f8f8ff", color: "#2f2e30ff", fontWeight: "500", fontSize: "16px", padding: "10px 0" },
};

export default JobDetailsPage;
