// import React from "react";
// import { Link } from "react-router-dom";

// const Navbar = ({ isAuthenticated, onLogout }) => {
//   return (
//     <nav style={styles.navbar}>
//       <div style={styles.container}>
//         <Link to="/" style={styles.logo}>
//           WeatherApp
//         </Link>

//         <div style={styles.links}>
//           {isAuthenticated && (
//             <>
//               <Link to="/weather" style={styles.link}>
//                 الطقس
//               </Link>
//               <Link to="/preferences" style={styles.link}>
//                 المفضلة
//               </Link>
//               <button onClick={onLogout} style={styles.logoutButton}>
//                 تسجيل الخروج
//               </button>
//             </>
//           )}

//           {!isAuthenticated && (
//             <Link to="/" style={styles.link}>
//               تسجيل الدخول
//             </Link>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// const styles = {
//   navbar: {
//     background: "#2196F3",
//     padding: "1rem 2rem",
//     boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//   },
//   container: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     maxWidth: "1200px",
//     margin: "0 auto",
//   },
//   logo: {
//     color: "white",
//     fontSize: "1.5rem",
//     textDecoration: "none",
//     fontWeight: "bold",
//   },
//   links: {
//     display: "flex",
//     gap: "2rem",
//     alignItems: "center",
//   },
//   link: {
//     color: "white",
//     textDecoration: "none",
//     fontSize: "1.1rem",
//     ":hover": {
//       textDecoration: "underline",
//     },
//   },
//   logoutButton: {
//     background: "transparent",
//     border: "none",
//     color: "white",
//     cursor: "pointer",
//     fontSize: "1.1rem",
//     ":hover": {
//       textDecoration: "underline",
//     },
//   },
// };

// export default Navbar;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // الكشف عن حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const renderLinks = (closeMenu) => {
    return (
      <>
        {isAuthenticated && (
          <>
            <Link to="/weather" style={styles.link} onClick={closeMenu}>
              الطقس
            </Link>
            <Link to="/preferences" style={styles.link} onClick={closeMenu}>
              المفضلة
            </Link>
            <button
              onClick={() => {
                onLogout();
                closeMenu();
              }}
              style={styles.logoutButton}
            >
              تسجيل الخروج
            </button>
          </>
        )}
        {!isAuthenticated && (
          <Link to="/" style={styles.link} onClick={closeMenu}>
            تسجيل الدخول
          </Link>
        )}
      </>
    );
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          WeatherApp
        </Link>

        {isMobile ? (
          <>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={styles.hamburger}
              aria-label="فتح القائمة"
            >
              <div style={styles.hamburgerBar} />
              <div style={styles.hamburgerBar} />
              <div style={styles.hamburgerBar} />
            </button>
            {isMenuOpen && (
              <div style={styles.mobileMenu}>
                {renderLinks(() => setIsMenuOpen(false))}
              </div>
            )}
          </>
        ) : (
          <div style={styles.links}>{renderLinks(() => {})}</div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    background: "#2196F3",
    padding: "1rem 2rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    position: "relative",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  logo: {
    color: "white",
    fontSize: "1.5rem",
    textDecoration: "none",
    fontWeight: "bold",
  },
  links: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
    "@media (max-width: 768px)": {
      display: "none",
    },
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "1.1rem",
    padding: "0.5rem 1rem",
    ":hover": {
      textDecoration: "underline",
    },
  },
  logoutButton: {
    background: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: "1.1rem",
    padding: "0.5rem 1rem",
    ":hover": {
      textDecoration: "underline",
    },
  },
  hamburger: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    outline: "none",
  },
  hamburgerBar: {
    width: "24px",
    height: "3px",
    backgroundColor: "white",
    borderRadius: "2px",
    transition: "all 0.3s ease",
  },
  mobileMenu: {
    position: "absolute",
    top: "100%",
    right: "0",
    left: "0",
    backgroundColor: "#2196F3",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    zIndex: 1000,
  },
};

export default Navbar;
