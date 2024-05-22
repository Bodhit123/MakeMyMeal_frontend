/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import { extendMoment } from "moment-range";
import { AuthContext } from "../Contexts/AuthContext";
import axios from "axios";
import Navbar from "../components/Navbar";
import addButton1 from "../images/add-btn1.svg";
import addButton2 from "../images/add-btn2.svg";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { MonthNames, BaseUrl } from "../helper/Constant";
import "../css/calender.css";
import { setBookingCount } from "../app/bookingSlice";

const Calender = () => {
  let eventId = 0;
  const calendarRef = useRef(null);
  const momentRange = extendMoment(moment);
  const token = useContext(AuthContext).authData?.token;
  const [counts, setCounts] = useState({});
  const [initialEvents, setInitialEvents] = useState([]);
  const dispatch = useDispatch();

  const generateEvents = useCallback(
    (employeeBookings, riseBookings, othersBookings, month, year) => {
      const events = [];
      console.log(othersBookings, month, year);

      const addEventForDate = (date, title, className) => {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        const existingEvent = events.find(
          (event) =>
            event.start === formattedDate && event.className === className
        );
        if (existingEvent) {
          existingEvent.title = (
            parseInt(existingEvent.title) + title
          ).toString();
        } else {
          // Generate number IDs for events
          events.push({
            id: (eventId++).toString(),
            title: title.toString(),
            start: formattedDate,
            className: className,
          });
        }
      };

      const processBookings = (bookings, className) => {
        bookings.forEach((booking) => {
          const { MealCounts } = booking;
          const { startDate, endDate } = booking.Dates;
          const monthRange = moment.range(
            moment(startDate).utc().startOf("month"),
            moment(startDate).utc().endOf("month"),
            { excludeEnd: false, excludeStart: false }
          );
          const bookingRange = momentRange.range(moment(startDate).utc(), moment(endDate).utc()).snapTo("day");
          if (moment(startDate).isSame(moment(endDate), "day")) {
            // If start date is the same as end date, it's a single-day booking
            addEventForDate(startDate, MealCounts, className);
          } else {
            for (const day of monthRange.by("day")) {
              if (
                bookingRange.contains(day, {
                  excludeEnd: false,
                  excludeStart: false,
                })
              ) {
                if (className === "others-booking") {
                  const title = MealCounts;
                  addEventForDate(day, title, className);
                } else {
                  addEventForDate(day, 1, className);
                }
              }
            }
          }
        });
      };

      processBookings(employeeBookings, "employee-booking");
      processBookings(riseBookings, "rise-booking");
      processBookings(othersBookings, "others-booking");

      return events;
    },
    [eventId, momentRange]
  );

  const fetchCounts = useCallback(
    async (month, year) => {
      try {
        const response = await axios.get(
          `${BaseUrl}/booking/counts?month=${month}&year=${year}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const fetchedResults = response.data;
        console.log(fetchedResults);
        setCounts(fetchedResults.Counts);
        dispatch(setBookingCount(fetchedResults.Counts));

        const { employeeBookings, riseBookings, othersBookings } =
          fetchedResults;

        const Events = generateEvents(
          employeeBookings,
          riseBookings,
          othersBookings,
          month,
          year
        );

        setInitialEvents(Events);
      } catch (error) {
        console.error(
          "Error fetching bookings:",
          error.response || error.message
        );
      }
    },
    [dispatch, generateEvents, token]
  );

  useEffect(() => {
    if (token) {
      fetchCounts("May", "2024");
    }
  }, [token]);

  const handleDatesSet = ({ start }) => {
    const month = MonthNames[start.getMonth() + 2]; //because MonthNames array has one more string "all" at the index 0 and getMonth is 0 based indexing.
    const year = start.getFullYear();
    fetchCounts(month, year);
    console.log(`Fetching data for ${month} ${year}`);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <Navbar />
        </div>
      </nav>

      <div className="container-fluid">
        <div className="calendar-wrapper">
          <div className="container">
            <h3 className="main-title">Calendar</h3>
            <div className="row">
              <div className="col-lg-9">
                <div className="tile">Calendar</div>
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                  headerToolbar={{
                    left: "prev",
                    center: "title,today",
                    right: "next",
                  }}
                  initialView="dayGridMonth"
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={4}
                  events={initialEvents}
                  datesSet={handleDatesSet}
                  // initialEvents={initialEvents} // alternatively, use the `events` setting to fetch from a feed
                  // select={handleDateSelect}
                  // eventContent={renderEventContent} // custom render function
                  // eventClick={handleEventClick}
                  // eventsSet={handleEvents} // called after events are initialized/added/changed/removed
                />
              </div>
              <div className="col-lg-3">
                <div className="tile">
                  <h3 className="tile-title">Saturday, 19 Dec 2022</h3>
                  <div className="booking-wrapper">
                    <div className="booking-block">
                      <h5>Bookings</h5>
                      <a href="#" aria-label="Add Employees">
                        <img src={addButton1} alt="Add" />
                      </a>
                    </div>
                    <div className="booking-block employees">
                      <div className="booking-block-lt">
                        <div className="icon-block">
                          <i className="icon-employees"></i>
                        </div>
                        <div className="info-block">
                          <h5>Employees</h5>
                          <h3>{counts.TotalEmployeeCount}</h3>
                        </div>
                      </div>
                      <a href="#" aria-label="Add Employees">
                        <img src={addButton2} alt="Add" />
                      </a>
                    </div>
                    <div className="booking-block non-employees">
                      <div className="booking-block-lt">
                        <div className="icon-block">
                          <i className="icon-employees"></i>
                        </div>
                        <div className="info-block">
                          <h5>Non Employees</h5>
                          <h3>{counts.TotalRiseCount}</h3>
                        </div>
                      </div>
                      <a href="#" aria-label="Add Employees">
                        <img src={addButton2} alt="Add" />
                      </a>
                    </div>
                    <div className="booking-block buffer">
                      <div className="booking-block-lt">
                        <div className="icon-block">
                          <i className="icon-buffer"></i>
                        </div>
                        <div className="info-block">
                          <h5>Buffer</h5>
                          <h3>{counts.TotalBufferCount}</h3>
                        </div>
                      </div>
                      <a href="#" aria-label="Add Buffer">
                        <img src={addButton2} alt="Add" />
                      </a>
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
    </div>
  );
};

export default Calender;
