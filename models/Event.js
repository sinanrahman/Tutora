const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },

    type: {
      type: String,
      enum: ['CLASS', 'EXAM'],
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    durationInHours: {
      type: Number,
      required: true,
      min: 0.25,
    },

    studentCharge: {
      type: Number,
      default: 0,
    },

    teacherEarning: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED'],
      default: 'PENDING',
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coordinator',
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Session', sessionSchema);