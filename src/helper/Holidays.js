
import moment from "moment";

// Weekend disabling function
export const startOfWeekend = function (date) {
  const localDay = moment(date).startOf("day").day();
  return localDay === 0 || localDay === 6;
};

// Array of disabled date ranges, specific dates, and dynamic functions
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
  startOfWeekend,
];

// Converts mixed input into array of disabled "YYYY-MM-DD" strings
export const convertToArray = (startDate, endDate, dateArray) => {
  const ArrayOfDatesSet = new Set();

  dateArray.forEach((range) => {
    if (typeof range === "function") {
      const newdate = new Date(startDate);
      while (newdate <= endDate) {
        if (range(newdate)) {
          ArrayOfDatesSet.add(moment(newdate).format("YYYY-MM-DD"));
        }
        newdate.setDate(newdate.getDate() + 1);
      }
    } else if (typeof range === "object") {
      const fromDate = new Date(range.from);
      const toDate = new Date(range.to);
      const currentDate = new Date(fromDate);
      while (currentDate <= toDate) {
        ArrayOfDatesSet.add(moment(currentDate).format("YYYY-MM-DD"));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      ArrayOfDatesSet.add(moment(new Date(range)).format("YYYY-MM-DD"));
    }
  });

  return Array.from(ArrayOfDatesSet).sort((a, b) => new Date(a) - new Date(b));
};
