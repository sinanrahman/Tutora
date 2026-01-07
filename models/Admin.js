const mongoose = require('mongoose');

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
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
		lastLogin: { type: Date },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
