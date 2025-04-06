import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FaRegStar, FaStar } from "react-icons/fa";

function WeatherCard() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const location = useLocation();

  const normalizeCityName = (cityName) => {
    return cityName.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const cityFromQuery = queryParams.get("city");

    if (cityFromQuery) {
      setCity(cityFromQuery);
      fetchWeather(cityFromQuery);
    } else {
      detectLocation();
    }
  }, [location.search]);

  const fetchWeather = async (cityName) => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.get(
        "https://weatherappgrouph.onrender.com/api/weather",
        {
          params: { city: cityName },
          withCredentials: true,
        }
      );

      const normalizedCityName = normalizeCityName(response.data.name);
      response.data.name = normalizedCityName;

      setWeatherData(response.data);
      setCity(normalizedCityName);
      checkIfFavorite(normalizedCityName);
    } catch (err) {
      setError("فشل في جلب بيانات الطقس");
    }
    setLoading(false);
  };

  const checkIfFavorite = async (cityName) => {
    try {
      const response = await axios.get(
        "https://weatherappgrouph.onrender.com/api/preferences",
        { withCredentials: true }
      );
      const favorites = response.data;
      const isCityFavorite = favorites.some((fav) => fav.city === cityName);
      setIsFavorite(isCityFavorite);
    } catch (err) {
      console.error("Error checking favorite:", err);
    }
  };

  const addToFavorites = async () => {
    if (!weatherData?.name) return;

    try {
      await axios.post(
        "https://weatherappgrouph.onrender.com/api/preferences",
        { city: weatherData.name },
        { withCredentials: true }
      );
      setIsFavorite(true);
    } catch (err) {
      setError("فشل في إضافة المدينة إلى المفضلة");
    }
  };

  const removeFromFavorites = async () => {
    if (!weatherData?.name) return;

    try {
      const response = await axios.get(
        "https://weatherappgrouph.onrender.com/api/preferences",
        { withCredentials: true }
      );
      const favorites = response.data;
      const cityToRemove = favorites.find(
        (fav) => fav.city === weatherData.name
      );

      if (cityToRemove) {
        await axios.delete(
          `https://weatherappgrouph.onrender.com/api/preferences/${cityToRemove._id}`,
          { withCredentials: true }
        );
        setIsFavorite(false);
      }
    } catch (err) {
      setError("فشل في إزالة المدينة من المفضلة");
    }
  };

  const handleStarClick = () => {
    if (isFavorite) {
      removeFromFavorites();
    } else {
      addToFavorites();
    }
  };

  const detectLocation = () => {
    setError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم تحديد الموقع");
      setLoading(false);
      setShowManualSearch(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await axios.get(
            "https://weatherappgrouph.onrender.com/api/weather",
            {
              params: {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              },
              withCredentials: true,
            }
          );

          const normalizedCityName = normalizeCityName(response.data.name);
          response.data.name = normalizedCityName;

          setWeatherData(response.data);
          setCity(normalizedCityName);
          checkIfFavorite(normalizedCityName);
        } catch (err) {
          setError("فشل في جلب بيانات الطقس");
          setShowManualSearch(true);
        }
        setLoading(false);
      },
      (error) => {
        handleLocationError(error);
        setLoading(false);
        setShowManualSearch(true);
      }
    );
  };

  const handleLocationError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setError("تم رفض الإذن بالوصول إلى الموقع");
        break;
      case error.POSITION_UNAVAILABLE:
        setError("معلومات الموقع غير متاحة");
        break;
      case error.TIMEOUT:
        setError("انتهت المهلة في انتظار الموقع");
        break;
      default:
        setError("تعذر الحصول على الموقع الحالي");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setError("");
    setLoading(true);

    try {
      const response = await axios.get(
        "https://weatherappgrouph.onrender.com/api/weather",
        {
          params: { city },
          withCredentials: true,
        }
      );

      const normalizedCityName = normalizeCityName(response.data.name);
      response.data.name = normalizedCityName;

      setWeatherData(response.data);
      setCity(normalizedCityName);
    } catch (err) {
      setError("فشل في العثور على المدينة");
    }
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = { month: "long", day: "numeric", year: "numeric" };
    return date
      .toLocaleDateString("en-US", options)
      .replace(/(\d+)(th|nd|rd|st)/, "$1");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>توقعات الطقس</h2>
        {weatherData && (
          <div style={styles.starContainer}>
            <button onClick={handleStarClick} style={styles.starButton}>
              {isFavorite ? (
                <FaStar style={styles.starIconFilled} />
              ) : (
                <FaRegStar style={styles.starIcon} />
              )}
            </button>
          </div>
        )}
        {!weatherData && (showManualSearch || error) && (
          <form onSubmit={handleSearch} style={styles.form}>
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="أدخل اسم المدينة..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={styles.input}
              />
              <button
                type="submit"
                style={styles.searchButton}
                disabled={loading}
              >
                بحث
              </button>
            </div>
          </form>
        )}
        {!weatherData && error && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
            <button onClick={detectLocation} style={styles.retryButton}>
              المحاولة مرة أخرى
            </button>
            <p style={styles.manualSearchText}>
              أو ابحث يدويًا بإدخال اسم المدينة
            </p>
          </div>
        )}
        {loading ? (
          <div style={styles.loadingText}>جاري تحميل بيانات الطقس...</div>
        ) : (
          weatherData && (
            <div style={styles.weatherContainer}>
              <div style={styles.cityInfo}>
                <h3 style={styles.cityName}>{weatherData.name}</h3>
                <p style={styles.date}>{formatDate(weatherData.dt)}</p>
              </div>

              <div style={styles.weatherMain}>
                <img
                  src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                  alt="أيقونة الطقس"
                  style={styles.weatherIcon}
                />
                <div style={styles.temperature}>
                  {Math.round(weatherData.main.temp)}°C
                </div>
              </div>

              <div style={styles.weatherDetails}>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>درجة الحرارة الدنيا</div>
                  <div>{Math.round(weatherData.main.temp_min)}°C</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>درجة الحرارة الأقصى</div>
                  <div>{Math.round(weatherData.main.temp_max)}°C</div>
                </div>
              </div>
            </div>
          )
        )}
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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "linear-gradient(135deg, #2196f3, #0d47a1)",
    padding: "1rem",
    "@media (max-width: 480px)": {
      padding: "0.5rem",
    },
  },
  card: {
    width: "100%",
    maxWidth: "650px",
    padding: "2rem",
    borderRadius: "20px",
    background:
      "linear-gradient(145deg, rgba(13, 71, 161, 0.3), rgba(33, 150, 243, 0.3))",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.18)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    position: "relative",
    "@media (max-width: 768px)": {
      padding: "1.5rem",
    },
    "@media (max-width: 480px)": {
      padding: "1rem",
      borderRadius: "15px",
    },
  },
  title: {
    textAlign: "center",
    color: "white",
    fontSize: "2.2rem",
    marginBottom: "1.5rem",
    fontWeight: 600,
    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
    "@media (max-width: 768px)": {
      fontSize: "2rem",
    },
    "@media (max-width: 480px)": {
      fontSize: "1.8rem",
      marginBottom: "1rem",
    },
  },
  starContainer: {
    position: "absolute",
    top: "1.5rem",
    right: "1.5rem",
    "@media (max-width: 480px)": {
      top: "1rem",
      right: "1rem",
    },
  },
  starButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  starIcon: {
    fontSize: "24px",
    color: "rgba(255, 255, 255, 0.7)",
    transition: "all 0.3s ease",
    "@media (max-width: 480px)": {
      fontSize: "22px",
    },
  },
  starIconFilled: {
    fontSize: "24px",
    color: "#FFD700",
    filter: "drop-shadow(0 0 4px rgba(255, 215, 0, 0.5))",
    "@media (max-width: 480px)": {
      fontSize: "22px",
    },
  },
  form: {
    marginBottom: "1.5rem",
    "@media (max-width: 480px)": {
      marginBottom: "1rem",
    },
  },
  searchContainer: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
    "@media (max-width: 480px)": {
      flexDirection: "column",
      gap: "0.8rem",
    },
  },
  input: {
    flex: 1,
    padding: "0.8rem 1rem",
    fontSize: "1rem",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.15)",
    color: "white",
    transition: "all 0.3s ease",
    outline: "none",
    "@media (max-width: 480px)": {
      padding: "0.7rem",
      fontSize: "0.9rem",
    },
  },
  searchButton: {
    padding: "0.8rem 1.5rem",
    fontSize: "1rem",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "@media (max-width: 480px)": {
      width: "100%",
      padding: "0.8rem",
    },
  },
  errorContainer: {
    textAlign: "center",
    marginBottom: "1.5rem",
    "@media (max-width: 480px)": {
      marginBottom: "1rem",
    },
  },
  errorText: {
    color: "#FFEBEE",
    marginBottom: "1rem",
    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
    fontSize: "1rem",
    "@media (max-width: 480px)": {
      fontSize: "0.9rem",
    },
  },
  retryButton: {
    padding: "0.7rem 1.3rem",
    fontSize: "0.9rem",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    margin: "0.5rem",
    "@media (max-width: 480px)": {
      padding: "0.6rem 1rem",
    },
  },
  manualSearchText: {
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: "1rem",
    fontSize: "0.9rem",
    "@media (max-width: 480px)": {
      fontSize: "0.8rem",
    },
  },
  loadingText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "1rem",
    "@media (max-width: 480px)": {
      fontSize: "0.9rem",
    },
  },
  weatherContainer: {
    textAlign: "center",
  },
  cityInfo: {
    marginBottom: "1.5rem",
    "@media (max-width: 480px)": {
      marginBottom: "1rem",
    },
  },
  cityName: {
    fontSize: "1.8rem",
    margin: "0 0 0.5rem",
    color: "white",
    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
    "@media (max-width: 480px)": {
      fontSize: "1.5rem",
    },
  },
  date: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "1rem",
    "@media (max-width: 480px)": {
      fontSize: "0.9rem",
    },
  },
  weatherMain: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5rem",
    margin: "2rem 0",
    "@media (max-width: 480px)": {
      flexDirection: "column",
      gap: "0.5rem",
      margin: "1.5rem 0",
    },
  },
  weatherIcon: {
    width: "100px",
    filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))",
    "@media (max-width: 480px)": {
      width: "80px",
    },
  },
  temperature: {
    fontSize: "3.2rem",
    fontWeight: "bold",
    color: "white",
    textShadow: "2px 2px 6px rgba(0,0,0,0.3)",
    "@media (max-width: 480px)": {
      fontSize: "2.5rem",
    },
  },
  weatherDetails: {
    display: "flex",
    justifyContent: "space-around",
    margin: "2rem 0",
    color: "white",
    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
    "@media (max-width: 480px)": {
      flexDirection: "column",
      gap: "1.5rem",
      margin: "1.5rem 0",
    },
  },
  detailItem: {
    padding: "0.5rem",
    "@media (max-width: 480px)": {
      padding: "0.3rem",
    },
  },
  detailLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: "0.5rem",
    fontSize: "1rem",
    "@media (max-width: 480px)": {
      fontSize: "0.9rem",
    },
  },
};

export default WeatherCard;
