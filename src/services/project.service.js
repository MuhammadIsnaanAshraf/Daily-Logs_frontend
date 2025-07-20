const httpStatus = require('http-status');
const { Project, Log, User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a project
 * @param {Object} projectBody
 * @returns {Promise<Project>}
 */
const createProject = async (projectBody) => {
  if (await Project.isProjectTaken(projectBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Project already taken');
  }
  return Project.create(projectBody);
};

/**
 * Query for projects
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryProjects = async (filter, options) => {
  const projects = await Project.paginate(filter, options);
  return projects;
};

/**
 * Get project by id
 * @param {ObjectId} id
 * @returns {Promise<Project>}
 */
const getProjectById = async (id) => {
  // console.log('filter of services', filter)
  // const project = await Project.paginate(filter, options)
  // console.log('project of the services', project)
  // return project
  return Project.findById(id);
};


/**
 * Update project by id
 * @param {ObjectId} projectId
 * @param {Object} updateBody
 * @returns {Promise<Project>}
 */
// const updateProjectById = async (projectId, updateBody) => {
//   const project = await getProjectById(projectId);
//   const userIds = updateBody.assignies?.[0]?.map((assignee) => assignee.value)
//   console.log('userId', userIds)
//   console.log('project.assignies', updateBody.assignies?.[0]?.map((assignee) => assignee.value))
//   if (!project) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
//   }
//   if (updateBody.email && (await Project.isEmailTaken(updateBody.email, projectId))) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
//   }
//   if (userIds?.length > 0) {
//     await Promise.all(
//       userIds.map(async (userId) => {
//         await User.findByIdAndUpdate(
//           userId,
//           { $addToSet: { projects: projectId } }, 
//           { new: true } 
//         );
//       })
//     );
//   }
//   Object.assign(project, updateBody);
//   await project.save();
//   return project;
// };

const updateProjectById = async (projectId, updateBody) => {
  console.log('projectId', projectId)
  const project = await getProjectById(projectId);
  console.log('project for update', project)
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }  
  console.log('updateBody.assignies', updateBody?.assignies) 
  console.log('project.assignies', project?.assignies) 

  const newUserIds = updateBody?.assignies?.[0]?.flatMap((assignee) => assignee?.value?.id || assignee?.value) || [];
  const existingUserIds = project.assignies?.map((assignee) => assignee.value) || [];
  const stringIds = existingUserIds.map((userId) => userId.toString())
  console.log('stringIds', stringIds)

  const usersToAdd = newUserIds?.filter(userId => !stringIds.includes(userId));
  // const usersToRemove = project.assignies?.filter((assignee) => assignee.value !== updateBody.assignies?.[0]?.map((assignee) => assignee.value))
  const usersToRemove = stringIds?.filter(userId => !newUserIds.includes(userId));

  console.log("New Assigned Users:", newUserIds);
  console.log("Previously Assigned Users:", existingUserIds);
  console.log("Users to Add:", usersToAdd);
  console.log("Users to Remove:", usersToRemove);
  if (usersToAdd?.length > 0) {
    await Promise.all(
      usersToAdd?.map(async (userId) => {
        console.log("userID forupdating", userId)
        await User.findByIdAndUpdate(
          userId,
          { $addToSet: { projects: projectId } }, 
          { new: true }
        );
      })
    );
  }
  if (usersToRemove.length > 0) {
    await Promise.all(
      usersToRemove.map(async (userId) => {
        await User.findByIdAndUpdate(
          userId,
          { $pull: { projects: projectId } }, 
          { new: true }
        );
      })
    );
  }




  // Update the project's assignees field
  // project.assignies = updateBody.assignies?.[0]?.map((assignee)=> assignee?.value)|| updateBody.assignies?.[0]?.map((assignee) => assignee.id);
  project.assignies = updateBody.assignies?.[0]?.map((assignee)=> assignee);
  
//   project.assignies = updateBody.assignies?.[0].map((assignee) => {
//     // Remove single quotes around the value if they exist
//     const value = assignee.value.replace(/^'|'$/g, ''); // Removes single quotes at the start and end
//     return value;
// }) || updateBody.assignies?.[0]?.map((assignee) => {
    // Remove single quotes around the id if they exist
    // const id = assignee.id.replace(/^'|'$/g, ''); 
//     return id;
// });

  await project.save();
  return project;
};


/**
 * Delete project by id
 * @param {ObjectId} projectId
 * @returns {Promise<Project>}
 */
const deleteProjectById = async (projectId) => {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
  }
  if (await Log.isProjectAssigned(project.id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Project Can"t be deleted if assign to any log');
  }
  await project.remove();
  return project;
};

module.exports = {
  createProject,
  queryProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
};
