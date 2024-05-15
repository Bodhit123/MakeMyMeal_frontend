/* eslint-disable jsx-a11y/anchor-is-valid */
import ButtonWithDialog from "../components/ButtonWithDialog";
import Navbar from "../components/Navbar";
import React, { useState, useEffect } from "react";

const Home = () => {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      employeeCode: "E123",
      employeeName: "John Doe",
      department: "Marketing",
      mealType: "Lunch",
      totalMealsBooked: 2,
      mealDates: "2024-05-15, 2024-05-16",
    },
    {
      id: 2,
      employeeCode: "E456",
      employeeName: "Jane Smith",
      department: "HR",
      mealType: "Dinner",
      totalMealsBooked: 1,
      mealDates: "2024-05-15",
    },
    {
      id: 3,
      employeeCode: "E789",
      employeeName: "Alice Johnson",
      department: "IT",
      mealType: "Breakfast",
      totalMealsBooked: 3,
      mealDates: "2024-05-14, 2024-05-15, 2024-05-16",
    },
    {
      id: 4,
      employeeCode: "E789",
      employeeName: "Alice Johnson",
      department: "IT",
      mealType: "Breakfast",
      totalMealsBooked: 3,
      mealDates: "2024-05-14, 2024-05-15, 2024-05-16",
    },
    {
      id: 5,
      employeeCode: "E789",
      employeeName: "Alice Johnson",
      department: "IT",
      mealType: "Breakfast",
      totalMealsBooked: 3,
      mealDates: "2024-05-14, 2024-05-15, 2024-05-16",
    },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage, setBookingsPerPage] = useState(3); // Number of bookings per page

  // useEffect(() => {
  //   fetchBookings(currentPage);
  // }, [currentPage]);

  // const fetchBookings = async (page) => {
  //   try {
  //     const response = await fetch(
  //       `your_api_endpoint_here?page=${currentPage}&perPage=${bookingsPerPage}`
  //     );
  //     setBookings(response.data);
  //   } catch (error) {
  //     console.error("Error fetching bookings:", error);
  //   }
  // };

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // console.log(currentPage);
  return (
    <div>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <Navbar />
        </div>
      </nav>
      {/* <!-- Navbar End --> */}
      <div className="container-fluid">
        <div className="container pt-30 mb-30">
          <div className="container-head">
            <div className="container-left">
              <h3 className="container-title">Booking List</h3>
            </div>
            <div className="container-right">
              <ButtonWithDialog />
            </div>
          </div>

          <div className="content-tab">
            <a className="content-tab_link active" href="#">
              Rishabh Employees
            </a>
            <a className="content-tab_link" href="#">
              Others
            </a>
          </div>
          <div className="container container-fluid mt-5">
            <table className="table table-responsive dataTable table-hover">
              <thead className="bg-light">
                <tr>
                  <th>Employee Code</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Meal Type</th>
                  <th>Total Meals Booked</th>
                  <th>Meal Dates</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Map through current bookings */}
                {bookings
                  .slice(
                    (currentPage - 1) * bookingsPerPage,
                    currentPage * bookingsPerPage
                  )
                  .map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.employeeCode}</td>
                      <td>{booking.employeeName}</td>
                      <td>{booking.department}</td>
                      <td>{booking.mealType}</td>
                      <td>{booking.totalMealsBooked}</td>
                      <td>{booking.mealDates}</td>
                      <td>
                        <i className="bi bi-trash"></i>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <ul className="pagination">
            {Array.from({
              length: Math.ceil(bookings.length / bookingsPerPage),
            }).map((_, index) => (
              <li
                key={index}
                className={`page-item ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                <button
                  onClick={() => paginate(index + 1)}
                  className="page-link"
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer">
        <div className="container">
          <div className="footer-block">
            <p>Copyright © 2022 Rishabh Software. All Rights Reserved.</p>
            <div className="social">
              <a href="#" aria-label="Facebook">
                <i className="icon-facebook"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="icon-instagram"></i>
              </a>
              <a href="#" aria-label="Linkedin">
                <i className="icon-linkedin"></i>
              </a>
              <a href="#" aria-label="Twitter">
                <i className="icon-twitter"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* <!-- Change Password Modal--> */}
      <div
        className="modal fade"
        id="changepwdModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Change Password
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label htmlFor="exampleInputPassword1">
                    Old Password<span className="extric">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="exampleInputPassword1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="exampleInputPassword1">
                    New Password<span className="extric">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="exampleInputPassword1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="exampleInputPassword1">
                    Confirm Password<span className="extric">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="exampleInputPassword1"
                  />
                  <div className="error-block">Error display here</div>
                </div>
              </form>
            </div>
            {/* Start of Booking List */}
            {/* End of Booking List */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <!-- End Change Password Modal--> */}
    </div>
  );
};

export default Home;
