/* eslint-disable jsx-a11y/anchor-is-valid */
import ButtonWithDialog from "../components/ButtonWithDialog";
import Navbar from "../components/Navbar";
import BookingListFilter from "../components/BookingListFilter";
import React, { useState} from "react";
import BookingListAndFilter from "../components/ListandFilter";
import BookingList from "../components/BookingList";
import Footer from "../components/Footer";

const Home = () => {
  const [currentType, setCurrentType] = useState("Employee");
  const [bookings, setBookings] = useState([]);

  return (
    <div>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <Navbar/>
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
          {/* <BookingListFilter setBookings={setBookings} usertype={currentType} />
          <BookingList
            bookings={bookings}
            usertype={currentType}
            setBookings={setBookings}
          /> */}
          <BookingListAndFilter usertype={currentType}/>
        </div>
      </div>
      {/* <!-- footer start--> */}
      <Footer />
    </div>
  );
};

export default Home;
