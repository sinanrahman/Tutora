const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
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
		coordinator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Coordinator',
			required: true,
		},
		subject: {
			type: String,
			required: true,
		},
		feePerHour: {
			type: Number,
			required: true,
		},
		zoomLink: { type: String },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Enrollment', enrollmentSchema);
