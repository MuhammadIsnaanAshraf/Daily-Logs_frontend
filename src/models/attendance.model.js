// const mongoose = require('mongoose');
// const { toJSON, paginate } = require('./plugins');

// const AttendanceSchema = mongoose.Schema(
//   {
//     employeeAattendance: [
//       {
//         userId: {
//           type: mongoose.SchemaTypes.ObjectId,
//           ref: 'User',
//           required: true,
//           unique: true,
//         },
//         attendance: {
//           type: Boolean,
//           default: false,
//         },
//       },
//     ],
//     userId: {
//       type: mongoose.SchemaTypes.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // add plugin that converts mongoose to json
// AttendanceSchema.plugin(toJSON);
// AttendanceSchema.plugin(paginate);
// /**
//  * @typedef Attendance
//  */
// const Attendance = mongoose.model('Attendance', AttendanceSchema);

// module.exports = Attendance;



const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const AttendanceSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      // required: true,
    },
    present: {
      type: Boolean,
      default: false,
    },
    markedAt: {
      type: Date,
      default: Date.now,  
    },
  },
  {
    timestamps: true,  
  }
);

AttendanceSchema.plugin(toJSON);
AttendanceSchema.plugin(paginate);

/**
 * @typedef Attendance
 */
const Attendance = mongoose.model('Attendance', AttendanceSchema);

module.exports = Attendance;
