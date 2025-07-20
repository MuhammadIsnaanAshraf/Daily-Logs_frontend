const Joi = require('joi');
const { roles } = require('../config/roles');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid( ...roles),
    status: Joi.string().valid('active', 'inactive'),
    reportTo: Joi.string().custom(objectId),
    designationId: Joi.string().required().custom(objectId),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    populate: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    status: Joi.string().valid('active', 'inactive'),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      role: Joi.string().valid(...roles),
      reportTo: Joi.string().custom(objectId),
      designationId: Joi.string().custom(objectId),
      projects : Joi.string().custom(objectId),
      status: Joi.string().valid('active', 'inactive'),
    })
    .min(1),
};
const updateProfile = {
  // params: Joi.object().keys({
  //   userId: Joi.required().custom(objectId),
  // }),
  body: Joi.object()
    .keys({
      // email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      // role: Joi.string().valid(...roles),
      // reportTo: Joi.string().custom(objectId),
      // designationId: Joi.string().custom(objectId),
      // status: Joi.string().valid('active', 'inactive'),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
};
