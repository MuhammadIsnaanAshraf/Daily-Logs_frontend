const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { logsService } = require('../services');
const { sendEmail, sendEmailWithTemplete } = require('../services/email.service');
const fromToDateFilter = require('../utils/fromToDateFilter');
const { Log } = require('../models');

const createLog = catchAsync(async (req, res) => {
  const log = await logsService.createLog({ ...req.body, userId: req.user._id });
  res.status(httpStatus.CREATED).send(log);
});

const getLogs = catchAsync(async (req, res) => {
  let createdAt;
  if (req.query.createdAt) {
    createdAt = fromToDateFilter(req.query.createdAt);
  }

  const filter = pick(req.query, ['userId', 'createdAt']);
  if (req.query.createdAt) {
    filter.createdAt = createdAt;
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

  console.log('options', filter)
  console.log('options', options)

  const result = await logsService.queryLogs(filter, options);
  res.send(result);
});

const getLog = catchAsync(async (req, res) => {
  const log = await logsService.getLogById(req.params.logId);
  if (!log) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Log not found');
  }
  res.send(log);
});

const getUserTodayLogs =  catchAsync(async (req, res) => {
        const  filter  = pick(req.query, ["userId", "populate"])
        console.log('filters', filter)
        if (!filter.userId) return res.status(400).json({ message: "User ID is required" });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt = {$gte: startOfDay, $lte: endOfDay }
        console.log('filter after modify', filter)

        const logs = await Log.find({
          userId: filter.userId,
          createdAt: filter.createdAt
      }).populate(filter?.populate)
        console.log('logs of the day', logs)
        res.status(200).json({ logs });
});

const getUserPreviousLogs = catchAsync(async (req, res) => {
  console.log("Previous log api");
  
  const filter = pick(req.query, ["userId", "createdAt"]);
  const options = pick(req.query, ["page", "limit", "populate"])
  console.log("filters", filter);
  console.log("options", options);


  if (!filter.userId) {
      return res.status(400).json({ message: "User ID is required" });
  }
  if (filter.createdAt) {
    const date = new Date(filter.createdAt);
    const startOfDay = new Date(date?.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date?.setHours(23, 59, 59, 999));

    filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
}else{
  const date = new Date();
  const startOfDay = new Date(date?.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date?.setHours(23, 59, 59, 999));

  filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
}
  console.log("filter after date", filter.createdAt);

  console.log("filter after modify", filter);

  // // Pagination options
  // const page = parseInt(options.page, 10) || 1;
  // const limit = parseInt(options.limit, 10) || 10;

  const logs = await Log.paginate(filter, options);
  console.log("logs other than today", logs);
  res.status(200).json(logs);
});


const getTodayLogs = catchAsync(async(req, res) => {
  console.log("todays log");
  const today = new Date();
today.setHours(0, 0, 0, 0);
  
const logs = await Log.find({
  createdAt: { $gte: today }, 
});
  console.log('logs', logs)
  res.send(logs)
})

const updateLog = catchAsync(async (req, res) => {
  const user = await logsService.updateLogById(req.params.logId, req.body);
  res.send(user);
});

const deleteLog = catchAsync(async (req, res) => {
  await logsService.deleteLogById(req.params.logId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createLog,
  getLogs,
  getLog,
  getUserTodayLogs,
  getUserPreviousLogs,
  getTodayLogs,
  updateLog,
  deleteLog,
};
