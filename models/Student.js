const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		phone: {
			type: String,
			required: true,
			trim: true,
		},
		country: {
			type: String,
			required: true,
			trim: true,
		},
		prepaidHours: {
			type: Number,
			default: 120,
			required: true,
		},
		remainingHours: {
			type: Number,
			default: 120,
			required: true,
		},
		standard: {
			type: String,
			required: true
		},
		status: {
			type: String,
			enum: ['student', 'alumni'],
			default: 'student',
		},
		coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'Coordinator' },
		assignedTeachers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Teacher'
			}
		]
	},
	{
		timestamps: true,
	}
)
module.exports = mongoose.model('Student', studentSchema);
