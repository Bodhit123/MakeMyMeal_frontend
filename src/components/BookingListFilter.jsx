import React, { useState, useContext, useEffect, useCallback } from "react";
import { MonthNames, BaseUrl } from "../helper/Constant";
import { AuthContext } from "../Contexts/AuthContext";

const BookingListFilter = ({ setBookings, usertype }) => {
  const { authData } = useContext(AuthContext);
  const token = authData ? authData.token : null;
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear().toString());
  const [month, setMonth] = useState(MonthNames[currentDate.getMonth()]);
  const [filter, setFilter] = useState(false);
  console.log(year, month, department);

  const handleButtonClick = () => {
    setFilter(true);
  };

  const fetchData = useCallback(async () => {
    try {
      let url;
      if (usertype === "Employee") {
        url = `${BaseUrl}/booking/employee?dept=${department}&year=${year}&month=${month}`;
      } else {
        url = `${BaseUrl}/booking/rise?year=${year}&month=${month}`;
      }
      const response = await fetch(`${url}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        console.log(data.message.description);
        setBookings([]);
        return;
      }

      const fetchedResults = await response.json();
      setBookings(fetchedResults.data.fetchedBookingResults);
      console.log(fetchedResults.data.fetchedBookingResults);
      // localStorage.setItem(
      //   "bookings",
      //   JSON.stringify(fetchedResults.data.fetchedBookingResults)
      // );
      setFilter(false);
    } catch (error) {
      console.log("Error fetching bookings:", error);
    }
  }, [department, month, setBookings, token, usertype, year]);

  // useEffect(() => {
  //   fetchData();
  //   return () => localStorage.removeItem("bookings");
  // }, [fetchData]);

  useEffect(() => {
    if (filter) {
      fetchData();
    }
  }, [filter, fetchData]);

  return (
    <div className="dataTables_wrapper">
      <div className="form-group container-head mt-2">
        <div className="search-wrapper container-left col-2">
          <input
            type="text"
            name="searchBox"
            className="form-control custom-placeholder"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="container-right col-lg-6 d-flex align-items-center">
          <select
            className="form-select form-select-lg m-1 border-1 rounded-3"
            onChange={(e) => setDepartment(e.target.value)}
            value={department}
            disabled={usertype === "Rise"}
          >
            <option value="All">All</option>
            <option value="QA">QA</option>
            <option value="Analytics">Analytics</option>
            <option value="BA">BA</option>
            <option value="FrontEnd">FrontEnd</option>
          </select>
          <select
            className="form-select form-select-lg m-1 border-1 rounded-3"
            onChange={(e) => setYear(e.target.value)}
            value={year}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <select
            className="form-select form-select-lg m-1 border-1 rounded-3"
            value={month}
            onChange={(e) => {
              if (e.target.value === "All") {
                setMonth("");
              } else {
                setMonth(e.target.value);
              }
            }}
          >
            {MonthNames.map((monthName, index) => (
              <option key={index} value={monthName}>
                {monthName}
              </option>
            ))}
          </select>
          <button className="btn btn-danger btn-lg" onClick={handleButtonClick}>
            Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingListFilter;
