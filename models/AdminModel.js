const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')


const adminSchema = new mongoose.Schema(
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
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			select: false,
		},
		role: {
			type: String,
			default: 'ADMIN',
			immutable: true,
		},
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
		lastLogin: { type: Date },
	},
	{ timestamps: true }
);

adminSchema.pre('save', async function () {
	if (!this.isModified('password')) return
	this.password = await bcrypt.hash(this.password, 10)
})
module.exports = mongoose.model('Admin', adminSchema);
