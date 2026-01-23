const mongoose = require('mongoose');
const reportSchema = new mongoose.Schema(
	{
		student: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Student',
			required: true,
		},

		coordinator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Coordinator',
			required: true,
		},

		score: {
			type: Number,
			min: 0,
			max: 100,
			required: true,
		},

		remarks: {
			type: String,
			trim: true,
		},
		day: {
			type: Number,
			min: 1,
			max: 31
		},
		week: {
			type: Number,
			min: 1,
			max: 53,
		},

		month: {
			type: Number,
			min: 1,
			max: 12,
		},

		year: {
			type: Number,
			required: true,
		},
		type: {
			type: String,
			enum: ['weekly', 'monthly'],
			required: true,
		},
		viewDate: {
			type: String
		}
	},
	{ timestamps: true }
);
module.exports = mongoose.model('Report', reportSchema);
