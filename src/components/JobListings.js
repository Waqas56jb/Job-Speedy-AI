import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "./Navbar";

const JobListingsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  // Removed per request: language dropdown filter
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ types: [], categories: [], languages: [], locations: [] });
  const [loading, setLoading] = useState(false);

  // fetch filters (distinct values)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:4000/api/jobs/filters');
        const data = await res.json();
        setFilters({ types: data.types || [], categories: data.categories || [], languages: data.languages || [], locations: data.locations || [] });
      } catch (_) {}
    })();
  }, []);

  // fetch jobs based on filters
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (location) params.set('location', location);
        if (type) params.set('type', type);
        if (category) params.set('category', category);
        // language filter removed
        const res = await fetch(`http://localhost:4000/api/jobs?${params.toString()}`);
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (_) {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [search, location, type, category]);

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setType("");
    setCategory("");
    // language filter removed
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={{ height: 70 }} />

      {/* Search Section */}
      <div style={styles.searchSection}>
        <h1 style={styles.title}>{t("Explore Opportunities")}</h1>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select style={styles.select} value={location} onChange={(e)=>setLocation(e.target.value)}>
          <option value="">{t("All Locations")}</option>
          {filters.locations.map((loc)=> (<option key={loc} value={loc}>{loc}</option>))}
        </select>
        <select style={styles.select} value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="">{t("All Job Types")}</option>
          {filters.types.map((typeItem)=> (<option key={typeItem} value={typeItem}>{typeItem}</option>))}
        </select>
        <select style={styles.select} value={category} onChange={(e)=>setCategory(e.target.value)}>
          <option value="">{t("All Categories")}</option>
          {filters.categories.map((c)=> (<option key={c} value={c}>{c}</option>))}
        </select>
        <button style={styles.button} onClick={clearFilters}>{t("Show All")}</button>
      </div>

      {/* Job Cards */}
      <div style={styles.jobList}>
        {loading ? (
          <p style={styles.noJobs}>{t("Loading...")}</p>
        ) : jobs.length ? (
          jobs.map((job) => (
            <div key={job.id} style={styles.jobCard}>
              <h2 style={styles.jobTitle}>{job.title}</h2>
              <p style={styles.jobCompany}>{job.company}</p>
              <p style={styles.jobLocation}>{job.location}</p>
              <p style={styles.jobDesc}>{job.description}</p>
              <button
                style={styles.applyButton}
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                {t("View Details")}
              </button>
            </div>
          ))
        ) : (
          <p style={styles.noJobs}>{t("No jobs found.")}</p>
        )}
      </div>

      {/* Footer */}
      <p style={styles.footerText}>
        © 2025 JobSpeedy AI | {t("All Rights Reserved")} | Language: 🇬🇧 🇩🇪
      </p>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#f8f8ff",
    color: "#2e236c",
    minHeight: "100vh",
    position: "relative",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 60px",
    background: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logo: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#4b2aad",
    cursor: "pointer",
  },
  logoSpan: { color: "#7b47ff" },
  navLinks: { display: "flex", gap: "25px", listStyle: "none", alignItems: "center", margin: 0 },
  navItem: { cursor: "pointer", fontWeight: 500, color: "#555", transition: "color 0.2s ease", fontSize: "18px" },
  registerBtn: { background: "#6a4cff", color: "#fff", borderRadius: "25px", padding: "12px 25px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "17px", boxShadow: "0 4px 10px rgba(106, 76, 255, 0.3)" },
  searchSection: { textAlign: "center", paddingTop: "60px" },
  title: { fontSize: "48px", color: "#2e236c", marginBottom: "30px" },
  searchBar: { display: "flex", justifyContent: "center", gap: "10px" },
  input: { padding: "12px 15px", borderRadius: "8px", border: "1px solid #ccc", width: "200px", outline: "none" },
  button: { backgroundColor: "transparent", color: "#0477BF", border: "2px solid #0477BF", padding: "12px 25px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  filters: { display: "flex", justifyContent: "center", gap: "15px", marginTop: "40px" },
  select: { padding: "10px 15px", borderRadius: "8px", border: "1px solid #ccc", cursor: "pointer" },
  jobList: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", padding: "60px 80px" },
  jobCard: { backgroundColor: "white", padding: "25px", borderRadius: "12px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", transition: "transform 0.2s ease" },
  jobTitle: { color: "#2e236c", fontSize: "22px", marginBottom: "8px" },
  jobCompany: { color: "#0477BF", fontWeight: "bold" },
  jobLocation: { fontSize: "14px", color: "#666", marginBottom: "10px" },
  jobDesc: { fontSize: "15px", color: "#444", marginBottom: "15px" },
  applyButton: { backgroundColor: "#0477BF", color: "white", border: "2px solid #0477BF", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" },
  noJobs: { textAlign: "center", color: "#0477BF", fontSize: "18px" },
  waveContainer: { position: "absolute", bottom: 0, left: 0, width: "100%", textAlign: "center", zIndex: -1, pointerEvents: "none" },
  wave: { width: "100%", height: "auto", display: "block" },
  footerText: { position: "fixed", bottom: 0, left: 0, width: "100%", textAlign: "center", background: "#f8f8ff", color: "#2f2e30ff", fontWeight: "500", fontSize: "16px", padding: "10px 0" },
};

export default JobListingsPage;
