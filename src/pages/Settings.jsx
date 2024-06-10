import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment";
import flatpickr from "flatpickr";
import rangePlugin from "flatpickr/dist/plugins/rangePlugin";
import { BaseUrl } from "../helper/Constant";
import { startOfWeekend } from "../helper/Holidays";
import { AuthContext } from "../Contexts/AuthContext";
import { selectDisabledDates, setDisabledDates } from "../app/disabledSlice";
import { successToast, errorToast } from "../components/Toast";
import $ from "jquery";


const Settings = () => {
  const dispatch = useDispatch();
  const [updateFlag, setUpdateFlag] = useState(false);
  const [id, setId] = useState("");
  const [listPerPage] = useState(3);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const token = useContext(AuthContext).authData?.token;
  const [disabledList, setDisabledList] = useState(
    useSelector(selectDisabledDates)
  ); //This is for showing in the Table
  const [formData, setFormData] = useState({
    Dates: {
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    },
    Reason: "",
    MealType: [],
  });
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  function resetForm() {
    setFormData({
      Dates: {
        startDate: null,
        endDate: null,
      },
      Reason: "",
      MealType: [],
    });
  }
  //This is for flatpickr disable property
  const disableDates = useSelector(selectDisabledDates).map((doc) => ({
    from: moment(doc.Dates.from).format("YYYY-MM-DD"),
    to: moment(doc.Dates.to).format("YYYY-MM-DD"),
  }));

  useEffect(() => {
    flatpickr("#dateStart", {
      plugins: [new rangePlugin({ input: "#dateEnd" })],
      minDate: "today",
      disable: [...disableDates, startOfWeekend],
      altInput: true,
      altFormat: "F j, Y",
      mode: "range",
      dateFormat: "Y-m-d", // Set the date display format
      onChange: (selectedDates,dateStr,Instance) => {
        const start = new Date(selectedDates[0]);
        const end = new Date(dateStr);
        setFormData((prev) => ({
          ...prev,
          Dates: {
            startDate: start,
            endDate: end,
          },
        }));
      },
    });
  }, [disableDates]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BaseUrl}/settings/dates/add`,
        formData,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = response.data;
      successToast("Setting added Successfully", {
        position: "top-right",
        style: { fontSize: "16px", fontWeight: "500" },
      });
      setDisabledList([...disabledList, result.data.setting]);
      setIsOpen(false);
    } catch (error) {
      errorToast(
        error.response?.data.message.description || "Failed to submit form",
        { position: "top-right" }
      );
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === "checkbox") {
      const updatedMealType = checked
        ? [...formData.MealType, name]
        : formData.MealType.filter((item) => item !== name);
      setFormData((prevData) => ({
        ...prevData,
        MealType: updatedMealType,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const updateSettingHandler = (id) => {
    setIsOpen(true);
    setUpdateFlag(true);
    setId(id);
    const item = disabledList.find((doc) => doc._id === id);
    const { Dates, Reason, MealType } = item;
    setFormData({
      Dates: {
        startDate: Dates.from,
        endDate: Dates.to,
      },
      Reason: Reason,
      MealType: [...MealType],
    });
  };

  const UpdateApi = async (id) => {
    try {
      const response = await axios.put(
        `${BaseUrl}/settings/dates/update/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = response.data;
      setDisabledList((prev) =>
        prev.map((item) =>
          item._id === id ? result.data.DisableDocument : item
        )
      );
      successToast("Setting updated Successfully", {
        position: "top-right",
      });
      setUpdateFlag(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating setting :", error);
      errorToast(
        error.response?.data.message.description || "Failed to update form",
        { position: "top-right" }
      );
    }
  };

  const deleteSettingHandler = async (id) => {
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
          text: "Your setting has been deleted.",
          icon: "success",
        });
        deleteApi(id);
      }
    });
  };

  const deleteApi = async (id) => {
    try {
      await axios.delete(`${BaseUrl}/settings/dates/remove/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setDisabledList(disabledList.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting setting :", error);
      Swal.fire({
        title: "Error!",
        text: "Deletion failed. Please try again.",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    const table = $("#settingTable").DataTable({
      data: disabledList,
      responsive: true,
      language: {
        info: "_START_  -  _END_ of _TOTAL_ items",
      },
      lengthMenu: [3, 5, 10, 20, 25],
      columns: [
        {
          data: "Dates",
          render: function (data) {
            if (data.from !== data.to) {
              return (
                moment(data.from).format("DD/MM/YYYY, dddd") +
                " - " +
                moment(data.to).format("DD/MM/YYYY, dddd")
              );
            } else {
              return moment(data.to).format("DD/MM/YYYY, dddd");
            }
          },
        },
        { data: "Reason" },
        { data: "MealType", render: (data) => data.join(" & ") },
        {
          data: null,
          render: (data, type, row) => `
            <i class="bi bi-trash delete-btn" data-id="${data._id}"></i>
            &nbsp;&nbsp;
            <i class="bi bi-pen-fill update-btn" style="cursor: pointer;" data-id="${data._id}"></i>
          `,
        },
      ],
    });
    table.on("draw", () => {
      $("#settingTable tbody tr").css("height", "60px"); // Increase this value to set the desired height
    });
    $("#settingTable tbody tr").css("height", "60px");
    // Handle delete button click
    $("#settingTable tbody").on("click", ".delete-btn", function () {
      const id = $(this).data("id");
      deleteSettingHandler(id);
    });
    // Handle update button click
    $("#settingTable tbody").on("click", ".update-btn", function () {
      const id = $(this).data("id");
      updateSettingHandler(id);
    });

    // Cleanup function to remove event listeners when the component is unmounted
    return () => {
      // Remove all event listeners related to delete and update buttons
      $("#settingTable tbody").off("click", ".delete-btn");
      $("#settingTable tbody").off("click", ".update-btn");

      // Destroy the DataTable instance
      table.destroy();
    };
  }, [disabledList]);

  return (
    <div>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <Navbar />
        </div>
      </nav>
      <div className="container-fluid">
        <div className="container pt-30 mb-1">
          <div className="container-head">
            <div className="container-left">
              <h3 className="container-title">Configure Calendar</h3>
            </div>
            <button
              className="btn btn-primary float-end"
              type="button"
              onClick={() => setIsOpen(true)}
            >
              Add Date
            </button>
          </div>

          <h5
            className="float-start mt-2"
            style={{
              position: "relative",
              top: "0",
            }}
          >{`Total counts: ${disabledList.length}`}</h5>
          <section className="container-fluid mt-3">
            <table
              id="settingTable"
              className="table table-responsive dataTable nowrap table-hover"
            >
              <thead className="bg-light">
                <tr>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Disable Meal Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </section>
          {/* <ul className="pagination">
            {Array.from({
              length: Math.ceil(disabledList.length / listPerPage),
            }).map((_, index) => (
              <li
                key={index}
                className={`page-item ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                <button
                  onClick={() => {
                    paginate(index + 1);
                  }}
                  className="page-link"
                >
                  {index + 1}
                </button>
              </li>
            ))}
          </ul> */}
        </div>
      </div>
      <Footer />
      {/* Modal Start Add date*/}
      {isOpen && (
        <div
          className="modal show fade d-block"
          id="changepwdModal"
          aria-labelledby="exampleModalLabel"
          aria-hidden={!isOpen}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Add Disable Date
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    setIsOpen(false);
                    setUpdateFlag(false);
                    resetForm();
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <form className="modal-body">
                <div className="form-group">
                  <label>Select Date (s)</label>
                  <div className="input-group date-picker-input">
                    <input
                      type="text"
                      className="form-control border-right-0"
                      placeholder="Start Date"
                      id="dateStart"
                    />
                    <input
                      type="text"
                      className="form-control border-right-0"
                      placeholder="End Date"
                      id="dateEnd"
                    />
                    <div className="input-group-append bg-transparent">
                      <span
                        className="input-group-text bg-transparent"
                        id="basic-addon2"
                      >
                        <i className="icon-calendar"></i>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="exampleInput2">
                    Reason<span className="extric">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="Reason"
                    value={formData.Reason}
                    className="form-control"
                    id="exampleInput2"
                    onChange={(e) => handleChange(e)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="exampleInput3">
                    Disable Meal Type<span className="extric">*</span>
                  </label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="disableDinner"
                      name="dinner"
                      checked={formData.MealType.includes("dinner")}
                      onChange={(e) => handleChange(e)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="disableBreakfast"
                    >
                      Dinner
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="disableLunch"
                      name="lunch"
                      checked={formData.MealType.includes("lunch")}
                      onChange={(e) => handleChange(e)}
                    />
                    <label className="form-check-label" htmlFor="disableLunch">
                      Lunch
                    </label>
                  </div>
                </div>
              </form>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={() => {
                    setIsOpen(false);
                    setUpdateFlag(false);
                    resetForm();
                  }}
                >
                  Close
                </button>
                {updateFlag ? (
                  <button
                    type="submit"
                    className="btn btn-success"
                    onClick={(e) => UpdateApi(id)}
                  >
                    Update
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={(e) => handleSubmit(e)}
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

// import React, { useState, useEffect, useContext } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import Footer from "../components/Footer";
// import Navbar from "../components/Navbar";
// import axios from "axios";
// import Swal from "sweetalert2";
// import moment from "moment";
// import flatpickr from "flatpickr";
// import rangePlugin from "flatpickr/dist/plugins/rangePlugin";
// import { BaseUrl } from "../helper/Constant";
// import { startOfWeekend } from "../helper/Holidays";
// import { AuthContext } from "../Contexts/AuthContext";
// import { selectDisabledDates, setDisabledDates } from "../app/disabledSlice";
// import { successToast, errorToast } from "../components/Toast";

// const Settings = () => {
//   const dispatch = useDispatch();
//   const [updateFlag, setUpdateFlag] = useState(false);
//   const [id, setId] = useState("");
//   const [listPerPage] = useState(3);
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const token = useContext(AuthContext).authData?.token;
//   const [disabledList, setDisabledList] = useState(
//     useSelector(selectDisabledDates)
//   ); //This is for showing in the Table
//   const [formData, setFormData] = useState({
//     Dates: {
//       startDate: new Date().toISOString(),
//       endDate: new Date().toISOString(),
//     },
//     Reason: "",
//     MealType: [],
//   });
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);
//   function resetForm() {
//     setFormData({
//       Dates: {
//         startDate: null,
//         endDate: null,
//       },
//       Reason: "",
//       MealType: [],
//     });
//   }
//   //This is for flatpickr disable property
//   const disableDates = useSelector(selectDisabledDates).map((doc) => ({
//     from: moment(doc.Dates.from).format("YYYY-MM-DD"),
//     to: moment(doc.Dates.to).format("YYYY-MM-DD"),
//   }));

//   useEffect(() => {
//     flatpickr("#dateStart", {
//       plugins: [new rangePlugin({ input: "#dateEnd" })],
//       minDate: "today",
//       disable: [...disableDates, startOfWeekend],
//       altInput: true,
//       altFormat: "F j, Y",
//       mode: "range",
//       dateFormat: "Y-m-d", // Set the date display format
//       onChange: (selectedDates,dateStr,Instance) => {
//         const start = new Date(selectedDates[0]);
//         const end = new Date(dateStr);
//         setFormData((prev) => ({
//           ...prev,
//           Dates: {
//             startDate: start,
//             endDate: end,
//           },
//         }));
//       },
//     });
//   }, [disableDates]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(
//         `${BaseUrl}/settings/dates/add`,
//         formData,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const result = response.data;
//       successToast("Setting added Successfully", {
//         position: "top-right",
//         style: { fontSize: "16px", fontWeight: "500" },
//       });
//       resetForm();
//       setDisabledList([...disabledList, result.data.setting]); // Spread operator for immutability
//       dispatch(setDisabledDates(disabledList));
//       setIsOpen(false);
//     } catch (error) {
//       errorToast(
//         error.response?.data.message.description || "Failed to submit form",
//         { position: "top-right" }
//       );
//     }
//   };

//   const handleChange = (event) => {
//     const { name, value, type, checked } = event.target;
//     if (type === "checkbox") {
//       const updatedMealType = checked
//         ? [...formData.MealType, name] // Add selected meal type
//         : formData.MealType.filter((item) => item !== name); // Remove deselected type
//       setFormData((prevData) => ({
//         ...prevData,
//         MealType: updatedMealType,
//       }));
//     } else {
//       setFormData((prevData) => ({
//         ...prevData,
//         [name]: value,
//       }));
//     }
//   };

//   const updateSettingHandler = async (id) => {
//     setIsOpen(true);
//     setUpdateFlag(true);
//     setId(id);
//     const item = disabledList.find((doc) => doc._id === id);
//     const { Dates, Reason, MealType } = item;
//     setFormData({
//       Dates: {
//         startDate: Dates.from,
//         endDate: Dates.to,
//       },
//       Reason: Reason,
//       MealType: [...MealType],
//     });
//   };

//   const UpdateApi = async (id) => {
//     try {
//       const response = await axios.put(
//         `${BaseUrl}/settings/dates/update/${id}`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const result = response.data;
//       setDisabledList((prev) =>
//         prev.map((item) =>
//           item._id === id ? result.data.DisableDocument : item
//         )
//       );
//       successToast("Setting updated Successfully", {
//         position: "top-right",
//       });
//       setUpdateFlag(false);
//       setIsOpen(false);
//     } catch (error) {
//       console.error("Error updating setting :", error);
//       errorToast(
//         error.response?.data.message.description || "Failed to update form",
//         { position: "top-right" }
//       );
//     }
//   };

//   const deleteSettingHandler = async (id) => {
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
//           text: "Your setting has been deleted.",
//           icon: "success",
//         });
//         deleteApi(id);
//       }
//     });
//   };

//   const deleteApi = async (id) => {
//     try {
//       await axios.delete(`${BaseUrl}/settings/dates/remove/${id}`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setDisabledList(disabledList.filter((item) => item._id !== id));
//     } catch (error) {
//       console.error("Error deleting setting :", error);
//       Swal.fire({
//         title: "Error!",
//         text: "Deletion failed. Please try again.",
//         icon: "error",
//       });
//     }
//   };
//   let currentDisabledList = [];
//   // Get current disabled list
//   if (disabledList.length > 0) {
//     const indexOfLast = currentPage * listPerPage;
//     const indexOfFirst = indexOfLast - listPerPage;
//     currentDisabledList = disabledList.slice(indexOfFirst, indexOfLast);
//   }
//   console.log(formData);
//   return (
//     <div>
//       <nav className="navbar navbar-expand-lg fixed-top">
//         <div className="container-fluid">
//           <Navbar />
//         </div>
//       </nav>
//       <div className="container-fluid">
//         <div className="container pt-30 mb-1">
//           <div className="container-head">
//             <div className="container-left mb-2">
//               <h3 className="container-title">Configure Calendar</h3>
//             </div>
//             <button
//               className="btn btn-primary float-end"
//               type="button"
//               onClick={() => setIsOpen(true)}
//             >
//               Add Date
//             </button>
//           </div>
//           <div
//             className="search-wrapper col-sm-6 col-lg-2"
//             style={{ maxWidth: "40%", minWidth: "21%" }}
//           >
//             <input
//               type="text"
//               name="searchBox"
//               className="form-control"
//               placeholder="Filter"
//               // value={search}
//               // onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//           <h5
//             className="float-end mt-0"
//             style={{
//               position: "relative",
//               top: "-28px",
//             }}
//           >{`Total counts: ${disabledList.length}`}</h5>
//           {/* <BookingList /> */}
//           <section className="container-fluid mt-3">
//             <table className="table table-responsive dataTable nowrap table-hover">
//               <thead className="bg-light">
//                 <tr>
//                   <th>Date</th>
//                   <th>Reason</th>
//                   <th>Disable Meal Type</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {disabledList &&
//                   disabledList.length > 0 &&
//                   currentDisabledList.map((item, index) => (
//                     <tr key={index}>
//                       <td>
//                         {item.Dates.from !== item.Dates.to
//                           ? moment(item.Dates.from).format("DD/MM/YYYY, dddd") +
//                             " - " +
//                             moment(item.Dates.to).format("DD/MM/YYYY, dddd")
//                           : moment(item.Dates.to).format("DD/MM/YYYY, dddd")}
//                       </td>
//                       <td>{item.Reason}</td>
//                       <td>{item.MealType.map((si) => si).join(" & ")}</td>
//                       <td>
//                         <i
//                           className="bi bi-trash"
//                           onClick={(e) => deleteSettingHandler(item._id)}
//                         ></i>
//                         &nbsp;&nbsp;
//                         <i
//                           className="bi bi-pen-fill"
//                           style={{ cursor: "pointer" }}
//                           onClick={(e) => updateSettingHandler(item._id)}
//                         ></i>
//                       </td>
//                     </tr>
//                   ))}
//               </tbody>
//             </table>
//           </section>
//           <ul className="pagination">
//             {Array.from({
//               length: Math.ceil(disabledList.length / listPerPage),
//             }).map((_, index) => (
//               <li
//                 key={index}
//                 className={`page-item ${
//                   currentPage === index + 1 ? "active" : ""
//                 }`}
//               >
//                 <button
//                   onClick={() => {
//                     paginate(index + 1);
//                   }}
//                   className="page-link"
//                 >
//                   {index + 1}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//       <Footer />
//       {/* Modal Start Add date*/}
//       {isOpen && (
//         <div
//           className="modal show fade d-block"
//           id="changepwdModal"
//           aria-labelledby="exampleModalLabel"
//           aria-hidden={!isOpen}
//         >
//           <div className="modal-dialog modal-dialog-centered" role="document">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title" id="exampleModalLabel">
//                   Add Disable Date
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   data-dismiss="modal"
//                   aria-label="Close"
//                   onClick={() => {
//                     setIsOpen(false);
//                     resetForm();
//                   }}
//                 >
//                   <span aria-hidden="true">&times;</span>
//                 </button>
//               </div>

//               <form className="modal-body">
//                 <div className="form-group">
//                   <label>Select Date (s)</label>
//                   <div className="input-group date-picker-input">
//                     <input
//                       type="text"
//                       className="form-control border-right-0"
//                       placeholder="Start Date"
//                       id="dateStart"
//                     />
//                     <input
//                       type="text"
//                       className="form-control border-right-0"
//                       placeholder="End Date"
//                       id="dateEnd"
//                     />
//                     <div className="input-group-append bg-transparent">
//                       <span
//                         className="input-group-text bg-transparent"
//                         id="basic-addon2"
//                       >
//                         <i className="icon-calendar"></i>
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="exampleInput2">
//                     Reason<span className="extric">*</span>
//                   </label>
//                   <input
//                     required
//                     type="text"
//                     name="Reason"
//                     value={formData.Reason}
//                     className="form-control"
//                     id="exampleInput2"
//                     onChange={(e) => handleChange(e)}
//                   />
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="exampleInput3">
//                     Disable Meal Type<span className="extric">*</span>
//                   </label>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="disableDinner"
//                       name="dinner"
//                       checked={formData.MealType.includes("dinner")}
//                       onChange={(e) => handleChange(e)}
//                     />
//                     <label
//                       className="form-check-label"
//                       htmlFor="disableBreakfast"
//                     >
//                       Dinner
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="disableLunch"
//                       name="lunch"
//                       checked={formData.MealType.includes("lunch")}
//                       onChange={(e) => handleChange(e)}
//                     />
//                     <label className="form-check-label" htmlFor="disableLunch">
//                       Lunch
//                     </label>
//                   </div>
//                   {/* <div className="error-block">Error display here</div> */}
//                 </div>
//               </form>

//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   data-dismiss="modal"
//                   onClick={() => {
//                     setIsOpen(false);
//                     setUpdateFlag(false);
//                     resetForm();
//                   }}
//                 >
//                   Close
//                 </button>
//                 {updateFlag ? (
//                   <button
//                     type="submit"
//                     className="btn btn-success"
//                     onClick={(e) => UpdateApi(id)}
//                   >
//                     Update
//                   </button>
//                 ) : (
//                   <button
//                     type="submit"
//                     className="btn btn-primary"
//                     onClick={(e) => handleSubmit(e)}
//                   >
//                     Save
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Settings;
