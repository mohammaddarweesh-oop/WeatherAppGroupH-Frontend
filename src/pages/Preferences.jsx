import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiSave, FiPlus } from "react-icons/fi";

function Preferences() {
  const [city, setCity] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");

  const navigate = useNavigate();
  const editContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        editContainerRef.current &&
        !editContainerRef.current.contains(event.target) &&
        !event.target.closest("button")
      ) {
        cancelEdit();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://weatherappgrouph.onrender.com/api/preferences",
        { withCredentials: true }
      );
      setFavorites(response.data);
    } catch (err) {
      setError("فشل في جلب المدن المفضلة");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!city.trim()) {
      setError("الرجاء إدخال اسم المدينة.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "https://weatherappgrouph.onrender.com/api/preferences",
        { city },
        { withCredentials: true }
      );
      setFavorites([...favorites, response.data]);
      setCity("");
      setSuccessMessage("تمت إضافة المدينة إلى المفضلة!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("فشل في إضافة المدينة المفضلة");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (favorite) => {
    setEditingId(favorite._id);
    setEditingValue(favorite.city);
    setOriginalValue(favorite.city);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
    setOriginalValue("");
  };

  const handleEditFavorite = async (cityId, e) => {
    e?.stopPropagation();
    if (!editingValue.trim()) {
      setError("الرجاء إدخال اسم المدينة.");
      return;
    }

    try {
      await axios.put(
        `https://weatherappgrouph.onrender.com/api/preferences/${cityId}`,
        { newCity: editingValue },
        { withCredentials: true }
      );

      setFavorites(
        favorites.map((item) =>
          item._id === cityId ? { ...item, city: editingValue } : item
        )
      );

      cancelEdit();
      setSuccessMessage("تم تحديث المدينة بنجاح!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setError("فشل في تحديث المدينة المفضلة");
    }
  };

  const handleDeleteFavorite = async (id, e) => {
    e.stopPropagation();
    setLoading(true);
    setError("");
    try {
      await axios.delete(
        `https://weatherappgrouph.onrender.com/api/preferences/${id}`,
        { withCredentials: true }
      );
      setFavorites(favorites.filter((favorite) => favorite._id !== id));
      setSuccessMessage("تم حذف المدينة بنجاح.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("فشل في حذف المدينة.");
    } finally {
      setLoading(false);
    }
  };

  const handleCityClick = (cityName) => {
    if (!editingId) {
      navigate(`/weather?city=${cityName}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>المدن المفضلة</h2>

        {successMessage && <div style={styles.success}>{successMessage}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <ul style={styles.list}>
          {favorites.map((favorite) => (
            <li
              key={favorite._id}
              style={styles.cityItem}
              onClick={() => handleCityClick(favorite.city)}
            >
              {editingId === favorite._id ? (
                <div
                  ref={editContainerRef}
                  style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    style={styles.editInput}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === "Enter")
                        handleEditFavorite(favorite._id, e);
                    }}
                  />
                  <button
                    onClick={(e) => handleEditFavorite(favorite._id, e)}
                    style={styles.saveButton}
                    disabled={
                      !editingValue.trim() ||
                      editingValue.trim() === originalValue
                    }
                  >
                    <FiSave style={styles.icon} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelEdit();
                    }}
                    style={styles.cancelButton}
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <span style={styles.cityText}>{favorite.city}</span>
              )}

              {!editingId && (
                <div style={styles.actionButtons}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(favorite);
                    }}
                    style={styles.editButton}
                  >
                    <FiEdit style={styles.icon} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteFavorite(favorite._id, e)}
                    style={styles.deleteButton}
                  >
                    <FiTrash2 style={styles.icon} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {favorites.length === 0 && !loading && (
          <p style={styles.noFavorites}>لا توجد مدن مفضلة حتى الآن</p>
        )}

        {loading && favorites.length === 0 && (
          <div style={styles.loading}>جاري التحميل...</div>
        )}

        <div style={styles.addSection}>
          <input
            type="text"
            placeholder="أضف مدينة جديدة"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          <button
            onClick={handleAddFavorite}
            style={styles.addButton}
            disabled={loading || !city.trim()}
          >
            <FiPlus style={styles.icon} />
            {loading ? "جاري الإضافة..." : "إضافة مدينة"}
          </button>
        </div>
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
    padding: "1rem",
  },
  card: {
    width: "100%",
    maxWidth: "600px",
    padding: "2rem",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  title: {
    textAlign: "center",
    color: "white",
    fontSize: "1.8rem",
    marginBottom: "1.5rem",
    fontWeight: "600",
  },
  success: {
    backgroundColor: "rgba(46, 125, 50, 0.2)",
    color: "#a5d6a7",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    textAlign: "center",
    border: "1px solid rgba(76, 175, 80, 0.3)",
  },
  error: {
    backgroundColor: "rgba(211, 47, 47, 0.2)",
    color: "#ef9a9a",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    textAlign: "center",
    border: "1px solid rgba(244, 67, 54, 0.3)",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: "1.5rem 0",
    maxHeight: "400px",
    overflowY: "auto",
  },
  cityItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem",
    margin: "0.5rem 0",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    cursor: "pointer",
    ":hover": {
      background: "rgba(255, 255, 255, 0.1)",
    },
  },
  cityText: {
    color: "white",
    fontSize: "1rem",
    flex: 1,
  },
  editInput: {
    flex: 1,
    padding: "0.5rem",
    fontSize: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "4px",
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    outline: "none",
    marginRight: "0.5rem",
  },
  actionButtons: {
    display: "flex",
    gap: "0.5rem",
    marginLeft: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    outline: "none",
    marginBottom: "1rem",
    "::placeholder": {
      color: "rgba(255, 255, 255, 0.5)",
    },
  },
  addButton: {
    width: "100%",
    padding: "0.75rem",
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      background: "rgba(255, 255, 255, 0.2)",
    },
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  editButton: {
    background: "transparent",
    border: "1px solid rgba(255, 193, 7, 0.3)",
    borderRadius: "4px",
    padding: "0.5rem",
    display: "flex",
    alignItems: "center",
    color: "#ffc107",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      background: "rgba(255, 193, 7, 0.1)",
    },
  },
  saveButton: {
    background: "transparent",
    border: "1px solid rgba(255, 193, 7, 0.3)",
    borderRadius: "4px",
    padding: "0.5rem",
    display: "flex",
    alignItems: "center",
    color: "#4caf50",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      background: "rgba(76, 175, 80, 0.1)",
    },
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  cancelButton: {
    background: "transparent",
    border: "1px solid rgba(158, 158, 158, 0.3)",
    borderRadius: "4px",
    padding: "0.5rem",
    color: "#9e9e9e",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      background: "rgba(158, 158, 158, 0.1)",
    },
    fontSize: "0.8rem",
  },
  deleteButton: {
    background: "transparent",
    border: "1px solid rgba(244, 67, 54, 0.3)",
    borderRadius: "4px",
    padding: "0.5rem",
    display: "flex",
    alignItems: "center",
    color: "#f44336",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      background: "rgba(244, 67, 54, 0.1)",
    },
  },
  icon: {
    fontSize: "1rem",
  },
  addSection: {
    marginTop: "1.5rem",
  },
  noFavorites: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.5)",
    padding: "2rem 0",
  },
  loading: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.7)",
    padding: "2rem 0",
  },
};

export default Preferences;
