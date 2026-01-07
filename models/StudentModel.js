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
		gender: {
			type: String,
			enum: ['male', 'female', 'other', 'prefer_not_to_say'],
			default: 'prefer_not_to_say',
		},

		country: {
			type: String,
			required: true,
			trim: true,
		},

     class: {
      type: String,
      required: true,
    },
    status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
		coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'Coordinator' },
	},

	{
		timestamps: true,
	}
)
module.exports = mongoose.model('Student', studentSchema);
