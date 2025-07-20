const Joi = require('joi');
const { objectId } = require('./custom.validation');

const service = Joi.object().keys({
  title: Joi.string().required(),
  timeTaken: Joi.string().required().regex(/^[0-9]{1,2}:[0-9]{2}$/,'time format must be in hh:mm'),
  projectId: Joi.string().required().custom(objectId),
  description: Joi.string().required(),
});

const createLog = {
  // params: Joi.object().keys({
  //   logId: Joi.required().custom(objectId),
  // }),
  body: Joi.object().keys({
    logs: Joi.array().required().items(service),
    // inTime: Joi.date().required(),
    // outTime: Joi.date().required(),
  }),
};

const getLogs = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    createdAt: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getLog = {
  params: Joi.object().keys({
    logId: Joi.string().custom(objectId),
  }),
};

const updateLog = {
  params: Joi.object().keys({
    logId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      logs: Joi.array().items(service),
      inTime: Joi.date().required(),
      outTime: Joi.date().required(),
    })
    .min(1),
};

const deleteLog = {
  params: Joi.object().keys({
    logId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createLog,
  getLogs,
  getLog,
  updateLog,
  deleteLog,
};
