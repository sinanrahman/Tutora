const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


const coordinatorSchema = new mongoose.Schema(
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
		},
		phone: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
			select: false  
		}, 
		assignedStudents: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Student',
			},
		],
		assignedTeachers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Teacher',
			},
		],
		isActive: {
			type: Boolean,
			default: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Admin',
			required: true,
		},
	},
	{ timestamps: true }
);
coordinatorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
//   next();
})



module.exports = mongoose.model('Coordinator', coordinatorSchema)
