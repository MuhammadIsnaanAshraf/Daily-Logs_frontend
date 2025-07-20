const httpStatus = require('http-status');
const { Log } = require('../models');
const ApiError = require('../utils/ApiError');
const fromToDateFilter = require('../utils/fromToDateFilter');

/**
 * Create a log
 * @param {Object} logBody
 * @returns {Promise<Log>}
 */
const createLog = async (logBody) => {
  const attendanceCount = await Log.countDocuments({ userId: logBody.userId, createdAt: fromToDateFilter(new Date()) });
  if (attendanceCount > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Today's Logs already created Please update");
  }
  return Log.create(logBody);
};

/**
 * Query for logs
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryLogs = async (filter, options) => {
  const logs = await Log.paginate(filter, options);
  return logs;
};

/**
 * Get logs by id
 * @param {ObjectId} id
 * @returns {Promise<Log>}
 */
const getLogById = async (id) => {
  return Log.findById(id);
};

/**
 * Update log by id
 * @param {ObjectId} logId
 * @param {Object} updateBody
 * @returns {Promise<Log>}
 */
const updateLogById = async (logId, updateBody) => {
  const log = await getLogById(logId);
  if (!log) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Log not found');
  }
  const hoursPassed = (Date.now() - log.createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursPassed > 24) {
    throw new ApiError(400, 'Logs cannot be updated after 24 hours.');
  }
  // mangage data validation here
  // if (updateBody.email && (await Log.isEmailTaken(updateBody.email, logId))) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  // }
  Object.assign(log, updateBody);
  await log.save();
  return log;
};

/**
 * Delete log by id
 * @param {ObjectId} logId
 * @returns {Promise<Log>}
 */
const deleteLogById = async (logId) => {
  const log = await getLogById(logId);
  if (!log) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Log not found');
  }
  await log.remove();
  return log;
};

module.exports = {
  createLog,
  queryLogs,
  getLogById,
  updateLogById,
  deleteLogById,
};
