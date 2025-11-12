import React from "react";
import { useTranslation } from "react-i18next";
import Navbar from "./Navbar";

const AboutPage = () => {
  const { t } = useTranslation();
  
  return (
    <div style={styles.page}>
      <Navbar />
      <div style={{ height: 70 }} />

      <div style={styles.container}>
        <h1 style={styles.gradientTitle}>{t("About JOBspeedy AI")}</h1>
        <p style={styles.lead}>{t("AboutIntro1")}</p>
        <p style={styles.lead}>{t("AboutIntro2")}</p>
        <p style={styles.lead}>{t("AboutIntro3")}</p>

        <h3 style={styles.sectionTitle}>{t("AboutEmployersTitle")}</h3>
        <ul style={styles.list}>
          <li>{t("AboutEmployers1")}</li>
          <li>{t("AboutEmployers2")}</li>
          <li>{t("AboutEmployers3")}</li>
          <li>{t("AboutEmployers4")}</li>
          <li>{t("AboutEmployers5")}</li>
        </ul>

        <p style={styles.lead}>{t("AboutCandidates")}</p>
        <p style={styles.lead}><strong>{t("AboutBelief")}</strong></p>
        <p style={styles.lead}>{t("AboutContext")}</p>

        <h3 style={styles.sectionTitle}>{t("Our Mission")}</h3>
        <p style={styles.lead}>{t("MissionText")}</p>

        <h3 style={styles.sectionTitle}>{t("Our Vision")}</h3>
        <p style={styles.lead}>{t("VisionText")}</p>

        <h3 style={styles.sectionTitle}>{t("Our Values")}</h3>
        <ul style={styles.list}>
          <li>{t("ValuesInnovation")}</li>
          <li>{t("ValuesIntegrity")}</li>
          <li>{t("ValuesEfficiency")}</li>
          <li>{t("ValuesEmpowerment")}</li>
        </ul>

        <p style={styles.lead}>{t("AboutClosing1")}</p>
        <p style={styles.lead}><strong>{t("AboutClosing2")}</strong></p>
        <p style={styles.lead}>{t("AboutClosing3")}</p>
        <p style={styles.lead}>{t("AboutClosing4")}</p>
        <p style={styles.lead}>{t("AboutClosing5")}</p>
      </div>

      <div style={{ height: 30 }} />
      <p style={styles.footerText}>© 2025 JobSpeedy AI | {t("All Rights Reserved")} | Language: 🇬🇧 🇩🇪</p>
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
  container: { maxWidth: 1100, margin: "40px auto", padding: "0 24px" },
  title: { fontSize: 36, margin: 0 },
  gradientTitle: {
    fontSize: 36,
    margin: 0,
    fontWeight: 600,
    background: "linear-gradient(135deg, #00B2FF 0%, #0083FF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  lead: { color: "#555", marginTop: 10 },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontWeight: 600,
    color: "#0477BF",
  },
  list: { margin: 0, paddingLeft: 18, color: "#444", lineHeight: 1.6 },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 24 },
  card: { background: "white", borderRadius: 12, padding: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  waveContainer: { position: "absolute", bottom: 0, left: 0, width: "100%", textAlign: "center", zIndex: -1, pointerEvents: "none" },
  wave: { width: "100%", height: "auto", display: "block" },
  footerText: { textAlign: "center", color: "#2f2e30ff", fontWeight: 500, fontSize: 16, padding: "10px 0", marginTop: 10 },
};

export default AboutPage;


