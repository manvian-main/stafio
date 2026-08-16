/**
 * formatDate — Global date formatter
 * Reads user's date format preference from localStorage (set by SettingsContext).
 * Only applies the custom format when dateFormatEnabled === "true".
 *
 * Usage:
 *   import { formatDate } from "../../../utils/dateFormat";
 *   formatDate("2026-03-19")        // → "19/03/2026" or "03/19/2026"
 *   formatDate("19 Mar 2026")       // → handles "DD Mon YYYY" too
 *
 * @param {string|Date} dateStr - Date string or Date object
 * @param {string} [overrideFormat] - Optional format override
 * @returns {string}
 */
export const formatDate = (dateStr, overrideFormat) => {
  if (!dateStr) return "";

  // Respect the toggle — if disabled, return original string as-is
  const enabled = localStorage.getItem("dateFormatEnabled") === "true";
  if (!enabled && !overrideFormat) return String(dateStr);

  const format =
    overrideFormat || localStorage.getItem("dateFormat") || "DD/MM/YYYY";

  let d;
  if (dateStr instanceof Date) {
    d = dateStr;
  } else {
    d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // Try parsing "DD Mon YYYY" → e.g. "19 Mar 2026"
      const months = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      };
      const parts = String(dateStr).trim().split(/[\s\-\/]/);
      if (parts.length === 3) {
        const day   = parseInt(parts[0]);
        const month = months[parts[1]?.toLowerCase().slice(0, 3)];
        const year  = parseInt(parts[2]);
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
          d = new Date(year, month, day);
        }
      }
      if (!d || isNaN(d.getTime())) return String(dateStr);
    }
  }

  const day   = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year  = d.getFullYear();

  switch (format) {
    case "MM/DD/YYYY": return `${month}/${day}/${year}`;
    case "YYYY/MM/DD": return `${year}/${month}/${day}`;
    case "YYYY-MM-DD": return `${year}-${month}-${day}`;
    case "DD-MM-YYYY": return `${day}-${month}-${year}`;
    default:           return `${day}/${month}/${year}`; // DD/MM/YYYY
  }
};

export const getDateFormat = () =>
  localStorage.getItem("dateFormat") || "DD/MM/YYYY";

export const isDateFormatEnabled = () =>
  localStorage.getItem("dateFormatEnabled") === "true";
