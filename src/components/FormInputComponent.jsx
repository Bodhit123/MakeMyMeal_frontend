import React from "react";

const FormInput = ({ name, label, value, onChange, ...rest }) => {
  return (
    <div className="form-group">
      <label className="control-label">{label}</label>
      <div className="input-addon">
        <input
          name={name}
          className="form-control"
          type="text"
          value={value}
          onChange={onChange}
          {...rest}
        />
        {
          name !== "password" ? (
            <div className="icon-after icon-green">
              <i className="icon-check"></i>
            </div>
          ) : (
            <span
              toggle="#password-field"
              className="icon-eye-close field-icon toggle-password"
            ></span>
          )
        }
      </div>
    </div>
  );
};

export default FormInput;
