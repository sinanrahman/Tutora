const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema(
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

		password: {
			type: String,
			required: true,
			select: false,
		},

		phone: {
			type: String,
			trim: true,
		},

		profilePic: {
			url: String,
			public_id: String,
		},

		experienceYears: {
			type: Number,
			min: 0,
			default: 0,
		},

		qualification: {
			degree: {
				type: String,
				required: true,
				trim: true,
			},
			field: {
				type: String,
				required: true,
				trim: true,
			},
			institution: {
				type: String,
				trim: true,
			},
		},
		subjects: {
			type: [String],
			required: true,
		},
		hourlyRate: {
			type: Number,
			required: true,
		},
		dailyStudents: {
			type: Number,
			default: 4,
			min: 1,
			max: 12,
		},

		status: {
			type: String,
			enum: ['teacher', 'alumini'],
			default: 'teacher',
		},
	},
	{ timestamps: true }
);

teacherSchema.pre('save', async function () {
	if (!this.isModified('password')) return;
	this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('Teacher', teacherSchema);
