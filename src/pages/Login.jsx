import React, { useContext, useState } from "react";
import "../css/toast.css";
import LoadingSpinner from "../components/Spinner";
import logo from "../images/logo.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { inputValidationHandler, loginSchema } from "../helper/Validation";
import { AuthContext } from "../Contexts/AuthContext";
import { successToast, errorToast } from "../components/Toast";
import axios from "./../api/axios";

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [FormData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const authContext = useContext(AuthContext);
  const location = useLocation();
  const from = location.state?.from?.pathname || "/home";

  const FormSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const validationError = inputValidationHandler(FormData, loginSchema);

      if (validationError) {
        throw new Error(validationError);
      } else {
        setIsLoading(true);

        const response = await axios.post(
          `/login`,
          {
            email: FormData.email,
            password: FormData.password,
          },

          {
            withCredentials: true,
          }
        );

        if (response.status !== 200) {
          console.log(response.data.message.description);
          throw new Error(response.data.message.description);
        }

        successToast("Login Successfully", {
          position: "top-right",
          style: { fontSize: "18px", fontWeight: "500" },
        });

        const result = response.data;
        authContext.setUser({
          user: result.data.foundUser,
          token: result.token,
        });
        navigate(from);
      }
    } catch (e) {
      errorToast(e.message, {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const HandleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <div className="Wrapper">
      <section className="login-content">
        <div className="login-content-lt"></div>
        <div className="login-content-rt">
          <div className="login-box">
            <form className="login-form" onSubmit={FormSubmitHandler}>
              <div className="logo-wrapper">
                <img src={logo} alt="Rishabh Software" />
                <span>Meal Facility</span>
              </div>
              <h3 className="login-head">Sign in to your account</h3>
              <p className="login-text">
                Enter your credentials to access your account.
              </p>
              <div className="form-group">
                <label className="control-label">Email</label>
                <div className="input-addon">
                  <input
                    className="form-control"
                    name="email"
                    value={FormData.email}
                    onChange={(e) => HandleChange(e)}
                    type="email"
                    placeholder="harry@gmail.com"
                    autoFocus
                  />
                  <div className="icon-after icon-green">
                    <i className="icon-check"></i>
                  </div>
                </div>
                {/* <div className="error-block">
                  <div className="error-message">
                    {validationError ? validationError : error}
                  </div>
                </div> */}
              </div>
              {isLoading ? (
                <div className="loading-container">
                  <LoadingSpinner />
                </div>
              ) : (
                <div>{/* your jsx component here */}</div>
              )}
              <div className="form-group">
                <label className="control-label">Password</label>
                <div className="input-addon">
                  <input
                    id="password-field"
                    name="password"
                    className="form-control"
                    type={isPasswordVisible ? "text" : "password"}
                    value={FormData.password}
                    onChange={(e) => HandleChange(e)}
                  />
                  <span
                    onClick={togglePasswordVisibility}
                    className={`field-icon toggle-password ${
                      isPasswordVisible ? "icon-eye-open" : "icon-eye-close"
                    }`}
                  ></span>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <div className="form-group mb-0">
                  <label className="custom-checkbox mb-0">
                    <span className="checkbox__title">Remember Me</span>
                    <input className="checkbox__input" type="checkbox" />
                    <span className="checkbox__checkmark"></span>
                  </label>
                </div>
                <div className="form-group mb-0">
                  <div className="utility">
                    <p>Forgot Password?</p>
                  </div>
                </div>
              </div>

              <div className="form-group btn-container">
                <button type="submit" className="btn btn-xl btn-primary">
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
