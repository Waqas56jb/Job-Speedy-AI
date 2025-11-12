import React, { useState, useEffect } from "react";
import backgroundImg from "../assets/background.png";
import waveImg from "../assets/wave.png";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const handleRegister = async () => {
    if (!agree) {
      alert("Please agree to the terms & conditions.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Registration failed" }));
        throw new Error(err.error || "Registration failed");
      }
      const data = await res.json();
      // Consider the user signed in immediately after successful registration
      try {
        localStorage.setItem('isAuthenticated', 'true');
        if (data && data.user) {
          if (data.user.id) localStorage.setItem('userId', String(data.user.id));
          if (data.user.email) localStorage.setItem('userEmail', String(data.user.email));
          if (data.user.fullName) localStorage.setItem('userFullName', String(data.user.fullName));
        }
        window.dispatchEvent(new Event('storage'));
      } catch (_) {}
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
          CONNECTING TALENT WITH OPPORTUNITY <br />
          FASTER, SMARTER, AND POWERED BY AI.
        </p>
      </div>

      {/* Right Side - Sign Up Form */}
      <div style={styles.rightSection}>
        <div style={styles.formBox}>
          <h2 style={styles.formTitle}>{t("Register Now")}</h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t("Full Name")}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={styles.input}
              placeholder={t("Full Name")}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t("Email Address")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter your email"
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

          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              style={{ marginRight: "8px" }}
            />
            <span style={styles.checkboxText}>
              {t("I agree to the terms & conditions")}
            </span>
          </div>

          <div style={styles.buttonGroup}>
            <button style={styles.signupBtn} onClick={handleRegister}>
              {loading ? "SAVING..." : t("Sign Up")}
            </button>
            <Link to="/login" style={styles.loginBtn}>
              {t("Login")}
            </Link>
          </div>
          {error && (
            <div style={{ color: "#b00020", marginTop: "10px", fontSize: "12px", textAlign: "center" }}>
              {error}
            </div>
          )}
        </div>
      </div>

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
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
    marginBottom: "25px",
  },
  checkboxText: {
    fontSize: "12px",
    color: "#1b1b3a",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  signupBtn: {
    backgroundColor: "#1b1b3a",
    color: "#fff",
    border: "none",
    borderRadius: "30px",
    padding: "12px 0",
    width: "50%",
    cursor: "pointer",
    fontWeight: "600",
  },
  loginBtn: {
    border: "2px solid #1b1b3a",
    borderRadius: "30px",
    padding: "10px 0",
    width: "50%",
    textAlign: "center",
    color: "#1b1b3a",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default RegisterPage;
