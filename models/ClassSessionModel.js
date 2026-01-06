const mongoose = require('mongoose');

const classSessionSchema = new mongoose.Schema(
	{
		enrollment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Enrollment',
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
		durationInHours: {
			type: Number,
			required: true,
		},
		attendance: {
			type: Boolean,
			default: false,
		},
		feeCharged: {
			type: Number,
			default: 0,
		}, // calculated after approval
		status: {
			type: String,
			enum: ['PENDING', 'APPROVED'],
			default: 'PENDING',
		},
		approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Coordinator' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('ClassSession', classSessionSchema);
