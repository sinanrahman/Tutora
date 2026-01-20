const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
	{
		studentId: {
			type: String,
			unique: true,
		},
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
		remainingHours: {
			type: Number,
			required: true,
			default: 0,
		},
		standard: {
			type: String,
			required: true,
		},
		school: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ['student', 'alumni'],
			default: 'student',
		},
		lastDate: {
			type: Date,
			required: true,
		},
		parentNumber: {
			type: String,
			required: true,
			index: true,
			trim: true,
		},

		parentAuth: {
			otp: String,
			otpExpiresAt: Date,
		},
		package: {
			hours: {
				type: Number,
			},
			amount: {
				type: Number,
			},
			description: {
				type: String,
			},
			startDate: {
				type: Date,
			},
			endDate: {
				type: Date,
			},
			paymentDate: {
				type: Date,
			},
		},
		coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'Coordinator' },
		assignedTeachers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Teacher',
			},
		],
	},
	{
		timestamps: true,
	}
);

studentSchema.pre('save', async function (next) {
	if (!this.studentId) {
		const lastStudent = await this.constructor
			.findOne({ studentId: { $exists: true } })
			.sort({ studentId: -1 });

		let nextNum = 1;
		if (lastStudent && lastStudent.studentId) {
			const lastIdNum = parseInt(lastStudent.studentId.replace('S_', ''), 10);
			nextNum = lastIdNum + 1;
		}
		const paddedNum = nextNum.toString().padStart(3, '0');
		this.studentId = `S_${paddedNum}`;
	}
});

module.exports = mongoose.model('Student', studentSchema);
