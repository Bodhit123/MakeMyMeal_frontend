/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
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
import LoadingSpinner from "../components/Spinner";
import Footer from "../components/Footer";
import { selectDisabledDates } from "../app/disabledSlice";
import { convertToArray, startOfWeekend } from "../helper/Holidays";
import useAxiosPrivate from "../hooks/UseAxiosPrivate";

const Calender = () => {
  const eventIdRef = useRef(0);
  const calendarRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();
  const momentRange = extendMoment(moment);
  const token = useContext(AuthContext).authData?.token;
  const [counts, setCounts] = useState({
    TotalEmployeeCount: 0,
    TotalRiseCount: 0,
    TotalBufferCount: 0,
  });
  const [initialEvents, setInitialEvents] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMonth, setViewMonth] = useState(null);

  const rawDisabled = useSelector(selectDisabledDates);
  const disabledList = useMemo(
    () =>
      rawDisabled.map((doc) => ({
        from: moment(doc.Dates.from).format("YYYY-MM-DD"),
        to: moment(doc.Dates.to).format("YYYY-MM-DD"),
      })),
    [rawDisabled]
  );

  // Combined generation of events and counts
  const generateEventsAndCounts = useCallback(
    (employeeBookings = [], riseBookings = [], othersBookings = []) => {
      const events = [];
      const summary = {
        TotalEmployeeCount: 0,
        TotalRiseCount: 0,
        TotalBufferCount: 0,
      };

      if (!viewMonth) return { events, summary };

      const monthStart = viewMonth.clone().startOf("month");
      const monthEnd = viewMonth.clone().endOf("month");
      const monthRange = moment.range(monthStart, monthEnd);
      const disabledDatesForMonth = convertToArray(monthStart, monthEnd, [
        ...disabledList,
        startOfWeekend,
      ]);

      const addEvent = (date, increment, className, key) => {
        const d = moment(date).format("YYYY-MM-DD");
        const existing = events.find(
          (e) => e.start === d && e.className === className
        );
        if (existing)
          existing.title = (parseInt(existing.title) + increment).toString();
        else {
          events.push({
            id: (eventIdRef.current++).toString(),
            title: increment.toString(),
            start: d,
            className,
          });
        }
        summary[key] += increment;
      };

      const process = (bookings, className, key, isBuffer = false) => {
        bookings.forEach(({ MealCounts, Dates: { startDate, endDate } }) => {
          const bookingRange = momentRange
            .range(moment(startDate).utc(), moment(endDate).utc())
            .snapTo("day");
          for (const day of monthRange.by("day")) {
            const ds = day.format("YYYY-MM-DD");
            if (
              bookingRange.contains(day, {
                excludeStart: false,
                excludeEnd: false,
              }) &&
              !disabledDatesForMonth.includes(ds)
            ) {
              const inc = isBuffer ? MealCounts : 1;
              addEvent(day, inc, className, key);
            }
          }
        });
      };

      process(employeeBookings, "employee-booking", "TotalEmployeeCount");
      process(riseBookings, "rise-booking", "TotalRiseCount");
      process(othersBookings, "others-booking", "TotalBufferCount", true);

      return { events, summary };
    },
    [viewMonth, disabledList, momentRange]
  );

  const fetchBookings = useCallback(
    async (month, year) => {
      try {
        const { data } = await axiosPrivate.get(
          `/booking/counts?month=${month}&year=${year}`
        );
        setBookingData(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    },
    [axiosPrivate]
  );

  useEffect(() => {
    if (!token) return;
    const now = moment();
    setViewMonth(now);
    fetchBookings(MonthNames[now.month() + 1], now.year().toString());
  }, [token]);

  useEffect(() => {
    if (!bookingData || !viewMonth) return;
    const { employeeBookings, riseBookings, othersBookings } = bookingData;
    const { events, summary } = generateEventsAndCounts(
      employeeBookings,
      riseBookings,
      othersBookings
    );
    setInitialEvents(events);
    setCounts(summary);
  }, [bookingData, generateEventsAndCounts]);

  const lastFetchRef = useRef({ month: null, year: null });
  const handleDatesSet = ({ view }) => {
    const start = moment(view.currentStart);
    setViewMonth(start);
    const m = MonthNames[start.month() + 1];
    const y = start.year().toString();
    if (lastFetchRef.current.month === m && lastFetchRef.current.year === y)
      return;
    lastFetchRef.current = { month: m, year: y };
    fetchBookings(m, y);
  };

  if (loading) {
    return (
      <div className="loading-container-calendar">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
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
                  editable
                  selectable
                  selectMirror
                  dayMaxEvents={4}
                  events={initialEvents}
                  datesSet={handleDatesSet}
                />
              </div>
              <div className="col-lg-3">
                <div className="tile">
                  <h3 className="tile-title">Booking Summary</h3>
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
                          <i className="icon-employees" />
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
                          <i className="icon-employees" />
                        </div>
                        <div className="info-block">
                          <h5>Non Employees</h5>
                          <h3>{counts.TotalRiseCount}</h3>
                        </div>
                      </div>
                      <a href="#" aria-label="Add Non-Employees">
                        <img src={addButton2} alt="Add" />
                      </a>
                    </div>
                    <div className="booking-block buffer">
                      <div className="booking-block-lt">
                        <div className="icon-block">
                          <i className="icon-buffer" />
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
    </>
  );
};

export default Calender;
