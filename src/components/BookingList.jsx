import React, { useState } from "react";

const BookingList = ({ usertype, bookings}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(3);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const Others = ["BookingCategory", "MealCounts", "Notes"];
  const Employees = [
    "Employee Code",
    "Employee Name",
    "Department",
    "Meal Type",
    "Total Meals Booked",
    "Meal dates",
    "Actions",
  ];
  
  if (bookings.length === 0) {
    return (
      <div className="alert alert-info alert alert-dismissible ">
        No Bookings data available.Try again
      </div>
    );
  }
  // Render the table only when bookings is not null or undefined
  return (
    <div>
      <section className="container-fluid mt-2">
        <table className="table table-responsive dataTable nowrap table-hover">
          <thead className="bg-light">
            <tr>
              {usertype === "Employee"
                ? Employees.map((head, index) => <th key={index}>{head}</th>)
                : Others.map((head, index) => <th key={index}>{head}</th>)}
            </tr>
          </thead>
          <tbody>
            {bookings
              .slice(
                (currentPage - 1) * bookingsPerPage,
                currentPage * bookingsPerPage
              )
              .map((booking, index) => (
                <tr key={index}>
                  {usertype === "Employee" ? (
                    <>
                      <td>{booking.EmployeeDetails[0].emp_code}</td>
                      <td>{booking.EmployeeDetails[0].emp_name}</td>
                      <td>{booking.EmployeeDetails[0].dept_name}</td>
                      <td>{booking.BookingCategory}</td>
                      <td>{booking.MealCounts}</td>
                      <td>{booking.mealDates}</td>
                    </>
                  ) : (
                    <>
                      {Others.map((field, index) => (
                        <td key={index}>{booking[field]}</td>
                      ))}
                    </>
                  )}
                  <td>
                    <i className="bi bi-trash"></i>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <ul className="pagination">
        {Array.from({
          length: Math.ceil(bookings.length / bookingsPerPage),
        }).map((_, index) => (
          <li
            key={index}
            className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
          >
            <button onClick={() => paginate(index + 1)} className="page-link">
              {index + 1}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookingList;
