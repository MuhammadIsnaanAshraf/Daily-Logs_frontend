const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { required } = require('joi');

const designationSchema = mongoose.Schema(
  {
    designation: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    level : {
      type : Number,
      required : true,
    },

    reportTo: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Designation',
      required: false,
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
designationSchema.plugin(toJSON);
designationSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} designation - The designation's name
 * @param {ObjectId} [excludeUserId] - The id of the designation to be excluded
 * @returns {Promise<boolean>}
 */
 designationSchema.statics.isDesignationTaken = async function (designation, excludeUserId) {
  const Designation = await this.findOne({designation, _id: { $ne: excludeUserId } });
  return !!Designation;
};
/**
 * Check if designation is assigned to any designation
 * @param {string} reportTo - The designation's email
 * @param {ObjectId} [excludeDesignationId] - The id of the designation to be excluded
 * @returns {Promise<boolean>}
 */
 designationSchema.statics.isDesignationAssigned = async function (reportTo, excludeDesignationId) {
  const designation = await this.findOne({ reportTo, _id: { $ne: excludeDesignationId } });
  return !!designation;
};

designationSchema.pre('save', async function (next) {
  const designation = this;
  if(!designation?.reportTo) {  
    designation.reportTo = designation.id
  }
  next();
});

/**
 * @typedef Designation
 */
const Designation = mongoose.model('Designation', designationSchema);

module.exports = Designation;
