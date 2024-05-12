import React, { useState } from "react";

function DropdownButton(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const handleSelectRole = (role, e) => {
    setSelectedRole(role);
    setIsOpen(false); // Close the dropdown after selecting a role
    e.preventDefault();
    props.changeRole(role); // Update the role in the parent component
  };

  return (
    <div className="form-group dropdown">
      <label className="control-label"></label>
      <div className="btn-container mt-0 d-flex flex-column align-items-center justify-content-center ">
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded={isOpen ? "true" : "false"}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedRole || "Select Role"}
        </button>
        <div
          className={`dropdown-menu${isOpen ? " show" : ""}`}
          aria-labelledby="dropdownMenuButton"
        >
          <button
            className="dropdown-item"
            onClick={(e) => handleSelectRole("admin", e)}
          >
            Admin
          </button>
          <button
            className="dropdown-item"
            onClick={(e) => handleSelectRole("employee", e)}
          >
            Employee
          </button>
        </div>
      </div>
    </div>
  );
}

export default DropdownButton;
