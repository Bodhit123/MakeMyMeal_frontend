import axios from "axios";
import { BaseUrl } from "../helper/Constant";
import React, { useState, useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { extendMoment } from "moment-range";
import { errorToast, successToast } from "./Toast";
import { deleteBooking } from "../app/bookingSlice";

const BookingList = ({ bookings, usertype, setBookings }) => {
  const moment = require("moment");
  const dispatch = useDispatch();
  const momentRange = extendMoment(moment);
  const token = useContext(AuthContext).authData?.token;
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(3);
  const Others = [
    "BookingCategory",
    "Meal Counts",
    "Notes",
    "Meal Dates",
    "Actions",
  ];
  const Employees = [
    "Employee Code",
    "Employee Name",
    "Department",
    "Meal Type",
    "Total Meals Booked",
    "Meal Dates",
    "Actions",
  ];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  console.log(bookings);
  const deleteBookingHandler = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Your booking has been deleted.",
          icon: "success",
        });
        deleteApi(id);
      }
    });
  };

  const deleteApi = async (id) => {
    try {
      const result = await axios.delete(`${BaseUrl}/booking/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = result.data;
      successToast("Booking Deleted Successfully", {
        position: "top-right",
        style: { fontSize: "16px", fontWeight: "500" },
      });
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== id)
      );
      dispatch(
        deleteBooking({ type: data.BookingPerson, count: data.TotalMeals })
      );
    } catch (error) {
      console.error("Error deleting booking:", error);
      errorToast(
        error.response?.data.message.description || "Failed to delete booking ",
        {
          position: "top-right",
        }
      );
    }
  };

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
              .map((booking, index) => {
                const { startDate, endDate } = booking.Dates;
                const monthRange = momentRange.range(
                  moment(startDate).startOf("month"),
                  moment(startDate).endOf("month")
                );
                // console.log( monthRange.start.format("YYYY-MM-DD"))
                // console.log( monthRange.end.format("YYYY-MM-DD"))
                let bookingRange;
                if (
                  monthRange.contains(moment(endDate), {
                    excludeEnd: false,
                    excludeStart: false,
                  })
                ) {
                  bookingRange = momentRange.range(
                    moment(startDate),
                    moment(endDate)
                  );
                } else
                  bookingRange = momentRange.range(
                    moment(startDate),
                    moment(startDate).endOf("month")
                  );
                // console.log(bookingRange.start.format("YYYY-MM-DD"))
                // console.log(bookingRange.end.format("YYYY-MM-DD"))
                const dayNumbers = Array.from(bookingRange.by("day")).map(
                  (date) => date.format("DD")
                );
                return (
                  <tr key={index}>
                    {usertype === "Employee" ? (
                      <>
                        <td>{booking.EmployeeDetails[0].emp_code}</td>
                        <td>{booking.EmployeeDetails[0].emp_name}</td>
                        <td>{booking.EmployeeDetails[0].dept_name}</td>
                        <td>{booking.BookingCategory}</td>
                        <td>{booking.MealCounts}</td>
                        <td>{dayNumbers.join(", ")}</td>
                        <td>
                          <i
                            className="bi bi-trash"
                            onClick={(e) => deleteBookingHandler(booking._id)}
                          ></i>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{booking.BookingCategory}</td>
                        <td>{booking.MealCounts}</td>
                        <td>{booking.Notes}</td>
                        <td> {dayNumbers.join(", ")} </td>
                        <td>
                          <i
                            className="bi bi-trash"
                            onClick={(e) => deleteBookingHandler(booking._id)}
                          ></i>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
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
