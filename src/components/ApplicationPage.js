import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "./Navbar";
import { FaArrowLeft } from "react-icons/fa";

const ApplicationPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id: jobId } = useParams();
  const [name, setName] = useState(() => {
    try { return localStorage.getItem('userFullName') || ""; } catch (_) { return ""; }
  });
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem('userEmail') || ""; } catch (_) { return ""; }
  });
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [applicantId, setApplicantId] = useState(() => localStorage.getItem('applicantId') || null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [scoreText, setScoreText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [job, setJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data.job);
        }
      } catch (_) {}
    })();
  }, [jobId]);

  // If no jobId provided (landing), fetch jobs for a dropdown
  useEffect(() => {
    if (jobId) return;
    (async () => {
      try {
        const res = await fetch('http://localhost:4000/api/jobs');
        const data = await res.json();
        setAllJobs(data.jobs || []);
      } catch (_) {}
    })();
  }, [jobId]);

  const handleUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError(t("Please upload a PDF file."));
      return;
    }
    setError("");
    setFile(f);
  };

  const handleParse = async () => {
    if (!file) {
      setError(t("Please select a resume PDF first."));
      return;
    }
    setError("");
    setParsing(true);
    try {
      const form = new FormData();
      form.append('resume', file);
      form.append('name', name);
      form.append('email', email);
      form.append('phone', phone);
      const res = await fetch('http://localhost:4000/api/parse-resume', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Failed to parse resume');
      const data = await res.json();
      setParsed({ skills: data.skills || [], experience: data.experience || [], education: data.education || '', classification: data.classification || '' });
      if (data.applicantId) {
        setApplicantId(String(data.applicantId));
        localStorage.setItem('applicantId', String(data.applicantId));
      }
      setScoreText(data.classification || "");
    } catch (e) {
      setError(e.message);
    } finally {
      setParsing(false);
    }
  };

  const fetchSuggestions = async (id) => {
    setSuggesting(true);
    try {
      const res = await fetch(`http://localhost:4000/api/suggest-jobs/${id}`);
      if (!res.ok) throw new Error('Failed to fetch job suggestions');
      const data = await res.json();
      setSuggestedJobs(data.jobs || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || !file) {
      setError(t("Please complete required fields."));
      return;
    }
    setError("");
    try {
      const form = new FormData();
      const selectedJobId = jobId || (document.getElementById('jobSelect')?.value || '');
      form.append('job_id', selectedJobId);
      form.append('name', name);
      form.append('email', email);
      form.append('phone', phone);
      try {
        const uid = localStorage.getItem('userId');
        const uemail = localStorage.getItem('userEmail');
        if (uid) form.append('user_id', uid);
        if (uemail) form.append('user_email', uemail);
      } catch (_) {}
      if (parsed) form.append('ai_parsed_data', JSON.stringify(parsed));
      form.append('resume', file);
      const res = await fetch('http://localhost:4000/api/applications', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Failed to submit application');
      setSubmitted(true);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={styles.page}>
      {/* Top Navbar */}
      <Navbar />
      <div style={{ height: 70 }} />

      {/* Main Card */}
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <FaArrowLeft onClick={() => navigate('/jobs')} style={styles.backIcon} />
          <h1 style={styles.title}>{job ? `${t("Apply for")} ${job.title} ${t("at")} ${job.company}` : t("Application")}</h1>
        </div>
        <p style={styles.subtitle}>{t("Upload your resume and preview parsed details.")}</p>

        <div style={styles.grid}>
          {/* Left: Form */}
          <div style={styles.card}>
            {!jobId && (
              <div style={styles.formGroup}>
                <label style={styles.label}>{t("Select Job (required)")}</label>
                <select id="jobSelect" style={styles.input} defaultValue="">
                  <option value="" disabled>{t("Choose a job")}</option>
                  {allJobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>{t("Full Name")}</label>
              <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Your name")} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>{t("Email")}</label>
              <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>{t("Phone (optional)")}</label>
              <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 123 456 789" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>{t("Upload Resume (PDF)")}</label>
              <input style={styles.file} type="file" accept="application/pdf" onChange={handleUpload} />
            </div>

            <div style={styles.actionsRow}>
              <button style={styles.primaryBtn} onClick={handleParse} disabled={parsing}>
                {parsing ? t("Parsing...") : t("Parse Resume")}
              </button>
              <button style={styles.secondaryBtn} onClick={handleSubmit} disabled={parsing || submitted}>
                {submitted ? t("Submitted") : t("Confirm & Submit")}
              </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}
            {submitted && (
              <div style={styles.success}>{t("Your profile has been submitted successfully!")}</div>
            )}
          </div>

          {/* Right: Preview */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>{t("Parsed Preview")}</h3>
            {!parsed && !parsing && (
              <div style={styles.placeholder}>{t("No parsed data yet. Upload and click Parse.")}</div>
            )}
            {parsing && (
              <div style={styles.progressBox}>
                <div style={styles.spinner} />
                <div>{t("Analyzing your resume...")}</div>
              </div>
            )}
            {parsed && !parsing && (
              <div style={{ display: 'grid', gap: 14 }}>
                {/* AI Evaluation */}
                {scoreText && (
                  <div style={styles.previewSection}>
                    <div style={styles.previewHeading}>{t("AI Evaluation:")}</div>
                    <div style={styles.badge}>{scoreText}</div>
                  </div>
                )}

                {/* Skills */}
                <div style={styles.previewSection}>
                  <div style={styles.previewHeading}>{t("Skills:")}</div>
                  <div style={styles.chipsWrap}>
                    {parsed.skills && parsed.skills.length > 0 ? (
                      parsed.skills.map((s, i) => (
                        <span key={i} style={styles.chip}>{s}</span>
                      ))
                    ) : (
                      <span style={styles.muted}>—</span>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div style={styles.previewSection}>
                  <div style={styles.previewHeading}>{t("Experience:")}</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {parsed.experience && parsed.experience.length > 0 ? (
                      parsed.experience.map((e, i) => (
                        <div key={i} style={styles.expItem}>
                          <div style={styles.expTitle}>{e.role || t('Experience')}</div>
                          <div style={styles.expMeta}>
                            {(e.company || '—')} • {(e.years || e.duration || '—')}
                          </div>
                          {e.summary && <div style={styles.expDesc}>{e.summary}</div>}
                        </div>
                      ))
                    ) : (
                      <span style={styles.muted}>—</span>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div style={styles.previewSection}>
                  <div style={styles.previewHeading}>{t("Education:")}</div>
                  <div>{parsed.education || <span style={styles.muted}>—</span>}</div>
                </div>

                {applicantId && (
                  <div style={{ marginTop: 6 }}>
                    <button style={styles.primaryBtn} onClick={() => fetchSuggestions(applicantId)} disabled={suggesting}>
                      {suggesting ? t("Fetching Suggestions...") : t("Get AI-Suggested Jobs")}
                    </button>
                  </div>
                )}

                {suggestedJobs.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <h3 style={styles.sectionHeader}>{t("AI-Suggested Jobs")}</h3>
                    <ul>
                      {suggestedJobs.map((j) => (
                        <li key={j.id} style={{ marginBottom: 8 }}>
                          <strong>{j.title}</strong> — {j.company} ({j.location}) {typeof j.score === 'number' ? `• ${t("Match")} ${(j.score*100|0)}%` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      
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
  headerRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 },
  backIcon: { cursor: 'pointer', color: '#4b2aad', fontSize: 20 },
  title: { fontSize: 36, margin: 0 },
  subtitle: { color: "#555", marginTop: 8 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 },
  card: { background: "white", borderRadius: 12, padding: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  formGroup: { marginBottom: 16 },
  label: { display: "block", fontSize: 12, letterSpacing: "1px", fontWeight: 600, color: "#1b1b3a", marginBottom: 8 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", outline: "none", background: "#fff" },
  file: { width: "100%" },
  actionsRow: { display: "flex", gap: 12, marginTop: 8 },
  primaryBtn: { backgroundColor: "#0477BF", color: "#fff", border: "2px solid #0477BF", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontWeight: "bold" },
  secondaryBtn: { backgroundColor: "#4cafef", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontWeight: "bold" },
  sectionHeader: { marginTop: 0 },
  placeholder: { color: "#777" },
  progressBox: { display: "flex", alignItems: "center", gap: 10 },
  spinner: { width: 16, height: 16, border: "3px solid #ddd", borderTopColor: "#0477BF", borderRadius: "50%", animation: "spin 1s linear infinite" },
  error: { color: "#b00020", marginTop: 10, fontSize: 12 },
  success: { color: "#1b7e34", marginTop: 10, fontSize: 13, fontWeight: 600 },
  waveContainer: { position: "absolute", bottom: 0, left: 0, width: "100%", textAlign: "center", zIndex: -1, pointerEvents: "none" },
  wave: { width: "100%", height: "auto", display: "block" },
  // New preview styles for a beautiful parsed display
  previewSection: { background: "#f9fbff", border: "1px solid #e6f0fb", borderRadius: 10, padding: 14 },
  previewHeading: { fontWeight: 700, marginBottom: 8, color: "#0477BF", letterSpacing: 0.2 },
  chipsWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: { background: '#e6f4ff', color: '#035c96', border: '1px solid #bfe0ff', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 600 },
  muted: { color: '#999' },
  expItem: { background: '#ffffff', border: '1px solid #eef3fa', borderRadius: 10, padding: 12 },
  expTitle: { fontWeight: 700, color: '#1f2b40' },
  expMeta: { color: '#6b7a90', fontSize: 13, marginTop: 2 },
  expDesc: { color: '#3b485c', fontSize: 14, marginTop: 6 },
};

export default ApplicationPage;


