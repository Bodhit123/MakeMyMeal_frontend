import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const tableInstanceRef = useRef(null);
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

  const fetchTableData = useCallback(
    async (data, callback, url, setFilter) => {
      try {
        const searchTerm = data.search?.value || "";

        const response = await axiosInstance.post(
          url,
          {
            ...data,
            search: searchTerm,
          },
          { withCredentials: true }
        );

        const {
          data: records,
          recordsTotal,
          recordsFiltered,
          draw,
        } = response.data;

        if (recordsFiltered === 0) {
          errorToast("No data available for the selected filters.", {
            position: "top-right",
          });
        }

        callback({
          data: records,
          recordsTotal,
          recordsFiltered,
          draw,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        errorToast("Error fetching data", { position: "top-right" });

        callback({
          data: [],
          recordsTotal: 0,
          recordsFiltered: 0,
        });
      } finally {
        if (tableInstanceRef.current) {
          setFilter(false);
        }
      }
    },
    [axiosInstance]
  );

  const hasFiltersChanged =
    prevValuesRef.current.department !== department ||
    prevValuesRef.current.year !== year ||
    prevValuesRef.current.month !== month;

  const toggleMonthColumnVisibility = (tableInstance, shouldShow) => {
    const monthColIndex = getColumns(usertype).findIndex(
      (col) => col.title === "Month"
    );
    if (monthColIndex !== -1) {
      tableInstance.column(monthColIndex).visible(shouldShow);
    }
  };

  useEffect(() => {
    const tableElement = $(tableRef.current);
    const url =
      usertype === "Employee"
        ? `/booking/employee?dept=${department}&year=${year}&month=${month}`
        : `/booking/rise?year=${year}&month=${month}`;

    if (hasFiltersChanged || tableInstanceRef.current?.usertype !== usertype) {
      prevValuesRef.current = { department, year, month };
    } else {
      return;
    }

    if ($.fn.dataTable.isDataTable(tableElement)) {
      const tableInstance = tableInstanceRef.current?.tableInstance;
      if (tableInstance && tableInstanceRef.current?.usertype !== usertype) {
        tableInstance.destroy();
        tableInstanceRef.current = null;
      }
    }

    if (!tableInstanceRef.current) {
      const table = tableElement.DataTable({
        destroy: true,
        autoWidth: false,
        serverSide: true,
        processing: true,
        responsive: true,
        ajax: async (data, callback) => {
          fetchTableData(data, callback, url, setFilter);
        },
        columns: getColumns(usertype),
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
          const tableContainer = $(api.table().container());

          if (api.rows().count() === 0) {
            tableContainer.find(".dt-info").hide();
            tableContainer.find(".dt-length").hide();
            tableContainer.find(".dt-pager").hide();
          } else {
            tableContainer.find(".dt-info").show();
            tableContainer.find(".dt-length").show();
            tableContainer.find(".dt-pager").show();
          }
        },
        initComplete: function () {
          if (buttonsRef.current) {
            const buttonContainer = $(buttonsRef.current).find(".dt-buttons");
            if (buttonContainer.length === 0) {
              table.buttons().container().appendTo(buttonsRef.current);
              console.log("Buttons appended during initComplete.");
            }
          }
        },
      });

      if (usertype === "Rise") {
        table.column(3).visible(false);
        table.column(4).visible(false);
      }

      toggleMonthColumnVisibility(table, month === "");

      $("#bookingTable tbody").off("click", "i.bi-trash");
      $("#bookingTable tbody").on("click", "i.bi-trash", function () {
        const rowData = table.row($(this).closest("tr")).data();
        if (rowData) {
          deleteBookingHandler(rowData._id);
        } else {
          console.error("Failed to get row data.");
        }
      });

      tableInstanceRef.current = { tableInstance: table, usertype };
      console.log("New DataTable instance created.");
    } else {
      const tableInstance = tableInstanceRef.current?.tableInstance;
      if (tableInstance) {
        console.log("Reloading data for existing DataTable instance");

        tableInstance.settings()[0].ajax = async (data, callback) => {
          fetchTableData(data, callback, url, setFilter);
        };

        // ✅ Toggle visibility and force redraw
        toggleMonthColumnVisibility(tableInstance, month === "");
        tableInstance.columns.adjust().draw(false);

        tableInstance.ajax.reload(null, false);
      }
    }

    return () => {
      if (!location.pathname.includes("home")) {
        console.log("Destroying DataTable instance");
        tableInstanceRef.current?.tableInstance.destroy();
        tableInstanceRef.current = null;
      }
    };
  }, [usertype, filter, location.pathname]);

  useEffect(() => {
    const buttonContainer = $(buttonsRef.current).find(".dt-buttons");
    if (!buttonContainer.length) {
      const tableInstance = tableInstanceRef.current?.tableInstance;
      if (tableInstance) {
        if (buttonContainer.length === 0) {
          tableInstance.buttons().container().appendTo(buttonsRef.current);
        }
      }
    }
  }, [filter, usertype, month, year, department]);

  const getColumns = (usertype) => {
    const commonColumns = [
      { title: "Meal Type", data: "BookingCategory" },
      { title: "Total Meals Booked", data: "MealCounts" },
      {
        title: "Month",
        data: "Dates.startDate",
        render: function (data, type, row) {
          const monthName = moment(data).format("MMMM");
          return monthName;
        },
      },
      { title: "Meal Dates", data: null, render: renderMealDates },
      {
        title: "Actions",
        data: null,
        render: function () {
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

// const BookingListAndFilter = ({ usertype }) => {
//   const moment = require("moment");
//   const location = useLocation();
//   const tableRef = useRef(null);
//   const buttonsRef = useRef(null);
//   const axiosInstance = UseAxiosPrivate();
//   const momentRange = extendMoment(moment);
//   const dispatch = useDispatch();
//   const [bookings, setBookings] = useState([]);
//   const [department, setDepartment] = useState("All");
//   const currentDate = new Date();
//   const [year, setYear] = useState(currentDate.getFullYear().toString());
//   const [month, setMonth] = useState("July");
//   const [filter, setFilter] = useState(false);

//note: don't miss to pass draw to callback function
// const fetchTableData = useCallback(
//   async (data, callback, url, setFilter) => {
//     try {
//       const searchTerm = data.search?.value || ""; // Get search input from DataTable

//       const response = await axiosInstance.post(
//         url,
//         {
//           ...data,
//           search: searchTerm, // flatten search value
//         },
//         { withCredentials: true }
//       );

//       // Destructure correctly
//       const {
//         data: records,
//         recordsTotal,
//         recordsFiltered,
//         draw,
//       } = response.data;

//       if (recordsFiltered === 0) {
//         errorToast("No data available for the selected filters.", {
//           position: "top-right",
//         });
//       }

//       // ✅ Ensure callback uses correct filtered/total data
//       callback({
//         data: records,
//         recordsTotal,
//         recordsFiltered,
//         draw,
//       });
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       errorToast("Error fetching data", { position: "top-right" });

//       callback({
//         data: [],
//         recordsTotal: 0,
//         recordsFiltered: 0,
//       });
//     } finally {
//       // Reset filter UI state
//       if (tableInstanceRef.current) {
//         setFilter(false);
//       }
//     }
//   },
//   [axiosInstance]
// );

//   useEffect(() => {
//     const tableElement = $(tableRef.current);
//     const url =
//       usertype === "Employee"
//         ? `/booking/employee?dept=${department}&year=${year}&month=${month}`
//         : `/booking/rise?year=${year}&month=${month}`;

//     // Destroy any existing DataTable instance
//     if ($.fn.dataTable.isDataTable(tableElement)) {
//       tableElement.DataTable().destroy();
//     }

//     const table = tableElement.DataTable({
//       destroy: true,
//       autoWidth: false,
//       serverSide: true,
//       processing: true,
//       responsive: true,
//       ajax: async (data, callback) => {
//         await fetchTableData(data, callback, url);
//       },
//       columns: getColumns(usertype),
//       buttons: [
//         {
//           extend: "csv",
//           text: '<i class="bi bi-download fs-3"></i>',
//           className: "btn btn-primary",
//           title: "Bookings Data",
//         },
//       ],
//       language: {
//         info: "_START_ - _END_ of _TOTAL_ items",
//       },
//       lengthMenu: [3, 5, 10, 20, 25],
//       drawCallback: function () {
//         const api = this.api();
//         const tableContainer = $(api.table().container());
//         if (api.rows().count() === 0) {
//           tableContainer.find(".dt-info").hide();
//           tableContainer.find(".dt-length").hide();
//           tableContainer.find(".dt-pager").hide();
//         } else {
//           tableContainer.find(".dt-info").show();
//           tableContainer.find(".dt-length").show();
//           tableContainer.find(".dt-pager").show();
//         }

//         const monthCol = api.column("month:name");
//         if (monthCol.length && month !== "") {
//           monthCol.visible(false);
//         }
//       },
//       initComplete: function () {
//         const api = this.api();
//         const monthCol = api.column("month:name");
//         if (monthCol.length && month !== "") {
//           monthCol.visible(false);
//         }
//         if (buttonsRef.current) {
//           const buttonContainer = $(buttonsRef.current).find(".dt-buttons");
//           if (buttonContainer.length === 0) {
//             api.buttons().container().appendTo(buttonsRef.current);
//           }
//         }
//       },
//     });

//     if (usertype === "Rise") {
//       table.column(3).visible(false);
//       table.column(4).visible(false);
//     }

//     $("#bookingTable tbody").off("click", "i.bi-trash");
//     $("#bookingTable tbody").on("click", "i.bi-trash", function () {
//       const rowData = table.row($(this).closest("tr")).data();
//       if (rowData) {
//         deleteBookingHandler(rowData._id);
//       } else {
//         console.error("Failed to get row data.");
//       }
//     });

//     return () => {
//       if (!location.pathname.includes("home")) {
//         table.destroy();
//       }
//     };
//   }, [usertype, department, year, month, filter]);

//   useEffect(() => {
//     const buttonContainer = $(buttonsRef.current).find(".dt-buttons");
//     if (!buttonContainer.length && $.fn.dataTable.isDataTable($(tableRef.current))) {
//       const tableInstance = $(tableRef.current).DataTable();
//       tableInstance.buttons().container().appendTo(buttonsRef.current);
//     }
//   }, [filter, usertype, month, year, department]);

//   const getColumns = (usertype) => {
//     const commonColumns = [
//       { title: "Meal Type", data: "BookingCategory" },
//       { title: "Total Meals Booked", data: "MealCounts" },
//       {
//         title: "Month",
//         name: "month",
//         data: "Dates.startDate",
//         render: function (data) {
//           return moment(data).format("MMMM");
//         },
//       },
//       { title: "Meal Dates", data: null, render: renderMealDates },
//       {
//         title: "Actions",
//         data: null,
//         render: function () {
//           return `<i class="bi bi-trash"></i>`;
//         },
//       },
//     ];

//     if (usertype === "Employee") {
//       return [
//         { title: "Employee Code", data: "EmployeeDetails[0].emp_code" },
//         { title: "Employee Name", data: "EmployeeDetails[0].emp_name" },
//         { title: "Department", data: "EmployeeDetails[0].dept_name" },
//         ...commonColumns,
//       ];
//     }

//     return [
//       { title: "Booking Category", data: "BookingCategory" },
//       { title: "Meal Counts", data: "MealCounts" },
//       { title: "Notes", data: "Notes" },
//       ...commonColumns,
//     ];
//   };

//   const renderMealDates = (data, type, row) => {
//     const { startDate, endDate } = row.Dates;
//     const monthRange = momentRange.range(
//       moment(startDate).startOf("month"),
//       moment(startDate).endOf("month")
//     );

//     let bookingRange;
//     if (monthRange.contains(moment(endDate))) {
//       bookingRange = momentRange.range(moment(startDate), moment(endDate));
//     } else {
//       bookingRange = momentRange.range(
//         moment(startDate),
//         moment(startDate).endOf("month")
//       );
//     }

//     return Array.from(bookingRange.by("day")).map((d) => d.format("D")).join(", ");
//   };

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

//   const deleteApi = async (id) => {
//     try {
//       const result = await axiosInstance.delete(`/booking/${id}`);
//       const data = result.data;
//       successToast("Booking Deleted Successfully", {
//         position: "top-right",
//         style: { fontSize: "16px", fontWeight: "500" },
//       });
//       setBookings((prev) => prev.filter((booking) => booking._id !== id));
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

//   const FilterForm = () => (
//     <div className="form-group mt-2">
//       <div className="container-right col-lg-6 col-12 d-flex flex-row align-items-center float-start">
//         <select
//           className="form-select form-select-lg m-1 border-1 rounded-3"
//           onChange={(e) => setDepartment(e.target.value)}
//           value={department}
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
//           onChange={(e) => setYear(e.target.value)}
//           value={year}
//         >
//           <option value="2025">2025</option>
//           <option value="2024">2024</option>
//           <option value="2023">2023</option>
//           <option value="2022">2022</option>
//         </select>
//         <select
//           className="form-select form-select-lg m-1 border-1 rounded-3"
//           value={month}
//           onChange={(e) => setMonth(e.target.value === "All" ? "" : e.target.value)}
//         >
//           {MonthNames.map((monthName, index) => (
//             <option key={index} value={monthName}>
//               {monthName}
//             </option>
//           ))}
//         </select>
//         <button className="btn btn-danger btn-lg" onClick={() => setFilter(true)}>
//           Filter
//         </button>
//         <div ref={buttonsRef} className="buttons-container m-1"></div>
//       </div>
//     </div>
//   );

//   return (
//     <div>
//       <FilterForm />
//       <section className="mt-2">
//         <table
//           id="bookingTable"
//           ref={tableRef}
//           className="table table-responsive dataTable nowrap table-hover mt-3"
//         >
//           <thead className="bg-light"></thead>
//           <tbody></tbody>
//         </table>
//       </section>
//     </div>
//   );
// };

// export default BookingListAndFilter;
