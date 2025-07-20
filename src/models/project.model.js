const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

const projectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    
    projectCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // assignies: {
    //   type: Array,
    //   required: false,
    // },

    assignies: [
      {
        _id: false,
        value: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        label: { type: String, required: true }
      }
    ]
   
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
projectSchema.plugin(toJSON);
projectSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
 projectSchema.statics.isProjectTaken = async function (name, excludeUserId) {
  const Project = await this.findOne({name, _id: { $ne: excludeUserId } });
  return !!Project;
};
/**
 * @typedef Project
 */
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
