/* eslint-disable jsx-a11y/anchor-is-valid */
import ButtonWithDialog from "../components/ButtonWithDialog";
import Navbar from "../components/Navbar";
import BookingListFilter from "../components/BookingListFilter";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import BookingList from "../components/BookingList";

const Home = () => {
  const [currentType, setCurrentType] = useState("Employee");
  const [bookings, setBookings] = useState([]);
 
  console.log(bookings);
  console.log(currentType);

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
            <a
              className={`content-tab_link ${
                currentType === "Employee" ? "active" : ""
              }`}
              href="#"
              onClick={() => {
                setCurrentType("Employee");
                setBookings([]);
              }}
            >
              Rishabh Employees
            </a>
            <a
              className={`content-tab_link ${
                currentType === "Rise" ? "active" : ""
              }`}
              href="#"
              onClick={() => {
                setCurrentType("Rise");
                setBookings([]);
              }}
            >
              Others
            </a>
          </div>
          <BookingListFilter setBookings={setBookings} usertype={currentType} />
          <BookingList
            bookings={bookings}
            usertype={currentType}
            setBookings={setBookings}
          />
        </div>
      </div>
      {/* <!-- footer start--> */}
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
      {/* <!-- Change Password Modal --> */}
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
