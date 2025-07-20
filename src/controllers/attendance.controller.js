const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { attendanceService } = require('../services');
const { Attendance } = require('../models');
const moment = require('moment')

const createAttendance = catchAsync(async (req, res) => {
  console.log("controller is working");

  console.log('req.body', req.body)
  // const attendance = await attendanceService.createAttendance({ ...req.body, userId: req.user._id });
  const attendance = await attendanceService.createAttendance(req.body)
  console.log('attendance', attendance)
  res.status(httpStatus.CREATED).send(attendance);
});

const getAttendances = catchAsync(async (req, res) => {
  let createdAt;
  if (req.query.createdAt) {
    const start = new Date(req.query.createdAt);
    start.setHours(0, 0, 0, 0);

    const end = new Date(req.query.createdAt);
    end.setHours(23, 59, 59, 999);
    createdAt = { $gte: start, $lt: end };
  }

  const filter = pick(req.query, ['userId', 'createdAt']);
  if (req.query.createdAt) {
    filter.createdAt = createdAt;
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await attendanceService.queryAttendances(filter, options);
  res.send(result);
});

const getAttendance = catchAsync(async (req, res) => {
  const attendance = await attendanceService.getAttendanceById(req.params.attendanceId);
  if (!attendance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Attendance not found');
  }
  res.send(attendance);
});

const getTodaysAttendance = catchAsync(async (req, res) => {
  console.log('req.body', req.params)
  console.log('req.query', req.query)
  const { userId } = req.query; 
  console.log('userId', userId)
  const today = moment().startOf('day'); 
  const attendance = await Attendance.findOne({
    userId: userId,
    createdAt: { 
      $gte: today.toDate(),
      $lt: moment(today).endOf('day').toDate() 
    },
  });
  console.log('attendance', attendance)

  // if (!attendance) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'No attendance record found for today');
  // }

  res.status(httpStatus.OK).json(attendance);
});


const updateAttendance = catchAsync(async (req, res) => {
  console.log("Update controller");
  const id = req.body.attendanceId
  const user = await attendanceService.updateAttendanceById(id, req.body);
  res.send(user);
});

const deleteAttendance = catchAsync(async (req, res) => {
  await attendanceService.deleteAttendanceById(req.params.attendanceId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createAttendance,
  getAttendances,
  getAttendance,
  getTodaysAttendance,
  updateAttendance,
  deleteAttendance
};
