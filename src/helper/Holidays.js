// Function to generate a range disabling weekends
const startOfWeekend = function (date) {
  return date.getDay() === 0; // Disable Sundays
};

export const HolidaysAndWeekends = [
  {
    from: "2025-05-01",
    to: "2025-06-01",
  },
  {
    from: "2025-09-01",
    to: "2025-10-01",
  },
  "2024-05-13",
  startOfWeekend,
];

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
export const isDisabledDate = (date, disabledDates) => {
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
