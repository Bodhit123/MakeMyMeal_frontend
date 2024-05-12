import React from 'react'
import Navbar from '../components/Navbar';
import addButton1 from "../images/add-btn1.svg";
import addButton2 from "../images/add-btn2.svg";

const Calender = () => {
  return (
    <div>
      <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container-fluid">
        <Navbar/>
      </div> 
  </nav>

  <div className="container-fluid">
      <div className="calendar-wrapper">
        <div className="container">
          <h3 className="main-title">Calendar</h3>
          <div className="row">
            <div className="col-lg-9">
              <div className="tile">Calendar</div>
            </div>
            <div className="col-lg-3">
              <div className="tile">
                <h3 className="tile-title">Saturday, 19 Dec 2022</h3>
                <div className="booking-wrapper">
                  <div className="booking-block">
                    <h5>Bookings</h5>
                    <a href="#"  aria-label="Add Employees"><img src={addButton1} alt="Add"/></a>
                  </div>
                  <div className="booking-block employees">
                    <div className="booking-block-lt">
                      <div className="icon-block"><i className="icon-employees"></i></div>
                      <div className="info-block">
                        <h5>Employees</h5>
                        <h3>200</h3>
                      </div>
                    </div>
                    <a href="#" aria-label="Add Employees"><img src={addButton2} alt="Add"/></a>
                  </div>
                  <div className="booking-block non-employees">
                    <div className="booking-block-lt">
                      <div className="icon-block"><i className="icon-employees"></i></div>
                      <div className="info-block">
                        <h5>Non Employees</h5>
                        <h3>160</h3>
                      </div>
                    </div>
                    <a href="#" aria-label="Add Employees"><img src={addButton2} alt="Add"/></a>
                  </div>
                  <div className="booking-block buffer">
                    <div className="booking-block-lt">
                      <div className="icon-block"><i className="icon-buffer"></i></div>
                      <div className="info-block">
                        <h5>Buffer</h5>
                        <h3>180</h3>
                      </div>
                    </div>
                    <a href="#" aria-label="Add Buffer"><img src={addButton2} alt="Add"/></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>

    <div className="footer">
      <div className="container">
        <div className="footer-block">
          <p>Copyright © 2022 Rishabh Software. All Rights Reserved.</p>
          <div className="social">
            <a href="#" aria-label="Facebook"><i className="icon-facebook"></i></a>
            <a href="#" aria-label="Instagram"><i className="icon-instagram"></i></a>
            <a href="#" aria-label="Linkedin"><i className="icon-linkedin"></i></a>
            <a href="#" aria-label="Twitter"><i className="icon-twitter"></i></a>
          </div>
        </div>
      </div>
    </div>
    </div>
    )
}
    
export default Calender;
