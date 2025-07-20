const httpStatus = require('http-status');
const { Designation, User } = require('../models');
const ApiError = require('../utils/ApiError');

const Levels = {
  "CEO" : 1,
  "CTO" : 2,
  "Project Manager" : 3,
  "Finance Manager" : 3,
  "Liability Manager" : 4,
  "hr" : 5,
  "Team Lead" : 5,
  "Senior developer" : 6,
  "junior developer" :7,
}

/**
 * Create a designation
 * @param {Object} designationBody
 * @returns {Promise<Designation>}
 */
const createDesignation = async (designationBody) => {
  console.log('designationBody', designationBody);

  if (await Designation.isDesignationTaken(designationBody.designation)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Designation already taken');
  }

  const designation = new Designation(designationBody);

  let level;
  for (const key in Levels) {
    if (key.toLowerCase() === designationBody.designation.toLowerCase()) {
      console.log('levelAssigned');
      console.log('key', key);
      console.log('designationBody.designation', designationBody.designation);
      level = Levels[key];
    }
  }
  
  console.log('level', level);
  designation.level = level;
  // const reportToLevel = designation.reportTo?.level
  if(designation.level > designation.reportTo?.level){
    await designation.save();
  }

  return { designation, level };
};

/**
 * Query for designations
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryDesignations = async (filter, options) => {
  const designations = await Designation.paginate(filter, options);
  return designations;
};

/**
 * Get designation by id
 * @param {ObjectId} id
 * @returns {Promise<Designation>}
 */
const getDesignationById = async (id) => {
  return Designation.findById(id);
};

/**
 * Get designation count
 * @param {Object} countBody
 * @returns {Promise<Designation>}
 */
const getDesignationCountBy = async (countBody) => {
  return Designation.countDocuments({ ...countBody });
};

/**
 * Get designation by email
 * @param {string} email
 * @returns {Promise<Designation>}
 */
const getDesignationByEmail = async (email) => {
  return Designation.findOne({ email });
};

/**
 * Update designation by id
 * @param {ObjectId} designationId
 * @param {Object} updateBody
 * @returns {Promise<Designation>}
 */
const updateDesignationById = async (designationId, updateBody) => {
  let designation = await Designation.findById(designationId).populate("reportTo");
console.log('designation.level', designation.level)  
   console.log('designation', designation.reportTo?.level)
  if (!designation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Designation not found');
  }
  if (updateBody.email && (await Designation.isEmailTaken(updateBody.email, designationId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (designation.level < designation.reportTo?.level) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot report to larger than  your designation level');
  }
  Object.assign(designation, updateBody);
  await designation.save();
  return designation;
};

/**
 * Delete designation by id
 * @param {ObjectId} designationId
 * @returns {Promise<Designation>}
 */
const deleteDesignationById = async (designationId) => {
  const designation = await getDesignationById(designationId);
  if (!designation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Designation not found');
  }
  if((await Designation.isDesignationAssigned(designation.id, designation.id))){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Designation Can"t be deleted if assign to any other designation');
  }
  const isAssigndToUser = await User.findOne({ designationId :designation.id});
  if(!!isAssigndToUser){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Designation Can"t be deleted if assign to any user');
  }

  await designation.remove();
  return designation;
};

module.exports = {
  createDesignation,
  queryDesignations,
  getDesignationById,
  getDesignationByEmail,
  updateDesignationById,
  deleteDesignationById,
  getDesignationCountBy,
};
