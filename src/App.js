import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import Login from "./pages/Login";
import Preferences from "./pages/Preferences.jsx";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import WeatherCard from "./pages/WeatherCard.jsx";

axios.defaults.withCredentials = true;

function App() {
  // https://weather-app-kd.netlify.app/
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await axios.get(
          "https://weatherappgrouph.onrender.com/api/preferences"
        );
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("https://weatherappgrouph.onrender.com/api/auth/logout");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#f5f7fa",
            direction: "rtl",
            fontFamily: "Tajawal, sans-serif",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "6px solid #3498db",
              borderTopColor: "transparent",
              borderRightColor: "rgba(52, 152, 219, 0.5)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px",
            }}
          ></div>

          <h3
            style={{
              color: "#2c3e50",
              fontSize: "1.5rem",
              marginBottom: "10px",
              fontWeight: "700",
            }}
          >
            جاري التحقق...
          </h3>

          <p
            style={{
              color: "#7f8c8d",
              fontSize: "1rem",
              textAlign: "center",
              maxWidth: "300px",
              lineHeight: "1.6",
            }}
          >
            نتحقق من بيانات الاعتماد الخاصة بك، الرجاء الانتظار لحظة
          </p>

          <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
      );
    }
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };
  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <Routes>
        <Route
          path="/login"
          element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />}
        />

        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <WeatherCard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/preferences"
          element={
            <ProtectedRoute>
              <Preferences />
            </ProtectedRoute>
          }
        />

        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <WeatherCard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
