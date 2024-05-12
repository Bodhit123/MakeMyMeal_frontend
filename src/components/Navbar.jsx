/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../Contexts/AuthContext";
import { Link } from "react-router-dom";
import logo from "../images/logo-white.svg";
import { SuccessToast } from "../components/Toast";

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // State to track if navbar is collapsed
  const dropdownRef = useRef(null);
  const signOut = useContext(AuthContext).signOut;

  useEffect(() => {
    function handleClickOutside(event) {
      if (!dropdownRef.current || !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed); // Toggle the collapsed state
  };

  return (
    <div className="container head">
      <a href="#" className="navbar-brand">
        <div className="logoW-wrapper">
          <img src={logo} alt="Rishabh Software" />
          <span>Meal Facility</span>
        </div>
      </a>
      <button
        className="navbar-toggler"
        type="button"
        onClick={handleToggleCollapse} // Handle toggle when the button is clicked
        aria-expanded={!isCollapsed ? "true" : "false"}
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div
        className={`collapse navbar-collapse ${!isCollapsed ? "show" : ""}`} // Add 'show' class if not collapsed
      >
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link
              className="nav-link active"
              aria-current="page"
              to="/calender"
            >
              Calendar
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/home">
              Booking List
            </Link>
          </li>
        </ul>
        <div className="h-100 d-lg-inline-flex align-items-center">
          <ul className="app-nav">
            {/* Notification Menu */}
            <li className="dropdown">
              <a
                className="app-nav__item notification-num"
                href="#"
                data-toggle="dropdown"
                aria-label="Show notifications"
              >
                <i className="icon-bell"></i>
                <span className="num">5</span>
              </a>
            </li>
            {/* User Menu */}
            <li className="dropdown" ref={dropdownRef}>
              <a
                className="app-nav__item dropdown-toggle"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-label="Open Profile Menu"
                onClick={() => setUserMenuOpen((prev) => !prev)}
              >
                Admin
              </a>
              {userMenuOpen && (
                <ul
                  className={`dropdown-menu settings-menu ${
                    isCollapsed ? "dropdown-menu-right" : "dropdown-menu-left"
                  } d-block`}
                >
                  <li>
                    <Link
                      className="dropdown-item"
                      data-toggle="modal"
                      data-target="#changepwdModal"
                    >
                      Change Password
                    </Link>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={() => {
                        SuccessToast("Logout Successfully", {
                          position: "top-right",
                          autoClose: 2000,
                        });
                        signOut();
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
