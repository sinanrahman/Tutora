const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
	{
		studentId: { 
            type: String, 
            unique: true,
            // Not 'required' initially, so we can backfill existing docs without errors
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
			required: true
		},
		school: {
			type: String,
			required: true
		},
		status: {
			type: String,
			enum: ['student', 'alumni'],
			default: 'student',
		},
		lastDate: {
			type: Date,
			// required: true
		},
		package: {
			hours: {
				type: Number
			},
			amount: {
				type: Number
			},
			description: {
				type: String
			},
			startDate: {
				type: Date
			},
			endDate: {
				type: Date
			},
			paymentDate: {
				type: Date
			}
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

// PRE-SAVE HOOK: Automatically assign studentId for NEW students
studentSchema.post('save', async function (next) {
    // Only run this if studentId is missing
    if (!this.studentId) {
        // Find the last student with a studentId, sorting by descending order
        const lastStudent = await this.constructor.findOne({ studentId: { $exists: true } }).sort({ studentId: -1 });
        
        let nextNum = 1;
        if (lastStudent && lastStudent.studentId) {
            // Extract the number from "S_001" -> 1
            const lastIdNum = parseInt(lastStudent.studentId.replace('S_', ''), 10);
            nextNum = lastIdNum + 1;
        }

        // Pad with zeros: 
        // If 1 -> "001"
        // If 1000 -> "1000" (padStart respects string length if it's already longer than 3)
        const paddedNum = nextNum.toString().padStart(3, '0');
        this.studentId = `S_${paddedNum}`;
    }
    // next();
});

module.exports = mongoose.model('Student', studentSchema);
