const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createDesignation = {
  body: Joi.object().keys({
    designation: Joi.string().required(),
    reportTo: Joi.string().custom(objectId),
  }),
};

const getDesignations = {
  query: Joi.object().keys({
    designation: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getDesignation = {
  params: Joi.object().keys({
    designationId: Joi.string().custom(objectId),
  }),
};

const updateDesignation = {
  params: Joi.object().keys({
    designationId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      designation: Joi.string(),
      reportTo: Joi.string().custom(objectId),
    })
    .min(1),
};

const deleteDesignation = {
  params: Joi.object().keys({
    designationId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createDesignation,
  getDesignations,
  getDesignation,
  updateDesignation,
  deleteDesignation,
};
