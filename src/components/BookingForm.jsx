import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext";
import flatpickr from "flatpickr";
import { BaseUrl } from "../helper/Constant";
import rangePlugin from "flatpickr/dist/plugins/rangePlugin";
import { countValidDates, HolidaysAndWeekends } from "../helper/Holidays";
import Swal from "sweetalert2";

export function BookingForm({ IsModelOpen, setModalOpen }) {
  const [employeeData, setEmployeeData] = useState(
    JSON.parse(localStorage.getItem("employees")) ?? []
  );
  const [selectAllEmployees, setSelectAllEmployees] = useState(false);
  const { authData } = useContext(AuthContext);
  const token = authData ? authData.token : null;
  const [formData, setFormData] = useState({
    BookingPerson: { Employee: true, Rise: false, Others: false },
    BookingCategory: { Lunch: true, Dinner: false },
    isWeekend: false,
    Dates: {
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    },
    Department: "",
    Notes: "",
    MealCount: 0,
    Employees: [],
  });

  console.log(employeeData);

  const handleSelectAllEmployees = (e) => {
    const { checked } = e.target;
    setSelectAllEmployees(checked);

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        Employees: [...employeeData.map((emp) => emp._id)], // Add all employee objects to the array
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        Employees: [],
      }));
    }
  };

  const onChangeHandler = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "employee") {
        const selectedEmployee = employeeData.find(
          (employee) => employee._id === value
        );

        if (checked) {
          setFormData((prev) => ({
            ...prev,
            Employees: [...prev.Employees, selectedEmployee._id],
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            Employees: prev.Employees.filter((id) => id !== value),
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
    } else if (type === "radio") {
      setFormData((prev) => ({
        ...prev,
        [name]: {
          ...Object.keys(prev[name]).reduce((acc, key) => {
            acc[key] = key === value;
            return acc;
          }, {}),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    setModalOpen(false);
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Your work has been saved",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  useEffect(() => {
    const flatpickrInstance = flatpickr("#demoDate", {
      plugins: [new rangePlugin({ input: "#endDate" })],
      minDate: "today",
      mode: "range",
      dateFormat: "Y-m-d", // Set the date display format
      onChange: (selectedDates, dateStr, instance) => {
        const start = new Date(dateStr);
        const formattedStartDate = start.toISOString();
        const end = new Date(selectedDates[1]);
        const formattedEndDate = start.toISOString();
        //only give values if disableDates property passed to flatPickerInstance
        // const disabledDates = instance.config.disable;

        // Get the count of valid dates after removing disabled dates
        const validCount = countValidDates(start, end, HolidaysAndWeekends);

        // Update the form data with the new selected dates and count
        setFormData((prev) => ({
          ...prev,
          Dates: {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            validDays: validCount,
          },
        }));
      },
    });

    return () => {
      flatpickrInstance.destroy();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchEmployee = async (searchQuery) => {
        try {
          const response = await fetch(
            `${BaseUrl}/employee/?searchQuery=${searchQuery}&limit=4`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch employee data");
          }

          const result = await response.json();
          setEmployeeData(result.data);
          localStorage.setItem("employees", JSON.stringify(result.data));
        } catch (error) {
          console.error("Error fetching employee data:", error);
        }
      };

      fetchEmployee(formData.Department);
    }, 1000);

    return () => {
      clearTimeout(timer);
      localStorage.removeItem("employees");
    };
  }, [formData.Department, token]);
  console.log(formData);
  return (
    <div>
      <div
        className="modal show fade d-block"
        id="addBookingModal"
        aria-labelledby="exampleModalLabel"
        aria-hidden={!IsModelOpen}
      >
        <div
          className="modal-dialog modal-md modal-dialog-scrollable h-100"
          role="document"
        >
          <div className="modal-content modal-fullscreen-sm-down">
            <div className="modal-header">
              <h2 className="modal-title" id="exampleModalLabel">
                Book a Meal
              </h2>
              <button
                type="button"
                className="btn-close"
                id="buttonClose"
                data-dismiss="modal"
                aria-label="Close"
                onClick={() => setModalOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="form-group custom-radio">
                <label>Select Category</label>
                <div className="d-flex align-content-center justify-content-start">
                  {Object.entries(formData.BookingPerson).map(
                    ([key, value]) => (
                      <div className="radio-block" key={key}>
                        <input
                          type="radio"
                          id={key}
                          name="BookingPerson"
                          value={key}
                          checked={value}
                          onChange={(e) => onChangeHandler(e)}
                        />
                        <label htmlFor={key} className="mr-0">
                          {key}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="form-group custom-radio">
                <label>Select Category</label>
                <div className="d-flex align-content-center justify-content-start">
                  {Object.entries(formData.BookingCategory).map(
                    ([key, value]) => (
                      <div className="radio-block" key={key}>
                        <input
                          type="radio"
                          id={key}
                          name="BookingCategory"
                          value={key}
                          checked={value}
                          onChange={(e) => onChangeHandler(e)}
                        />
                        <label htmlFor={key} className="mr-0">
                          {key}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="form-group mb-30">
                <label className="custom-checkbox mb-0">
                  <span className="checkbox__title">Weekend</span>
                  <input
                    className="checkbox__input"
                    type="checkbox"
                    id="weekendCheckbox"
                    name="isWeekend"
                    checked={formData.isWeekend}
                    onChange={(e) => onChangeHandler(e)}
                  />
                  <span className="checkbox__checkmark"></span>
                </label>
              </div>
              <div className="form-group">
                <label>Select Date (s)</label>
                <div className="input-group date-picker-input">
                  <input
                    type="text"
                    className="form-control border-right-0"
                    placeholder="Start Date"
                    id="demoDate"
                  />
                  <input
                    type="text"
                    className="form-control border-right-0"
                    placeholder="End Date"
                    id="endDate"
                  />
                  <div className="input-group-append bg-transparent">
                    <span
                      className="input-group-text bg-transparent"
                      id="basic-addon2"
                    >
                      <i className="icon-calendar"></i>
                    </span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Select Account</label>
                <div className="search-wrapper">
                  <input
                    type="text"
                    name="Department"
                    className="form-control"
                    placeholder="Search Department.."
                    value={formData.Department}
                    onChange={(e) => onChangeHandler(e)}
                  />
                  <i className="icon-search search-icon"></i>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Type here.."
                  name="Notes"
                  value={formData.Notes}
                  onChange={(e) => onChangeHandler(e)}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Booking Count</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="100"
                  name="MealCount"
                  value={formData.MealCount || 1}
                  onChange={(e) => onChangeHandler(e)}
                />
              </div>
              <div className="form-group">
                <label className="mb-1">Select Employees</label>
              </div>
              <div className="table-responsive">
                <table className="table table-hover responsive nowrap table-bordered">
                  <thead>
                    <tr>
                      <th>
                        <div className="form-group mb-0">
                          <label className="custom-checkbox">
                            <input
                              className="checkbox__input"
                              type="checkbox"
                              checked={selectAllEmployees}
                              onChange={(e) => handleSelectAllEmployees(e)}
                            />
                            <span className="checkbox__checkmark"></span>
                          </label>
                        </div>
                      </th>
                      <th>Employee ID</th>
                      <th>Employee Name</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeData.map((employee, index) => (
                      <tr key={index}>
                        <td>
                          <div className="form-group mb-0">
                            <label className="custom-checkbox m-0">
                              <input
                                className="checkbox__input"
                                type="checkbox"
                                name="employee"
                                value={employee._id}
                                checked={
                                  selectAllEmployees ||
                                  formData.Employees.some(
                                    (id) => id === employee._id
                                  )
                                }
                                onChange={(e) => onChangeHandler(e)}
                              />
                              <span className="checkbox__checkmark"></span>
                            </label>
                          </div>
                        </td>
                        <td>{employee.emp_code}</td>
                        <td>{employee.emp_name}</td>
                        <td>{employee.dept_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => formSubmitHandler(e)}
                className="btn btn-primary"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingForm;
