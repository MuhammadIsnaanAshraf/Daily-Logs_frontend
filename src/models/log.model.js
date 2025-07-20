const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const logSchema = mongoose.Schema(
  {
    logs: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        projectId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Project',
          required: true,
        },
        timeTaken: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    inTime: { type: Date, required: false }, // Will have Clock In / Break In
    outTime: { type: Date, required: false }, // Will have Clock Out / Break Out
    lateIn: { type: Date, default: 0 }, //  Will have total LAte In Seconds
    earlyOut: { type: Date, default: 0 }, // Will have total Early Out Seconds
    overTime: { type: Date }, // Will have Overtime
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

// add plugin that converts mongoose to json
logSchema.plugin(toJSON);
logSchema.plugin(paginate);

/**
 * Check if project is assigned to any log
 * @param {string} projectId - The los's project
 * @param {ObjectId} [excludeDesignationId] - The id of the designation to be excluded
 * @returns {Promise<boolean>}
 */
 logSchema.statics.isProjectAssigned = async function (projectId, excludeDesignationId) {
  const log = await this.findOne({ logs: { $elemMatch: {projectId}}, _id: { $ne: excludeDesignationId } });
  return !!log;
};
/**
 * @typedef Log
 */
const Log = mongoose.model('Log', logSchema);

module.exports = Log;
