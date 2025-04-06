import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://weatherappgrouph.onrender.com/api/auth/register",
        { username, password },
        { withCredentials: true }
      );
      navigate("/weather");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "فشل في إنشاء الحساب. الرجاء المحاولة مرة أخرى."
      );
      console.error("Registration error:", err.response?.data || err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>إنشاء حساب جديد</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>
            تسجيل
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.linkText}>
          لديك حساب بالفعل؟{" "}
          <a href="/login" style={styles.link}>
            تسجيل الدخول
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #2196f3, #0d47a1)",
    padding: "2rem",
  },
  card: {
    width: "100%",
    maxWidth: "450px",
    padding: "2.5rem",
    borderRadius: "20px",
    background:
      "linear-gradient(145deg, rgba(33, 150, 243, 0.7), rgba(13, 71, 161, 0.7))",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.18)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
  },
  title: {
    textAlign: "center",
    color: "white",
    fontSize: "2rem",
    marginBottom: "2rem",
    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  input: {
    width: "100%",
    padding: "1rem",
    fontSize: "1rem",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.15)",
    color: "white",
    outline: "none",
    "::placeholder": {
      color: "rgba(255, 255, 255, 0.7)",
    },
  },
  button: {
    padding: "1rem",
    fontSize: "1.1rem",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
      background: "rgba(255, 255, 255, 0.3)",
    },
  },
  error: {
    color: "#ffebee",
    textAlign: "center",
    marginTop: "1.5rem",
    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
  },
  linkText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: "1.5rem",
  },
  link: {
    color: "#FFD700",
    textDecoration: "none",
    ":hover": {
      textDecoration: "underline",
    },
  },
};

export default Register;
