const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { projectService } = require('../services');
const { Project } = require('../models');
const {Log} = require("../models")
const mongoose = require ("mongoose");
const { email } = require('../config/config');
const createProject = catchAsync(async (req, res) => {
  const project = await projectService.createProject(req.body);
  res.status(httpStatus.CREATED).send(project);
});

const getProjects = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role', 'name']);
  if (filter.name) {
    filter.name = new RegExp(filter.name, 'i');
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await projectService.queryProjects(filter, options);
  res.send(result);
});

const getProject = catchAsync(async (req, res) => {
  console.log('req.query', req.query)
  console.log(req.params.projectId)
  const filter = pick(req.query, ['populate']);
  if (req.params.projectId) {
    filter.id = req.params.projectIds
  }
  console.log('filter', filter)
  const populateFields = req.query.populate ? req.query.populate.split(',') : [];
  const populateOptions = [];

  // Parsing populate fields dynamically
  populateFields.forEach(field => {
    const parts = field.split('.');

    if (parts.length === 1) {
      // Direct population (e.g., "assignies")
      populateOptions.push({ path: parts[0] });
    } else if (parts.length === 2) {
      // Nested population (e.g., "assignies.value")
      populateOptions.push({ path: parts[0], populate: { path: parts[1] } });
    } else if (parts.length === 3) {
      // Deeply nested population (e.g., "assignies.value.designationId")
      populateOptions.push({
        path: parts[0], // "assignies"
        populate: {
          path: parts[1], // "value"
          populate: { path: parts[2] } // "designationId"
        }
      });
    }
  });

  // Fetching project with dynamic populate
  const project = await Project.findById(req.params.projectId).populate(populateOptions);



  // const project = await Project.findById(req.params.projectId).populate(filter.populate);

  console.log("project id working");
  console.log('project for populate', project)

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }
  res.send(project);
});

const getProjectAssignies = catchAsync(async (req, res) => {
  console.log("Fetching only assignies...");
  console.log("req.query", req.query);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(req.query.id) } }, // Filter by project ID
    { $unwind: "$assignies" }, // Unwind assignies

    // First Lookup: Populate assignies.value (User Details)
    {
      $lookup: {
        from: "users",
        localField: "assignies.value",
        foreignField: "_id",
        as: "populatedValue",
      },
    },
    {
      $addFields: {
        "assignies.value": { $arrayElemAt: ["$populatedValue", 0] }, // Extract first matched document
      },
    },
    { $project: { populatedValue: 0 } }, // Remove lookup field

    // Second Lookup: Populate designationId inside value object
    {
      $lookup: {
        from: "designations", // Collection where designations are stored
        localField: "assignies.value.designationId",
        foreignField: "_id",
        as: "populatedDesignation",
      },
    },
    {
      $addFields: {
        "assignies.value.designationId": {
          $arrayElemAt: ["$populatedDesignation", 0], // Extract first matched designation
        },
      },
    },
    { $project: { populatedDesignation: 0 } }, // Remove lookup field

    { $replaceRoot: { newRoot: "$assignies" } }, // Replace root with assignies after all lookups
    { $skip: skip },
    { $limit: limit },
  ];

  const totalResultsPipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(req.query.id) } },
    { $unwind: "$assignies" },
    { $count: "total" },
  ];

  // Get total results
  const totalResultsData = await Project.aggregate(totalResultsPipeline);
  console.log("totalResultsData", totalResultsData);
  const totalResults = totalResultsData.length > 0 ? totalResultsData[0].total : 0;

  // Get assignies with fully populated values
  const assignies = await Project.aggregate(pipeline);
  console.log("assignies", assignies);

  res.status(200).json({
    success: true,
    data: assignies,
    page,
    limit,
    totalResults,
  });
});

const getTodayProjectLogs = catchAsync(async (req, res) => {
  console.log("Fetching only logs...");
  console.log("req.query", req.query);

  const projectId = req.query.id;
  console.log("projectId", projectId);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const skip = (page - 1) * limit;

  // Get the start and end of today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const pipeline = [
    // Filter logs created today
    {
      $match: { createdAt: { $gte: today, $lt: tomorrow } },
    },
    // Unwind logs array
    { $unwind: "$logs" },
    // Filter logs that match the given projectId
    {
      $match: { "logs.projectId": new mongoose.Types.ObjectId(projectId) },
    },
    // Populate user details
    {
      $lookup: {
        from: "users", // Collection name for users
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    // Project only necessary fields
    {
      $project: {
        _id: 1,
        userId: 1,
        userName: "$user.name",
        email : "$user.email",
        createdAt: 1,
        inTime: 1,
        outTime: 1,
        "logs.title": 1,
        "logs.description": 1,
        "logs.projectId": 1,
        "logs.timeTaken": 1,
      },
    },
    // Apply Pagination
    { $skip: skip },
    { $limit: parseInt(limit) },
  ];

  const logs = await Log.aggregate(pipeline);
  console.log("logs", logs);

  // Count total logs for pagination metadata
  const totalLogsPipeline = [
    { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
    { $unwind: "$logs" },
    { $match: { "logs.projectId": new mongoose.Types.ObjectId(projectId) } },
    { $count: "total" },
  ];

  const totalResultsData = await Log.aggregate(totalLogsPipeline);
  const totalResults = totalResultsData.length > 0 ? totalResultsData[0].total : 0;
  console.log("totalResultsData", totalResultsData);

  return res.status(200).json({
    success: true,
    data: logs,
    page: parseInt(page),
    limit: parseInt(limit),
    totalResults,
  });
});


const updateProject = catchAsync(async (req, res) => {
  console.log('req.body', req.body)
  const project = await projectService.updateProjectById(req.params.projectId, req.body);
  res.send(project);
});

const deleteProject = catchAsync(async (req, res) => {
  await projectService.deleteProjectById(req.params.projectId);
  res.status(httpStatus.NO_CONTENT).send();
});


module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectAssignies,
  getTodayProjectLogs
};