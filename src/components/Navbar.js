import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem("isAuthenticated") === "true");
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    const onStorage = () => setIsAuth(localStorage.getItem("isAuthenticated") === "true");
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const handleLangChange = (lng) => setCurrentLang(lng);
    i18n.on('languageChanged', handleLangChange);
    return () => i18n.off('languageChanged', handleLangChange);
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'de' : 'en';
    i18n.changeLanguage(newLang);
  };

  const navItems = isAuth ? [t("Home"), t("Jobs"), t("About")] : [t("Home"), t("Jobs"), t("About"), t("Login")];

  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-white/90 backdrop-blur-md shadow-md fixed w-full top-0 z-50">
      <div
        style={{
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
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        JOBspeedy AI
      </div>

      <ul className="hidden md:flex space-x-8 text-lg font-medium">
        {navItems.map((item, idx) => {
          const originalItems = isAuth ? ["Home", "Jobs", "About"] : ["Home", "Jobs", "About", "Login"];
          const originalItem = originalItems[idx];
          return (
            <li
              key={originalItem}
              onClick={() => {
                if (originalItem === "Home") navigate("/");
                if (originalItem === "Jobs") navigate("/jobs");
                if (originalItem === "About") navigate("/about");
                if (originalItem === "Login") navigate("/login");
              }}
              className="hover:text-[#0477BF] cursor-pointer transition-colors duration-200"
            >
              {item}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="text-lg hover:text-[#0477BF] transition-colors duration-200"
          title={currentLang === 'en' ? 'Zu Deutsch wechseln' : 'Switch to English'}
        >
          {currentLang === 'en' ? '🇬🇧' : '🇩🇪'}
        </button>

        {!isAuth ? (
          <button
            className="px-5 py-2 rounded-full font-semibold border-2 border-[#0477BF] text-[#0477BF] bg-transparent hover:bg-[#0477BF]/10 transition"
            onClick={() => navigate("/register")}
          >
            {t("Register")}
          </button>
        ) : (
          <button
            className="text-sm px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => {
              localStorage.removeItem("isAuthenticated");
              try { window.dispatchEvent(new Event("storage")); } catch (_) {}
              navigate("/");
            }}
            title={t("Logout")}
          >
            {t("Logout")}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


