/**
 * Formats a date into "YYYY-MM-DD HH:mm:ss" string.
 * Accepts a Date object, timestamp, or date string.
 * @param {Date|string|number} d
 * @returns {string} formatted date
 */
export function formatDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date)) return "";

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const year = date.getFullYear();
  const monthName = monthNames[date.getMonth()];
  const day = date.getDate();
  let hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${monthName} ${day} ${year} - ${hour}-${minute} ${period}`;
}
