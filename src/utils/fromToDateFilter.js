/**
 * Create an object composed of the picked object properties
 * @param {string} object
 * @returns {Object}
 */
const fromToDateFilter = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { $gte: start, $lt: end };
};

module.exports = fromToDateFilter;
