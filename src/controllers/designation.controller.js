const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { designationService } = require('../services');

const createDesignation = catchAsync(async (req, res) => {
  console.log('req.body :>> ', req.body);
  const result = await designationService.createDesignation(req.body);
  console.log('result', result)
  res.status(httpStatus.CREATED).send(result);
});

const getDesignations = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role', 'designation']);
  if(filter.designation) {
    filter.designation = new RegExp(filter.designation, 'i');
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await designationService.queryDesignations(filter, options);
  res.send(result);
});

const getDesignation = catchAsync(async (req, res) => {
  const designation = await designationService.getDesignation(req.params.designationId);
  if (!designation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Designation not found');
  }
  res.send(designation);
});

const updateDesignation = catchAsync(async (req, res) => {
  const designation = await designationService.updateDesignationById(req.params.designationId, req.body);
  res.send(designation);
});

const deleteDesignation = catchAsync(async (req, res) => {
  await designationService.deleteDesignationById(req.params.designationId);
  res.status(httpStatus.NO_CONTENT).send();
});


module.exports = {
  createDesignation,
  getDesignations,
  getDesignation,
  updateDesignation,
  deleteDesignation,
};