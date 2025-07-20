const httpStatus = require('http-status');
const { Attendance } = require('../models');
const ApiError = require('../utils/ApiError');
const fromToDateFilter = require('../utils/fromToDateFilter');
const mongoose = require("mongoose")
const moment = require('moment')
const cron = require("node-cron");
/**
 * Create a attendance
 * @param {Object} attendanceBody
 * @returns {Promise<Attendance>}
 */
const createAttendance = async (attendanceBody) => {
  console.log('attendanceBody', attendanceBody)
  // const attendanceCount = await Attendance.countDocuments({ createdAt: fromToDateFilter(new Date()) });
  // if (attendanceCount > 0) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Attandance already Marked Please update');
  // }
  if (attendanceBody.userId) {
    attendanceBody.userId = mongoose.Types.ObjectId(attendanceBody.userId)
  }

  const today = moment().startOf("day"); // Start of today (00:00:00)
  const tomorrow = moment().endOf("day"); // End of today (23:59:59)

  // Check if attendance already exists for the user today
  const existingAttendance = await Attendance.findOne({
    userId: attendanceBody.userId,
    markedAt: { $gte: today.toDate(), $lte: tomorrow.toDate() },
  });

  if (existingAttendance) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Attendance already marked today. Please update instead.");
  }
  console.log('attendance after change', attendanceBody)
  return Attendance.create(attendanceBody);
};

/**
 * Query for attendances
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAttendances = async (filter, options) => {
  const attendances = await Attendance.paginate(filter, options);
  return attendances;
};

/**
 * Get attendanceId by id
 * @param {ObjectId} id
 * @returns {Promise<Attendance>}
 */
const getAttendanceById = async (id) => {
  return Attendance.findById(id);
};

/**
 * Update attendance by id
 * @param {ObjectId} attendanceId
 * @param {Object} updateBody
 * @returns {Promise<Attendance>}
 */
const updateAttendanceById = async (attendanceId, updateBody) => {
  const attendance = await getAttendanceById(attendanceId);
  console.log('attendanceId', attendanceId)
  console.log('attendance for update', attendance)
  if (!attendance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Attendance not found');
  }
  if (attendance.updatedOnce) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Attendance can only be updated once');
  }
  Object.assign(attendance, updateBody);
  await attendance.save();
  return attendance;
};

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running Attendance Auto-Update Job at 12:00 AM");
    const yesterday = moment().subtract(1, "day").startOf("day");
    const todayMidnight = moment().startOf("day").toDate(); 

    const recordsToUpdate = await Attendance.find({
      createdAt: { $gte: yesterday.toDate(), $lt: todayMidnight }, 
      $expr: { $eq: ["$createdAt", "$updatedAt"] },
    });
    if (recordsToUpdate.length > 0) {
      await Attendance.updateMany(
        { _id: { $in: recordsToUpdate.map((record) => record._id) } },
        { $set: { updatedAt: todayMidnight } } 
      );
      console.log(`${recordsToUpdate.length} attendance records updated to 12:00 AM.`);
    } else {
      console.log("No attendance records required updating.");
    }
  } catch (error) {
    console.error("Error in Attendance Auto-Update Job:", error);
  }
});

/**
 * Delete attendance by id
 * @param {ObjectId} attendanceId
 * @returns {Promise<Attendance>}
 */
const deleteAttendanceById = async (attendanceId) => {
  const attendance = await getAttendanceById(attendanceId);
  if (!attendance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Attendance not found');
  }
  await attendance.remove();
  return attendance;
};

module.exports = {
  createAttendance,
  queryAttendances,
  getAttendanceById,
  updateAttendanceById,
  deleteAttendanceById,
};
