const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')


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
		},

		phone: {
			type: String,
			trim: true,
		},

		profilePic: {
			type: String,
			default: null,
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
				trim: true, // e.g., B.Sc, M.Sc, PhD
			},
			field: {
				type: String,
				required: true,
				trim: true, // e.g., Mathematics, Physics
			},
			institution: {
				type: String,
				trim: true,
			},
		},

		subjects: [
			{
				name: {
					type: String,
					required: true,
					trim: true,
				},
				level: {
					type: String,
					trim: true,
				},
			},
		],

		hourlyRate: {
			type: Number,
			required: true,
		},

		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
	},
	{ timestamps: true }
);


teacherSchema.pre('save', async function () {
	if (!this.isModified('password')) return
	this.password = await bcrypt.hash(this.password, 10)
})

module.exports = mongoose.model('Teacher', teacherSchema);
