import React, { useState, useEffect } from "react";
import backgroundImg from "../assets/background.png";
import waveImg from "../assets/wave.png";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Forgot password modal state
  const [fpOpen, setFpOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMsg, setFpMsg] = useState("");
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    const handleLangChange = (lng) => setCurrentLang(lng);
    i18n.on('languageChanged', handleLangChange);
    return () => i18n.off('languageChanged', handleLangChange);
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'de' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleForgot = async () => {
    setFpMsg("");
    if (!fpEmail || !fpNewPassword) {
      setFpMsg(t("Email and new password are required"));
      return;
    }
    if (fpNewPassword !== fpConfirmPassword) {
      setFpMsg(t("New password and confirm password do not match"));
      return;
    }
    setFpLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, newPassword: fpNewPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }
      setFpMsg(t("Password updated successfully. You can now log in."));
      // Optionally close after a short delay
      setTimeout(() => setFpOpen(false), 1200);
    } catch (e) {
      setFpMsg(e.message);
    } finally {
      setFpLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Login failed" }));
        throw new Error(err.error || "Login failed");
      }
      const data = await res.json();
      // Mark authenticated so navbar and upload gate recognize login
      try {
        localStorage.setItem('isAuthenticated', 'true');
        if (data && data.user) {
          if (data.user.id) localStorage.setItem('userId', String(data.user.id));
          if (data.user.email) localStorage.setItem('userEmail', String(data.user.email));
          if (data.user.fullName) localStorage.setItem('userFullName', String(data.user.fullName));
        }
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}
      // Navigate to home (admin pages were removed in this build)
      navigate("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Language Switcher - Top Right Corner */}
      <button
        onClick={toggleLanguage}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 100,
          fontSize: "24px",
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
        }}
        title={currentLang === 'en' ? 'Zu Deutsch wechseln' : 'Switch to English'}
      >
        {currentLang === 'en' ? '🇬🇧' : '🇩🇪'}
      </button>

      {/* Left Side */}
      <div style={styles.leftSection}>
        <h1 style={styles.logoBrand}>JOBspeedy AI</h1>
        <p style={styles.quote}>
          AI DOES'NT JUST FIND JOBS IT FINDS THE RIGHT ONES FOR YOU.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div style={styles.rightSection}>
        <div style={styles.formBox}>
          <h2 style={styles.formTitle}>{t("Login to Your Account")}</h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t("Email Address")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="example@email.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t("Password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="********"
            />
          </div>

          <div style={styles.forgotPassword}>
            <button type="button" style={styles.forgotLink} onClick={() => { setFpEmail(""); setFpNewPassword(""); setFpConfirmPassword(""); setFpMsg(""); setFpOpen(true); }}>
              {t("Forgot Password?")}
            </button>
          </div>

          <button style={styles.loginBtn} onClick={handleLogin}>
            {loading ? "LOADING..." : t("Login")}
          </button>
          {error && (
            <div style={{ color: "#b00020", marginTop: "10px", fontSize: "12px" }}>
              {error}
            </div>
          )}

          <div style={styles.register}>
            {t("Don't have an account?")}{" "}
            <Link to="/register" style={styles.registerLink}>
              {t("Register")}
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {fpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setFpOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900">{t("Reset Password")}</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">{t("Email Address")}</label>
                <input type="email" value={fpEmail} onChange={(e)=>setFpEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">{t("New Password")}</label>
                <input type="password" value={fpNewPassword} onChange={(e)=>setFpNewPassword(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="********" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">{t("Confirm Password")}</label>
                <input type="password" value={fpConfirmPassword} onChange={(e)=>setFpConfirmPassword(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="********" />
              </div>
              {fpMsg && <div className="text-sm" style={{ color: fpMsg.toLowerCase().includes('success') ? '#0a7' : '#b00020' }}>{fpMsg}</div>}
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={()=>setFpOpen(false)}>{t("Cancel")}</button>
              <button className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleForgot} disabled={fpLoading}>
                {fpLoading ? t("Updating...") : t("Update Password")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Image */}
      <img src={backgroundImg} alt="Background" style={styles.background} />
      {/* Wave */}
      <div style={styles.waveContainer}>
        <img src={waveImg} alt="wave background" style={styles.wave} />
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
    backgroundColor: "#f6f7ff",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: -1,
    opacity: 0.25,
  },
  waveContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    textAlign: "center",
    zIndex: -1,
    pointerEvents: "none",
  },
  wave: { width: "100%", height: "auto", display: "block" },
  leftSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    color: "#3b2e91",
    textAlign: "center",
    padding: "40px",
  },
  logoBrand: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "32px",
    fontWeight: 500,
    background: "linear-gradient(135deg, #00B2FF 0%, #0083FF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: "transparent",
    display: "inline-block",
    letterSpacing: "-0.5px",
    lineHeight: "1.2",
    marginBottom: "20px",
  },
  quote: {
    fontSize: "16px",
    lineHeight: "1.6",
    letterSpacing: "1px",
    fontWeight: "600",
    color: "#2e236c",
    maxWidth: "320px",
  },
  rightSection: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#a9bbd9",
  },
  formBox: {
    backgroundColor: "#a9bbd9",
    padding: "40px",
    borderRadius: "8px",
    width: "350px",
    color: "#1b1b3a",
  },
  formTitle: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "30px",
    color: "#1b1b3a",
    textAlign: "center",
  },
  formGroup: { marginBottom: "20px" },
  label: {
    display: "block",
    fontSize: "12px",
    letterSpacing: "1px",
    fontWeight: "600",
    color: "#1b1b3a",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "10px 0",
    border: "none",
    borderBottom: "1px solid #1b1b3a",
    background: "transparent",
    fontSize: "14px",
    outline: "none",
  },
  forgotPassword: {
    textAlign: "right",
    marginBottom: "25px",
  },
  forgotLink: {
    fontSize: "12px",
    color: "#1b1b3a",
    textDecoration: "none",
  },
  loginBtn: {
    backgroundColor: "#1b1b3a",
    color: "#fff",
    border: "none",
    borderRadius: "30px",
    padding: "12px 0",
    width: "100%",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  register: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "13px",
  },
  registerLink: {
    color: "#1b1b3a",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default LoginPage;
