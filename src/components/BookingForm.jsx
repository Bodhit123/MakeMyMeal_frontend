import axios from "axios";
import moment from "moment";
import flatpickr from "flatpickr";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { addBooking } from "../app/bookingSlice";
import { BaseUrl } from "../helper/Constant";
import rangePlugin from "flatpickr/dist/plugins/rangePlugin";
import { successToast, errorToast } from "../components/Toast";
import { startOfWeekend } from "../helper/Holidays";
import { selectDisabledDates } from "../app/disabledSlice";

export function BookingForm({ IsModelOpen, setModalOpen }) {
  const dispatch = useDispatch();
  const fetchDates = useSelector(selectDisabledDates).map((doc) => ({
    from: moment(doc.Dates.from).format("YYYY-MM-DD"),
    to: moment(doc.Dates.to).format("YYYY-MM-DD"),
  }));
  const [employeeData, setEmployeeData] = useState(
    JSON.parse(localStorage.getItem("employees")) ?? []
  );
  const [disableDates] = useState(fetchDates);
  const [selectAllEmployees, setSelectAllEmployees] = useState(false);
  const token = useContext(AuthContext).authData?.token;
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
    MealCounts: 1,
    Employees: [],
  });

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
    setModalOpen(false);
    e.preventDefault();
    try {
      const { BookingPerson, BookingCategory, Department, ...rest } = formData;
      const bookingPersonKey = Object.entries(BookingPerson).find(
        ([key, value]) => value === true
      )?.[0];
      const bookingCategoryKey = Object.entries(BookingCategory).find(
        ([key, value]) => value === true
      )?.[0];

      const result = await axios.post(
        `${BaseUrl}/booking`,
        {
          BookingPerson: bookingPersonKey,
          BookingCategory: bookingCategoryKey,
          ...rest,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = result.data;
      successToast("Booking Done Successfully", {
        position: "top-right",
        style: { fontSize: "16px", fontWeight: "500" },
      });
      dispatch(
        addBooking({ type: data.BookingPerson, count: data.TotalMeals })
      );
    } catch (error) {
      console.error("Error submitting form:", error);
      errorToast(
        error.response?.data.message.description || "Failed to submit form",
        {
          position: "top-right",
        }
      );
    } finally {
      console.log("done");
    }
  };

  // flatPicker date range selection is done here
  useEffect(() => {
    const flatpickrInstance = flatpickr("#demoDate", {
      plugins: [new rangePlugin({ input: "#endDate" })],
      disable: [...disableDates, startOfWeekend],
      minDate: "today",
      altInput: true,
      altFormat: "F j, Y",
      mode: "range",
      dateFormat: "Y-m-d", // Set the date display format
      onChange: (selectedDates, dateStr, instance) => {
        const start = new Date(selectedDates[0]);
        const end = new Date(selectedDates[1]);
        //only give values if disableDates property passed to flatPickerInstance
        const Dates = instance.config.disable;
        console.log(Dates);

        // Update the form data with the new selected dates and count
        setFormData((prev) => ({
          ...prev,
          Dates: {
            startDate: start,
            endDate: end,
          },
        }));
      },
    });

    return () => {
      flatpickrInstance.destroy();
    };
  }, [disableDates]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(
          `${BaseUrl}/employee/?searchQuery=${formData.Department}&limit=4`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = response.data;
        setEmployeeData(result.data);
        localStorage.setItem("employees", JSON.stringify(result.data));
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      localStorage.removeItem("employees");
    };
  }, [formData.Department, token]);

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
            <form className="modal-body">
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
              {/* <DateRangePicker
                   id="demo"
                    disableDates = {disableDates}
                    setData={setFormData}
                    // Customize other props as needed (e.g., disableDates, minDate)
                  /> */}
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
                  name="MealCounts"
                  placeholder=""
                  value={formData.MealCounts}
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
            </form>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
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
