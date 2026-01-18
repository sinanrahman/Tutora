const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema(
	{
		teacherId: { 
        type: String, 
        unique: true 
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
			enum: ['teacher', 'alumni'],
			default: 'teacher',
		},
	},
	{ timestamps: true }
);

teacherSchema.pre('save', async function () {
	if (!this.isModified('password')) return;
	this.password = await bcrypt.hash(this.password, 10);
});

teacherSchema.post('save', async function (next) {
    if (!this.teacherId) {
        const lastDoc = await this.constructor.findOne({ teacherId: { $exists: true } }).sort({ teacherId: -1 });
        let nextNum = 1;
        
        if (lastDoc && lastDoc.teacherId) {
            const lastIdNum = parseInt(lastDoc.teacherId.replace('T_', ''), 10);
            nextNum = lastIdNum + 1;
        }

        // Handles T_001 -> T_1000 automatically
        this.teacherId = `T_${nextNum.toString().padStart(3, '0')}`;
    }
    // next();
});

module.exports = mongoose.model('Teacher', teacherSchema);
