import React, { useState } from "react";
import { BaseUrl } from "../helper/Constant";
import FormInput from "../components/FormInputComponent";
import { Link } from "react-router-dom";
import { inputValidationHandler, signupSchema } from "../helper/Validation";
import DropdownButton from "../components/Dropdown";
import { toast } from "react-toastify";

function AddUser() {
  const [FormData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    mobile: "",
    role: "", 
  });
  // const [error, setError] = useState("");
  // const [validationError, setValidationError] = useState("");

  const FormSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const validationError = inputValidationHandler(FormData, signupSchema);

      if (validationError) {
        // setValidationError(validationError);
        toast.error(validationError, {
          className: "toast-container",
          position: "top-center",
          theme: "light",
        });
      } else {
        const response = await fetch(`${BaseUrl}/signup`, {
          method: "POST",
          body: JSON.stringify(FormData),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(response.message);
        }

        toast(`🦄 SignUp Successful`, {
          className: "toast-container",
          position: "top-center",
          theme: "light",
        });
        const data = await response.json();
        console.log(data);
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  const HandleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  // Update the role in FormData state
  const handleRoleChange = (role) => {
    setFormData((prev) => {
      return { ...prev, role };
    });
  };

  return (
    <div className="Wrapper">
      <section className="login-content">
        <div className="login-content-lt"></div>
        <div className="login-content-rt">
          <div className="login-box mt-1">
            <form className="login-form" onSubmit={FormSubmitHandler}>
              <h3 className="login-head">Create new Account</h3>
              <FormInput
                name="firstname"
                label="First Name"
                className="form-control"
                type="text"
                value={FormData.firstname}
                onChange={HandleChange}
                autoFocus
              />

              <FormInput
                name="lastname"
                label="Last Name"
                className="form-control"
                type="text"
                value={FormData.lastname}
                onChange={HandleChange}
              />

              <FormInput
                name="email"
                label="Email"
                value={FormData.email}
                onChange={HandleChange}
                type="email"
                placeholder=""
              />
              <FormInput
                name="mobile"
                label="Mobile"
                value={FormData.mobile}
                onChange={HandleChange}
                type="password"
              />

              {/* Pass the role state and the function to update it */}
              <DropdownButton
                selectedRole={FormData.role}
                changeRole={handleRoleChange}
              />

              {/* <div className="error-block">
                <div className="error-message">
                  {validationError ? validationError : error}
                </div>
              </div> */}

              <div className="form-group btn-container m-2">
                <button type="submit" className="btn btn-lg btn-primary">
                  Register
                </button>
              </div>

              <div className="form-group text-center">
                <label className="control-label">
                  <p className="form-link">
                    Already have an account?&nbsp;
                    <Link className="custom-link" to="/">
                      Sign in
                    </Link>
                  </p>
                </label>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AddUser;
