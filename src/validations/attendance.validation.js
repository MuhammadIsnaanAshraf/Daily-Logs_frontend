const Joi = require('joi');
const { objectId } = require('./custom.validation');

const attendance = Joi.object().keys({
  userId: Joi.string().required(),
  attendance: Joi.boolean().required(),
});

const createAttendnce = {
  body: Joi.object().keys({
    userId: Joi.required().custom(objectId),
    present: Joi.boolean().required()
  }),
  // body: Joi.object().keys({
  //   employeeAattendance: Joi.array().required().items(attendance),
  // }),

};

const getAttendances = {
  query: Joi.object().keys({
    userId: Joi.string(),
    sortBy: Joi.string(),
    createdAt: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAttendance = {
  params: Joi.object().keys({
    attendanceId: Joi.string().custom(objectId),
  }),
};

const updateAttendance = {
  body: Joi.object().keys({
    attendanceId: Joi.required().custom(objectId),
    present :Joi.boolean().required()
  }),
  // body: Joi.object()
  //   .keys({
  //     employeeAattendance: Joi.array().items(attendance),
  //   })
  //   .min(1),
};

const deleteAttendance = {
  params: Joi.object().keys({
    attendanceId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createAttendnce,
  getAttendances,
  getAttendance,
  updateAttendance,
  deleteAttendance,
};
