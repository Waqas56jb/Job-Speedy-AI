import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure app starts in logged-out state per browser tab session
try {
  if (sessionStorage.getItem("authInit") !== "done") {
    localStorage.removeItem("isAuthenticated");
    sessionStorage.setItem("authInit", "done");
  }
} catch (_) {}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
