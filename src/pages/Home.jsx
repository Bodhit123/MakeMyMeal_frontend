/* eslint-disable jsx-a11y/anchor-is-valid */
import ButtonWithDialog from "../components/ButtonWithDialog";
import Navbar from "../components/Navbar";
import React, { useState } from "react";
import BookingListAndFilter from "../components/ListandFilter";
import Footer from "../components/Footer";

const Home = () => {
  const [currentType, setCurrentType] = useState("Employee");
  const [BookingFormOpen, setBookingFormOpen] = useState(false);
  console.log(BookingFormOpen,currentType)

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
              <ButtonWithDialog 
              BookingFormOpen={BookingFormOpen}
              setBookingFormOpen={setBookingFormOpen} /> 
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
              }}
            >
              Others
            </a>
          </div>
          <BookingListAndFilter usertype={currentType}  />
        </div>
      </div>
      {/* <!-- footer start--> */}
      <Footer />
    </div>
  );
};

export default Home;