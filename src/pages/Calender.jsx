/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { extendMoment } from "moment-range";
import { AuthContext } from "../Contexts/AuthContext";
import Navbar from "../components/Navbar";
import addButton1 from "../images/add-btn1.svg";
import addButton2 from "../images/add-btn2.svg";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { MonthNames } from "../helper/Constant";
import "../css/calender.css";
import { setBookingCount } from "../app/bookingSlice";
import LoadingSpinner from "../components/Spinner";
import Footer from "../components/Footer";
import { selectDisabledDates } from "../app/disabledSlice";
import { convertToArray, startOfWeekend } from "./../helper/Holidays";
import useAxiosPrivate from "./../hooks/UseAxiosPrivate";

const Calender = () => {
  let eventId = 0;
  const calendarRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();
  const momentRange = extendMoment(moment);
  const token = useContext(AuthContext).authData?.token;
  const [counts, setCounts] = useState({});
  const [initialEvents, setInitialEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const disabledList = useSelector(selectDisabledDates).map((doc) => ({
    from: moment(doc.Dates.from).format("YYYY-MM-DD"),
    to: moment(doc.Dates.to).format("YYYY-MM-DD"),
  }));

  const generateEvents = useCallback(
    (employeeBookings, riseBookings, othersBookings) => {
      const events = [];

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
          events.push({
            id: (eventId++).toString(),
            title: title.toString(),
            start: formattedDate,
            className: className,
          });
        }
      };

      const processBookings = (bookings, className) => {
        if (!bookings || bookings.length === 0) return;

        const monthStartDate = moment(bookings[0].Dates.startDate)
          .utc()
          .startOf("month");
        const monthEndDate = moment(bookings[0].Dates.startDate)
          .utc()
          .endOf("month");
        const monthRange = moment.range(monthStartDate, monthEndDate, {
          excludeEnd: false,
          excludeStart: false,
        });

        const disabledDatesForMonth = convertToArray(
          monthStartDate,
          monthEndDate,
          [...disabledList, startOfWeekend]
        );

        bookings.forEach((booking) => {
          const { MealCounts } = booking;
          const { startDate, endDate } = booking.Dates;
          const bookingRange = momentRange
            .range(moment(startDate).utc(), moment(endDate).utc())
            .snapTo("day");

          if (
            moment(startDate).isSame(moment(endDate), "day") &&
            !disabledDatesForMonth.includes(
              moment(startDate).format("YYYY-MM-DD")
            )
          ) {
            addEventForDate(startDate, MealCounts, className);
          } else {
            for (const day of monthRange.by("day")) {
              if (
                bookingRange.contains(day, {
                  excludeEnd: false,
                  excludeStart: false,
                }) &&
                !disabledDatesForMonth.includes(
                  moment(day).format("YYYY-MM-DD")
                )
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
    [eventId, momentRange, disabledList]
  );

  const fetchCounts = useCallback(
    async (month, year) => {
      try {
        const response = await axiosPrivate.get(
          `/booking/counts?month=${month}&year=${year}`
        );
        console.log(month, year);
        const fetchedResults = response.data;
        setCounts(fetchedResults.Counts);
        dispatch(setBookingCount(fetchedResults.Counts));

        const { employeeBookings, riseBookings, othersBookings } =
          fetchedResults;
        const events = generateEvents(
          employeeBookings,
          riseBookings,
          othersBookings
        );
        console.log(events);
        setInitialEvents(events);
        console.log(fetchedResults);
        setLoading(false);
      } catch (error) {
        console.error(
          "Error fetching bookings:",
          error.response || error.message
        );
        setLoading(false);
      }
    },
    [dispatch, generateEvents, token]
  );

  useEffect(() => {
    const currentDate = new Date();
    if (token) {
      fetchCounts(
        MonthNames[currentDate.getMonth() + 1],
        currentDate.getFullYear().toString()
      );
    }
  }, [token]);

  const handleDatesSet = ({ start }) => {
    fetchCounts(MonthNames[start.getMonth() + 2], start.getFullYear());
  };

  if (loading) {
    return (
      <div className="loading-container-calendar">
        <LoadingSpinner />
      </div>
    );
  }

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
      <Footer />
    </div>
  );
};

export default Calender;
