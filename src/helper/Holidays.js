// Function to generate a range disabling weekends
export const startOfWeekend = function (date) {
  return date.getDay() === 0; // Disable Sundays
};

export const HolidaysAndWeekends = [
  {
    from: "2024-06-10",
    to: "2024-06-20",
  },
  {
    from: "2024-06-22",
    to: "2024-06-24",
  },
  "2024-06-28",
  function (date) {
    return date.getDay() === 0; // Disable Sundays
  },
]

//function to return Array of disabledDates
export const convertToArray = (startDate, endDate, dateArray) => {
  const ArrayOfDatesSet = new Set(); // Use a set to store unique dates as strings

  dateArray.forEach((range) => {
    if (typeof range === "function") {
      const newdate = new Date(startDate);
      while (newdate <= endDate) {
        if (range(newdate)) {
          ArrayOfDatesSet.add(newdate.toISOString().split("T")[0]);
        }
        newdate.setDate(newdate.getDate() + 1);
      }
    } else if (typeof range === "object") {
      const fromDate = new Date(range.from);
      const toDate = new Date(range.to);
      const currentDate = new Date(fromDate);
      while (currentDate <= toDate) {
        ArrayOfDatesSet.add(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      ArrayOfDatesSet.add(new Date(range).toISOString().split("T")[0]);
    }
  });

  // Convert the set back to an array and sort it
  const uniqueDatesArray = Array.from(ArrayOfDatesSet).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // console.log(uniqueDatesArray);
  return uniqueDatesArray;
};

// console.log(
//   convertToArray(new Date("2024-05-01"), new Date("2024-06-25"), HolidaysAndWeekends)
// );

// Here start and end dates will be of the booking document when user clicks on the book button
export const countValidDates = (startDate, endDate, disabledDates) => {
  let count = 0;
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (!isDisabledDate(currentDate, disabledDates)) {
      count++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count + 1;
};

// Function to check if a date is disabled
const isDisabledDate = (date, disabledDates) => {
  return disabledDates.some((disabledDate) => {
    if (
      typeof disabledDate === "object" &&
      disabledDate !== null &&
      disabledDate instanceof Date
    ) {
      return date.getTime() === disabledDate.getTime();
    } else if (typeof disabledDate === "object") {
      return (
        date >= new Date(disabledDate.from) && date <= new Date(disabledDate.to)
      );
    } else if (typeof disabledDate === "function") {
      return disabledDate(date);
    } else {
      return false; // Invalid disabled date format
    }
  });
};

// const startOfWeekend = function (date) {
//   return date.getDay() === 0; // Disable Sundays
// };

// export const HolidaysAndWeekends = [
//   {
//     from: "2025-05-01",
//     to: "2025-06-01",
//   },
//   {
//     from: "2025-09-01",
//     to: "2025-10-01",
//   },
//   "2024-05-13",
//   startOfWeekend,
// ];

// export const countValidDates = (startDate, endDate, disabledDates) => {
//   let count = 0;
//   let currentDate = new Date(startDate);

//   // Filter disabledDates that fall within the given month
//   const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
//   const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

//   const relevantDisabledDates = disabledDates.filter((disabledDate) => {
//     if (typeof disabledDate === "object" && disabledDate !== null && disabledDate instanceof Date) {
//       return disabledDate >= monthStart && disabledDate <= monthEnd;
//     } else if (typeof disabledDate === "object") {
//       return (
//         (new Date(disabledDate.from) <= monthEnd && new Date(disabledDate.to) >= monthStart)
//       );
//     } else if (typeof disabledDate === "function") {
//       return true; // Keep functions as they need to be checked dynamically
//     } else {
//       return false; // Invalid disabled date format
//     }
//   });

//   while (currentDate <= endDate) {
//     if (!isDisabledDate(currentDate, relevantDisabledDates)) {
//       count++;
//     }

//     currentDate.setDate(currentDate.getDate() + 1);
//   }

//   return count + 1;
// };

// // Function to check if a date is disabled
// export const isDisabledDate = (date, disabledDates) => {
//   return disabledDates.some((disabledDate) => {
//     if (typeof disabledDate === "object" && disabledDate !== null && disabledDate instanceof Date) {
//       return date.getTime() === disabledDate.getTime();
//     } else if (typeof disabledDate === "object") {
//       return (
//         date >= new Date(disabledDate.from) && date <= new Date(disabledDate.to)
//       );
//     } else if (typeof disabledDate === "function") {
//       return disabledDate(date);
//     } else {
//       return false; // Invalid disabled date format
//     }
//   });
// };
