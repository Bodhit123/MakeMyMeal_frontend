import React, { useState, useEffect, useRef } from "react";
import { MonthNames } from "../helper/Constant";
import { useDispatch } from "react-redux";
import { extendMoment } from "moment-range";
import { errorToast, successToast } from "./Toast";
import { deleteBooking } from "../app/bookingSlice";
import UseAxiosPrivate from "../hooks/UseAxiosPrivate";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import $ from "jquery";
import "datatables.net-buttons";
import "datatables.net-buttons/js/buttons.html5";

const BookingListAndFilter = ({ usertype }) => {
  const moment = require("moment");
  const location = useLocation();
  const tableRef = useRef(null);
  const tableInstanceRef = useRef(null); // New ref for the DataTable instance
  const buttonsRef = useRef(null);
  const axiosInstance = UseAxiosPrivate();
  const momentRange = extendMoment(moment);
  const dispatch = useDispatch();
  const [bookings, setBookings] = useState([]);
  const [department, setDepartment] = useState("All");
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear().toString());
  const [month, setMonth] = useState("July");
  const [filter, setFilter] = useState(false);

  // Track previous values of department, year, and month
  const prevValuesRef = useRef({
    department: null,
    year: null,
    month: null,
  });

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
    const tableElement = $(tableRef.current);
    const url =
      usertype === "Employee"
        ? `/booking/employee?dept=${department}&year=${year}&month=${month}`
        : `/booking/rise?year=${year}&month=${month}`;

    // Check if any of department, year, or month has changed
    const hasFiltersChanged =
      prevValuesRef.current.department !== department ||
      prevValuesRef.current.year !== year ||
      prevValuesRef.current.month !== month;

    if (hasFiltersChanged || tableInstanceRef.current?.usertype !== usertype) {
      // Update the ref with the current values
      prevValuesRef.current = {
        department: department,
        year: year,
        month: month,
      };
    } else {
      // Skip running if no filter change
      console.log("No changes detected in department, year, or month. Skipping DataTable initialization.");
      return;
    }
    // Check if DataTable instance already exists
    if ($.fn.dataTable.isDataTable(tableElement)) {
      const tableInstance = tableInstanceRef.current?.tableInstance;

      // If DataTable exists and usertype has changed, destroy and reinitialize
      if (tableInstance && tableInstanceRef.current?.usertype !== usertype) {
        console.log(
          "Destroying and reinitializing DataTable due to usertype change"
        );
        // Destroy the existing DataTable instance
        tableInstance.destroy();
        // Reset the table instance reference
        tableInstanceRef.current = null;
      }
    }

    // Initialize a new DataTable instance if none exists or after destruction
    if (!tableInstanceRef.current) {
      const table = tableElement.DataTable({
        destroy: true, // Allow re-initialization
        autoWidth: false,
        serverSide: true,
        processing: true,
        responsive: true,
        ajax: async (data, callback) => {
          try {
            const response = await axiosInstance.post(url, data, {
              withCredentials: true,
            });

            const { data: records, recordsTotal } = response.data;
            if (recordsTotal === 0) {
              errorToast("No data available for the selected filters.", {
                position: "top-right",
              });
            }
            callback({
              data: records,
              recordsTotal,
              recordsFiltered: recordsTotal,
            });
          } catch (error) {
            console.error("Error fetching data:", error);
            errorToast("Error fetching data", { position: "top-right" });
            callback({
              data: [],
              recordsTotal: 0,
              recordsFiltered: 0,
            });
          }
        },
        columns: getColumns(usertype), // Dynamically set columns based on usertype
        buttons: [
          {
            extend: "csv",
            text: '<i class="bi bi-download fs-3"></i>',
            className: "btn btn-primary",
            title: "Bookings Data",
          },
        ],
        language: {
          info: "_START_ - _END_ of _TOTAL_ items",
        },
        lengthMenu: [3, 5, 10, 20, 25],
        drawCallback: function (settings) {
          const api = this.api();

          // Check if there are no records and hide pagination and info
          const tableContainer = $(api.table().container());

          // Hide pagination and info if no rows
          if (api.rows().count() === 0) {
            tableContainer.find(".dt-info").hide(); // Hide info (e.g., "Showing 1 to 10 of 0 entries")
            tableContainer.find(".dt-length").hide(); // Hide length menu (e.g., "Show 10 entries")
            tableContainer.find(".dt-pager").hide(); // Hide pagination (next/prev buttons)
          } else {
            tableContainer.find(".dt-info").show();
            tableContainer.find(".dt-length").show();
            tableContainer.find(".dt-pager").show();
          }

          // Ensure buttons are appended after DataTable redraw
          if (buttonsRef.current) {
            const buttonContainer = $(buttonsRef.current).find(".dt-buttons");
            if (buttonContainer.length === 0) {
              table.buttons().container().appendTo(buttonsRef.current);
              console.log("Buttons appended successfully.");
            }
          }
        },
        initComplete: function () {
          // Ensure the buttons are appended to the custom container only after DataTable init
          if (buttonsRef.current) {
            const buttonContainer = $(buttonsRef.current).find(".dt-buttons");
            if (buttonContainer.length === 0) {
              table.buttons().container().appendTo(buttonsRef.current);
              console.log("Buttons appended during initComplete.");
            }
          }
        },
      });

      // Hide specific columns based on usertype
      if (usertype === "Rise") {
        table.column(3).visible(false);
        table.column(4).visible(false);
      }

      // Handle delete action using event delegation
      $("#bookingTable tbody").off("click", "i.bi-trash");
      $("#bookingTable tbody").on("click", "i.bi-trash", function () {
        const rowData = table.row($(this).closest("tr")).data();
        if (rowData) {
          deleteBookingHandler(rowData._id);
        } else {
          console.error("Failed to get row data.");
        }
      });
      // Store the new DataTable instance
      tableInstanceRef.current = { tableInstance: table, usertype };
      console.log("New DataTable instance created.");
    } else {
      // Reload the DataTable data if it exists and usertype hasn't changed
      const tableInstance = tableInstanceRef.current?.tableInstance;
      if (tableInstance) {
        console.log("Reloading data for existing DataTable instance");
        // Update the ajax call to match usertype and filters
        tableInstance.settings()[0].ajax = async (data, callback) => {
          try {
            const updatedUrl = url;
            const response = await axiosInstance.post(updatedUrl, data, {
              withCredentials: true,
            });

            const { data: records, recordsTotal } = response.data;
            if (recordsTotal === 0) {
              errorToast("No data available for the selected filters.", {
                position: "top-right",
              });
            }
            setFilter(false);
            callback({
              data: records, // Pass the data to DataTables
              recordsTotal,
              recordsFiltered: recordsTotal, // Adjust filtered count if needed
            });
          } catch (error) {
            console.error("Error fetching data:", error);
            setFilter(false);
            errorToast("Error fetching data", { position: "top-right" });
            callback({
              data: [],
              recordsTotal: 0,
              recordsFiltered: 0,
            });
          }
        };

        tableInstance.ajax.reload(null, false); // Reload data without resetting the table
      }
    }

    // Cleanup: Destroy the DataTable instance when leaving the page
    return () => {
      if (!location.pathname.includes("home")) {
        console.log("Destroying DataTable instance");
        tableInstanceRef.current?.tableInstance.destroy();
        tableInstanceRef.current = null;
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usertype, filter, location.pathname]);

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
            onChange={(e) => {
              setDepartment(e.target.value);
            }}
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
            onChange={(e) => {
              setYear(e.target.value);
            }}
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
          <div ref={buttonsRef} className="buttons-container m-1"></div>
        </div>
      </div>
    );
  };

  const deleteApi = async (id) => {
    try {
      const result = await axiosInstance.delete(`/booking/${id}`, {});

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

  // if (bookings.length === 0) {
  //   return (
  //     <>
  //       <FilterForm />
  //       <br />
  //       <div className="alert alert-info alert-dismissible my-4">
  //         No bookings data available.
  //       </div>
  //     </>
  //   );
  // } else
  return (
    <div>
      <FilterForm />
      <section className="mt-2">
        {/* Bookings table section */}
        <table
          id="bookingTable"
          ref={tableRef}
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

// useEffect(() => {
//   // Initialize DataTable
//   const table = $("#bookingTable").DataTable({
//     destroy: true, // Destroy existing DataTable instance
//     autoWidth: false,
//     serverSide: true, // Enable server-side processing
//     processing: true, // Show processing indicator
//     responsive: true,
//     ajax: async (data, callback) => {
//       // console.log("Data received from DataTable:", data); // Debug incoming DataTable parameters
//       if (data && Object.keys(data).length > 0) {
//         // Call fetchData only if data has values
//         await fetchData(data, callback);
//       } else {
//         // Return an empty dataset if data is invalid
//         callback({ data: [], recordsTotal: 0, recordsFiltered: 0 });
//       }
//     },
//     buttons: [
//       {
//         extend: "csv",
//         text: '<i class="bi bi-download fs-3"></i>',
//         className: "btn btn-primary",
//         title: "Bookings Data",
//       },
//     ],
//     language: {
//       info: "_START_  -  _END_ of _TOTAL_ items",
//     },
//     lengthMenu: [3, 5, 10, 20, 25],
//     columns: getColumns(usertype),
//     initComplete: function () {
//                 setTimeout(() => {
//                   if (buttonsRef.current) {
//                     if ($(buttonsRef.current).find(".dt-buttons").length === 0) {
//                       table.buttons().container().appendTo(buttonsRef.current);
//                     }
//                   }
//                 }, 100);
//               },

//   });

//   if (usertype === "Rise") {
//     table.column(3).visible(false);
//     table.column(4).visible(false);
//   }
//   // Remove any existing click event handlers
//   $("#bookingTable tbody").off("click", "i.bi-trash");

//   // Handle delete action using event delegation
//   $("#bookingTable tbody").on("click", "i.bi-trash", function () {
//     const rowData = table.row($(this).closest("tr")).data();
//     if (rowData) {
//       deleteBookingHandler(rowData._id);
//     } else {
//       console.error("Failed to get row data.");
//     }
//   });

//   // Return a cleanup function to destroy DataTable when component unmounts
//   return () => {
//     table.destroy();
//   };
// }, [usertype, filter]);

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
//                             {booking.EmployeeDetails?.[0]?.emp_code }
//                           </td>
//                           <td>
//                             {booking.EmployeeDetails?.[0]?.emp_name }
//                           </td>
//                           <td>
//                             {booking.EmployeeDetails?.[0]?.dept_name}
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

// const fetchDataInitial = useCallback(async () => {
//   try {
//     let url;
//     if (usertype === "Employee") {
//       url = `/booking/employee?dept=${department}&year=${year}&month=${month}`;
//     } else {
//       url = `/booking/rise?year=${year}&month=${month}`;
//     }
//     console.log("fetchdataInitial running");
//     const response = await axiosInstance.post(url, { withCredentials: true });
//     const fetchedResults = response.data;
//     // console.log("fetchedResults",fetchedResults);
//     setBookings(fetchedResults.data); // Update the displayed bookings
//     setFilter(false);
//   } catch (error) {
//     if (error.response) {
//       console.log(error.response);
//       errorToast("No bookings present for given month.", {
//         position: "top-right",
//       });
//       setFilter(false);
//     } else {
//       console.log("Error fetching bookings:", error.message);
//     }
//     setBookings([]);
//   }
// }, [department, token, usertype]);

// const fetchData = useCallback(
//   async (data, callback) => {
//     const {
//       draw = 1, // Default to 1 (typically for pagination)
//       start = 0, // Default to 0 (start index)
//       length = 10, // Default to 10 (default page size)
//       search = { value: "" }, // Default to an empty string for search
//       order = [{ column: 0, dir: "asc" }], // Default to first column and ascending order
//     } = data || {};
//     const url =
//       usertype === "Employee"
//         ? `/booking/employee?dept=${department}&year=${year}&month=${month}`
//         : `/booking/rise?year=${year}&month=${month}`;
//     console.log(url);

//     const sortColumn = order?.[0]?.column || 0; // Default to first column
//     const sortDirection = order?.[0]?.dir || "asc"; // Default to ascending

//     const requestParams = {
//       draw,
//       start,
//       length,
//       search: search?.value || "",
//       sortColumn,
//       sortDirection,
//     };

//     try {
//       const response = await axiosInstance.post(url, requestParams, {
//         withCredentials: true,
//       });
//       const { recordsTotal, recordsFiltered, data } = response.data;
//       console.log(data);
//       setBookings(data); // Update the displayed bookings
//       console.log("fetchdata running");

//       // Pass the processed data back to DataTables
//       if (callback) {
//         callback({
//           draw,
//           recordsTotal,
//           recordsFiltered,
//           data,
//         });
//       }
//       setFilter(false);
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message?.description || "An error occurred.";
//       console.log(errorMessage);
//       errorToast(errorMessage, {
//         position: "top-right",
//       });

//       if (callback) {
//         callback({
//           draw,
//           recordsTotal: 0,
//           recordsFiltered: 0,
//           data: [],
//         });
//       }
//       setBookings([]);
//       setFilter(false);
//     }
//   },
//   [usertype, department, year, month, axiosInstance]
// );

// The fetchData function now uses refs for month, year, and department
// const fetchData = useCallback(
//   async (data, callback) => {
//     const {
//       draw = 1,
//       start = 0,
//       length = 10,
//       search = { value: "" },
//       order = [{ column: 0, dir: "asc" }],
//     } = data || {};

//     // Using refs for department, year, and month
//     const department = departmentRef.current;
//     const year = yearRef.current;
//     const month = monthRef.current;

//     const url =
//       usertype === "Employee"
//         ? `/booking/employee?dept=${department}&year=${year}&month=${month}`
//         : `/booking/rise?year=${year}&month=${month}`;

//     const sortColumn = order?.[0]?.column || 0;
//     const sortDirection = order?.[0]?.dir || "asc";

//     const requestParams = {
//       draw,
//       start,
//       length,
//       search: search?.value || "",
//       sortColumn,
//       sortDirection,
//     };

//     try {
//       const response = await axiosInstance.post(url, requestParams, {
//         withCredentials: true,
//       });
//       const { recordsTotal, recordsFiltered, data } = response.data;
//       setBookings(data); // Update the displayed bookings

//       if (callback) {
//         callback({
//           draw,
//           recordsTotal,
//           recordsFiltered,
//           data,
//         });
//       }
//       setFilter(false);
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message?.description || "An error occurred.";
//       errorToast(errorMessage, { position: "top-right" });

//       if (callback) {
//         callback({
//           draw,
//           recordsTotal: 0,
//           recordsFiltered: 0,
//           data: [],
//         });
//       }
//       setBookings([]);
//       setFilter(false);
//     }
//   },
//   [usertype, axiosInstance] // Removed month, year, department from dependencies
// );

// useEffect(() => {
//   if (filter) {
//     fetchData();
//   }
// }, [fetchData, filter,usertype]);

// const FilterForm = () => {
//   return (
//     <div className="form-group mt-2">
//       <div className="container-right col-lg-6 col-12 d-flex flex-row align-items-center float-start">
//         <select
//           className="form-select form-select-lg m-1 border-1 rounded-3"
//           onChange={(e) => departmentRef.current = e.target.value}
//           value={departmentRef.current}
//           disabled={usertype === "Rise"}
//         >
//           <option value="All">All</option>
//           <option value="QA">QA</option>
//           <option value="Analytics">Analytics</option>
//           <option value="BA">BA</option>
//           <option value="FrontEnd">FrontEnd</option>
//           <option value="Backend nodejs">Backend nodejs</option>
//           <option value="Backend Java">Backend Java</option>
//         </select>
//         <select
//           className="form-select form-select-lg m-1 border-1 rounded-3"
//           onChange={(e) => yearRef.current = e.target.value}
//           value={yearRef.current}
//         >
//           <option value="2025">2025</option>
//           <option value="2024">2024</option>
//           <option value="2023">2023</option>
//           <option value="2022">2022</option>
//         </select>
//         <select
//           className="form-select form-select-lg m-1 border-1 rounded-3"
//           value={monthRef.current}
//           onChange={(e) => {
//             if (e.target.value === "All") {
//               monthRef.current = "";
//             } else {
//               monthRef.current = e.target.value;
//             }
//           }}
//         >
//           {MonthNames.map((monthName, index) => (
//             <option key={index} value={monthName}>
//               {monthName}
//             </option>
//           ))}
//         </select>

//         <button
//           className="btn btn-danger btn-lg"
//           onClick={() => setFilter(true)}
//         >
//           Filter
//         </button>
//         <div ref={buttonsRef} className="buttons-container m-1"></div>
//       </div>
//     </div>
//   );
// };
