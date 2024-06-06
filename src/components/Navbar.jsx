/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../Contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import logo from "../images/logo-white.svg";
import { successToast, errorToast } from "../components/Toast";
import { BaseUrl } from "../helper/Constant";
import axios from "axios";


const Navbar = () => {
  const location = useLocation();
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // State to track if navbar is collapsed
  const dropdownRef = useRef(null);
  const signOut = useContext(AuthContext).signOut;
  
  const [formData, setFormData] = useState({
    old_password: "",
    password: "",
    password_confirmation: "",
  });
  const token = useContext(AuthContext).authData?.token;
  function resetForm() {
    setFormData({
      old_password: "",
      password: "",
      password_confirmation: "",
    });
  }
  
  function onChangeHandler (e) {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BaseUrl}/change/password`,
        formData,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = response.data;
      console.log(result);
      successToast("Password changed Successfully", {
        position: "top-right",
        style: { fontSize: "16px", fontWeight: "500" },
      });
      resetForm();
      setPasswordModalOpen(false);
    } catch (error) {
      errorToast(
        error.response?.data.message.description || "Failed to submit form",
        { position: "top-right" }
      );
    }
  };
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

  const getActiveClass = (path) => {
    return location.pathname === path ? "active" : "";
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
              className={`nav-link ${getActiveClass("/calender")}`}
              aria-current="page"
              to="/calender"
            >
              DashBoard
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link ${getActiveClass("/home")}`}
              to="/home"
            >
              Booking List
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link ${getActiveClass("/settings")}`}
              to="/settings"
            >
              Calendar
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
                      onClick = {()=>setPasswordModalOpen(true)}
                    >
                      Change Password
                    </Link>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={() => {
                        successToast("Logout Successfully", {
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
       {/* <!-- Change Password Modal Start --> */}
       {isPasswordModalOpen && (
        <div
          className="modal show fade d-block"
          id="changepwdModal"
          aria-labelledby="exampleModalLabel"
          aria-hidden={!isPasswordModalOpen}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Change Password
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    setPasswordModalOpen(false);
                    resetForm();
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="form-group">
                    <label htmlFor="old_password">
                      Old Password<span className="extric">*</span>
                    </label>
                    <input
                      type="text"
                      onChange={(e)=>onChangeHandler(e)}
                      value={formData.old_password}
                      className="form-control"
                      id="old_password"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">
                      New Password<span className="extric">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      className="form-control"
                      onChange={(e)=>onChangeHandler(e)}
                      id="password"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password_confirmation">
                      Confirm Password<span className="extric">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password_confirmation}
                      onChange={(e)=>onChangeHandler(e)}
                      className="form-control"
                      id="password_confirmation"
                    />
                    {/* <div className="error-block">Error display here</div> */}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={() => {
                    setPasswordModalOpen(false);
                    resetForm();
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => handleSubmit(e)}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* <!-- End Change Password Modal--> */}
    </div>
  );
};

export default Navbar;
