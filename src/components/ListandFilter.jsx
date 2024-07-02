import React, { useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { BaseUrl, MonthNames } from "../helper/Constant";
import { AuthContext } from "../Contexts/AuthContext";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { extendMoment } from "moment-range";
import { errorToast, successToast } from "./Toast";
import { deleteBooking } from "../app/bookingSlice";
import $ from "jquery";
import "datatables.net-buttons";
import "datatables.net-buttons/js/buttons.html5";

const BookingListAndFilter = ({ usertype }) => {
  const moment = require("moment");
  const momentRange = extendMoment(moment);
  const dispatch = useDispatch();
  const token = useContext(AuthContext).authData?.token;
  const [bookings, setBookings] = useState([]);
  const [department, setDepartment] = useState("All");
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear().toString());
  const [month, setMonth] = useState(MonthNames[currentDate.getMonth() + 1]);
  const [filter, setFilter] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      let url;
      if (usertype === "Employee") {
        url = `${BaseUrl}/booking/employee?dept=${department}&year=${year}&month=${month}`;
      } else {
        url = `${BaseUrl}/booking/rise?year=${year}&month=${month}`;
      }

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedResults = response.data;
      setBookings(fetchedResults.data.fetchedBookingResults); // Update the displayed bookings
      setFilter(false);
    } catch (error) {
      if (error.response) {
        console.log(error.response.data.message.description);
      } else {
        console.log("Error fetching bookings:", error.message);
      }
      setBookings([]);
    }
  }, [department, month, token, usertype, year]);

  useEffect(() => {
    fetchData();
  }, [usertype, department, month, year, fetchData]);

  useEffect(() => {
    if (filter) {
      fetchData();
    }
  }, [filter, fetchData]);

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

  useEffect(() => {
    // Initialize DataTable
    const table = $("#bookingTable").DataTable({
      destroy: true, // Destroy existing DataTable instance
      data: bookings,
      responsive: true,
      buttons: [
        {
          extend: "csv",
          text: '<i class="bi bi-download fs-3"></i>',
          className: "btn btn-primary",
          title: "Bookings Data",
        },
      ],
      language: {
        info: "_START_  -  _END_ of _TOTAL_ items",
      },
      lengthMenu: [3, 5, 10, 20, 25],
      columns: getColumns(usertype),
    });

    if (usertype === "Rise") {
      table.column(3).visible(false);
      table.column(4).visible(false);
    }
    // Place the buttons container where you want it to appear
    table.buttons().container().appendTo($(".buttons-container"));
    // Remove any existing click event handlers
    $("#bookingTable tbody").off("click", "i.bi-trash");

    // Handle delete action using event delegation
    $("#bookingTable tbody").on("click", "i.bi-trash", function () {
      const rowData = table.row($(this).closest("tr")).data();
      if (rowData) {
        deleteBookingHandler(rowData._id);
      } else {
        console.error("Failed to get row data.");
      }
    });

    // Return a cleanup function to destroy DataTable when component unmounts
    return () => {
      table.destroy();
    };
  }, [bookings, usertype, deleteBookingHandler]);

  const getColumns = (usertype) => {
    const commonColumns = [
      { title: "Meal Type", data: "BookingCategory" },
      { title: "Total Meals Booked", data: "MealCounts" },
      { title: "Meal Dates", data: null, render: renderMealDates },
      {
        title: "Actions",
        data: null,
        render: function (data, type, row) {
          return `<i class="bi bi-trash"</i>`;
        },
      },
    ];

    if (usertype === "Employee") {
      return [
        { title: "Employee Code", data: "EmployeeDetails[0].emp_code" },
        { title: "Employee Name", data: "EmployeeDetails[0].emp_name" },
        { title: "Department", data: "EmployeeDetails[0].dept_name" },
        ...commonColumns,
      ];
    }

    return [
      { title: "Booking Category", data: "BookingCategory" },
      { title: "Meal Counts", data: "MealCounts" },
      { title: "Notes", data: "Notes" },
      ...commonColumns,
    ];
  };

  const renderMealDates = (data, type, row) => {
    const { startDate, endDate } = row.Dates;
    const monthRange = momentRange.range(
      moment(startDate).startOf("month"),
      moment(startDate).endOf("month")
    );

    let bookingRange;
    if (
      monthRange.contains(moment(endDate), {
        excludeEnd: false,
        excludeStart: false,
      })
    ) {
      bookingRange = momentRange.range(moment(startDate), moment(endDate));
    } else {
      bookingRange = momentRange.range(
        moment(startDate),
        moment(startDate).endOf("month")
      );
    }

    const dayNumbers = Array.from(bookingRange.by("day")).map((day) =>
      day.format("D")
    );

    return dayNumbers.join(", ");
  };

  const FilterForm = () => {
    return (
      <div className="form-group mt-2">
        <div className="container-right col-lg-6 col-12 d-flex flex-row align-items-center float-start">
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
            <option value="Backend nodejs">Backend nodejs</option>
            <option value="Backend Java">Backend Java</option>
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

          <button
            className="btn btn-danger btn-lg"
            onClick={() => setFilter(true)}
          >
            Filter
          </button>
          <div className="buttons-container m-1"></div>
        </div>
      </div>
    );
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
      <>
        <FilterForm />
        <br />
        <div className="alert alert-info alert-dismissible my-4">
          No bookings data available.
        </div>
      </>
    );
  } else
    return (
      <div>
        <FilterForm />
        <section className="container-fluid mt-2">
          {/* Bookings table section */}
          <table
            id="bookingTable"
            className="table table-responsive dataTable nowrap table-hover mt-3"
          >
            <thead className="bg-light"></thead>
            <tbody></tbody>
          </table>
        </section>
      </div>
    );
};

export default BookingListAndFilter;

// import React, { useState, useContext, useEffect, useCallback } from "react";
// import axios from "axios";
// import { BaseUrl, MonthNames } from "../helper/Constant";
// import { AuthContext } from "../Contexts/AuthContext";
// import { useDispatch } from "react-redux";
// import Swal from "sweetalert2";
// import { extendMoment } from "moment-range";
// import { errorToast, successToast } from "./Toast";
// import { deleteBooking } from "../app/bookingSlice";

// const BookingListAndFilter = ({ usertype }) => {
//   const moment = require("moment");
//   const momentRange = extendMoment(moment);
//   const dispatch = useDispatch();
//   const token = useContext(AuthContext).authData?.token;
//   const [currentPage, setCurrentPage] = useState(1);
//   const [bookingsPerPage] = useState(3);
//   const [bookings, setBookings] = useState([]);
//   const [search, setSearch] = useState("");
//   const [department, setDepartment] = useState("All");
//   const currentDate = new Date();
//   const [year, setYear] = useState(currentDate.getFullYear().toString());
//   const [month, setMonth] = useState(MonthNames[currentDate.getMonth() + 1]);
//   const [filter, setFilter] = useState(false);
//   const [originalBookings, setOriginalBookings] = useState([]);
//   const [flag, setFlag] = useState(false);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   console.log(month, flag, usertype, year);
//   const fetchData = useCallback(async () => {
//     try {
//       let url;
//       if (usertype === "Employee") {
//         url = `${BaseUrl}/booking/employee?dept=${department}&year=${year}&month=${month}`;
//       } else {
//         url = `${BaseUrl}/booking/rise?year=${year}&month=${month}`;
//       }

//       const response = await axios.get(url, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const fetchedResults = response.data;
//       setOriginalBookings(fetchedResults.data.fetchedBookingResults); // Store fetched results
//       setBookings(fetchedResults.data.fetchedBookingResults); // Update the displayed bookings
//       setFilter(false);
//     } catch (error) {
//       if (error.response) {
//         console.log(error.response.data.message.description);
//       } else {
//         console.log("Error fetching bookings:", error.message);
//       }
//       setOriginalBookings([]);
//       setBookings([]);
//     }
//   }, [department, month, setBookings, token, usertype, year]);

//   useEffect(() => {
//     if (search.trim() === "") {
//       setBookings(originalBookings); // Reset to original bookings when search is cleared
//     } else {
//       const filteredBookings = originalBookings.filter(
//         (booking) =>
//           booking.EmployeeDetails?.[0]?.emp_name
//             ?.toLowerCase()
//             .includes(search.toLowerCase()) ||
//           booking.EmployeeDetails?.[0]?.dept_name
//             ?.toLowerCase()
//             .includes(search.toLowerCase())
//       );
//       setBookings(filteredBookings);
//     }
//   }, [search, originalBookings]);

//   useEffect(() => {
//     if (filter) {
//       fetchData();
//     }
//   }, [filter, fetchData]);

//   useEffect(() => {
//     if ((month && !flag) || usertype) {
//       fetchData();
//     }
//   }, [fetchData, flag, month, usertype]);
//   const deleteBookingHandler = async (id) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         Swal.fire({
//           title: "Deleted!",
//           text: "Your booking has been deleted.",
//           icon: "success",
//         });
//         deleteApi(id);
//       }
//     });
//   };
// console.log(bookings)
//   const deleteApi = async (id) => {
//     try {
//       const result = await axios.delete(`${BaseUrl}/booking/${id}`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = result.data;
//       successToast("Booking Deleted Successfully", {
//         position: "top-right",
//         style: { fontSize: "16px", fontWeight: "500" },
//       });
//       setBookings((prevBookings) =>
//         prevBookings.filter((booking) => booking._id !== id)
//       );
//       dispatch(
//         deleteBooking({ type: data.BookingPerson, count: data.TotalMeals })
//       );
//     } catch (error) {
//       console.error("Error deleting booking:", error);
//       errorToast(
//         error.response?.data.message.description || "Failed to delete booking ",
//         {
//           position: "top-right",
//         }
//       );
//     }
//   };

//   const Others = [
//     "BookingCategory",
//     "Meal Counts",
//     "Notes",
//     "Meal Dates",
//     "Actions",
//   ];
//   const Employees = [
//     "Employee Code",
//     "Employee Name",
//     "Department",
//     "Meal Type",
//     "Total Meals Booked",
//     "Meal Dates",
//     "Actions",
//   ];

//   return (
//     <div>
//       <div className="dataTables_wrapper">
//         <div className="form-group container-head mt-2">
//           <div className="search-wrapper container-left col-2">
//             <input
//               type="text"
//               name="searchBox"
//               className="form-control custom-placeholder"
//               placeholder="Search"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//           <div className="container-right col-lg-6 d-flex align-items-center">
//             <select
//               className="form-select form-select-lg m-1 border-1 rounded-3"
//               onChange={(e) => setDepartment(e.target.value)}
//               value={department}
//               disabled={usertype === "Rise"}
//             >
//               <option value="All">All</option>
//               <option value="QA">QA</option>
//               <option value="Analytics">Analytics</option>
//               <option value="BA">BA</option>
//               <option value="FrontEnd">FrontEnd</option>
//               <option value="Backend nodejs">Backend nodejs</option>
//               <option value="Backend Java">Backend Java</option>
//             </select>
//             <select
//               className="form-select form-select-lg m-1 border-1 rounded-3"
//               onChange={(e) => {
//                 setYear(e.target.value);
//                 setFlag(true);
//               }}
//               value={year}
//             >
//               <option value="2025">2025</option>
//               <option value="2024">2024</option>
//               <option value="2023">2023</option>
//               <option value="2022">2022</option>
//             </select>
//             <select
//               className="form-select form-select-lg m-1 border-1 rounded-3"
//               value={month}
//               onChange={(e) => {
//                 if (e.target.value === "All") {
//                   setMonth("");
//                 } else {
//                   setMonth(e.target.value);
//                 }
//                 setFlag(true);
//               }}
//             >
//               {MonthNames.map((monthName, index) => (
//                 <option key={index} value={monthName}>
//                   {monthName}
//                 </option>
//               ))}
//             </select>
//             <button
//               className="btn btn-danger btn-lg"
//               onClick={() => setFilter(true)}
//             >
//               Filter
//             </button>
//           </div>
//         </div>
//       </div>

//       {bookings.length === 0 ? (
//         <div className="alert alert-info alert alert-dismissible mt-3">
//           No Bookings data available. Try again
//         </div>
//       ) : (
//         <section className="container-fluid mt-2">
//           <table className="table table-responsive dataTable nowrap table-hover">
//             <thead className="bg-light">
//               <tr>
//                 {usertype === "Employee"
//                   ? Employees.map((head, index) => <th key={index}>{head}</th>)
//                   : Others.map((head, index) => <th key={index}>{head}</th>)}
//               </tr>
//             </thead>
//             <tbody>
//               {bookings
//                 .slice(
//                   (currentPage - 1) * bookingsPerPage,
//                   currentPage * bookingsPerPage
//                 )
//                 .map((booking, index) => {
//                   const { startDate, endDate } = booking.Dates;
//                   const monthRange = momentRange.range(
//                     moment(startDate).startOf("month"),
//                     moment(startDate).endOf("month")
//                   );

//                   let bookingRange;
//                   if (
//                     monthRange.contains(moment(endDate), {
//                       excludeEnd: false,
//                       excludeStart: false,
//                     })
//                   ) {
//                     bookingRange = momentRange.range(
//                       moment(startDate),
//                       moment(endDate)
//                     );
//                   } else {
//                     bookingRange = momentRange.range(
//                       moment(startDate),
//                       moment(startDate).endOf("month")
//                     );
//                   }

//                   const dayNumbers = Array.from(bookingRange.by("day")).map(
//                     (day) => day.format("D")
//                   );

//                   return (
//                     <tr key={index}>
//                       {usertype === "Employee" ? (
//                         <>
//                           <td>
//                             {booking.EmployeeDetails?.[0]?.emp_code || "-"}
//                           </td>
//                           <td>
//                             {booking.EmployeeDetails?.[0]?.emp_name || "-"}
//                           </td>
//                           <td>
//                             {booking.EmployeeDetails?.[0]?.dept_name || "-"}
//                           </td>
//                           <td>{booking.BookingCategory}</td>
//                           <td>{booking.MealCounts}</td>
//                           <td>{dayNumbers.join(", ")}</td>
//                           <td>
//                             <i
//                               className="bi bi-trash"
//                               onClick={() => deleteBookingHandler(booking._id)}
//                             ></i>
//                           </td>
//                         </>
//                       ) : (
//                         <>
//                           <td>{booking.BookingCategory}</td>
//                           <td>{booking.MealCounts}</td>
//                           <td>{booking.Notes}</td>
//                           <td> {dayNumbers.join(", ")} </td>
//                           <td>
//                             <i
//                               className="bi bi-trash"
//                               onClick={() => deleteBookingHandler(booking._id)}
//                             ></i>
//                           </td>
//                         </>
//                       )}
//                     </tr>
//                   );
//                 })}
//             </tbody>
//           </table>
//         </section>
//       )}

//       <ul className="pagination">
//         {Array.from({
//           length: Math.ceil(bookings.length / bookingsPerPage),
//         }).map((_, index) => (
//           <li
//             key={index}
//             className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
//           >
//             <button onClick={() => paginate(index + 1)} className="page-link">
//               {index + 1}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default BookingListAndFilter;
