// models/Coordinator.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        // REMOVED: assignedStudents: [...] 
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { 
        timestamps: true,
        // IMPORTANT: These options allow virtuals to be included when converting to JSON/Object
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Define the Virtual Relationship
coordinatorSchema.virtual('assignedStudents', {
    ref: 'Student',           // The model to use
    localField: '_id',        // Find people where `localField`
    foreignField: 'coordinator' // is equal to `foreignField`
});

coordinatorSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('Coordinator', coordinatorSchema);