// models/Coordinator.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const coordinatorSchema = new mongoose.Schema(
    {   
        coordinatorId: { 
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
        status: {
            type: String,
            enum: ['coordinator', 'alumni'],
            default: 'coordinator',
        },

    },
    { 
        timestamps: true,

        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


coordinatorSchema.virtual('assignedStudents', {
    ref: 'Student',
    localField: '_id',        
    foreignField: 'coordinator' 
});

coordinatorSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

coordinatorSchema.pre('save', async function (next) {
    if (!this.coordinatorId) {
        const lastDoc = await this.constructor.findOne({ coordinatorId: { $exists: true } }).sort({ coordinatorId: -1 });
        let nextNum = 1;
        
        if (lastDoc && lastDoc.coordinatorId) {
            const lastIdNum = parseInt(lastDoc.coordinatorId.replace('C_', ''), 10);
            nextNum = lastIdNum + 1;
        }

        this.coordinatorId = `C_${nextNum.toString().padStart(3, '0')}`;
    }
});

module.exports = mongoose.model('Coordinator', coordinatorSchema);