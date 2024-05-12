import React, { useContext, useState } from "react";
import "../css/toast.css";
import { BaseUrl } from "../helper/Constant";
import LoadingSpinner from "../components/Spinner";
import logo from "../images/logo.svg";
import { useNavigate } from "react-router-dom";
import { inputValidationHandler, loginSchema } from "../helper/Validation";
import { AuthContext } from "../Contexts/AuthContext";
import { SuccessToast, ErrorToast } from "../components/Toast";

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [FormData, setFormData] = useState({ email: "", password: "" });
  const history = useNavigate();
  const authContext = useContext(AuthContext);

  const FormSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const validationError = inputValidationHandler(FormData, loginSchema);

      if (validationError) {
        throw new Error(validationError);
      } else {
        // const hashedPassword = await HashPassword(FormData.password);
        setIsLoading(true);
        const response = await fetch(`${BaseUrl}/login`, {
          method: "POST",
          body: JSON.stringify({
            email: FormData.email,
            password: FormData.password,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Invalid email or password");
        }
        SuccessToast("Login Successfully", {
          position: "top-right",
          style: { fontSize: "18px", fontWeight: "500" },
        });
        const result = await response.json();
        authContext.setUser({ user: result.data.user, token: result.token });
        history("/home", { state: { pass: result.data.password } });
      }
    } catch (e) {
      ErrorToast(e.message, {
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
                    type="password"
                    value={FormData.password}
                    onChange={(e) => HandleChange(e)}
                  />
                  <span
                    toggle="#password-field"
                    className="icon-eye-close field-icon toggle-password"
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
