/**
 * Donor Model
 * Stores information about blood donors
 */

const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    // Full name of the donor
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long']
    },
    // Blood group of the donor
    bloodGroup: {
        type: String,
        required: [true, 'Blood group is required'],
        enum: {
            values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            message: 'Invalid blood group'
        }
    },
    // Age of the donor (must be 18 or older)
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [18, 'Donor must be at least 18 years old'],
        max: [65, 'Donor must be 65 years or younger']
    },
    // Academic year of the donor
    year: {
        type: String,
        required: [true, 'Year is required'],
        enum: {
            values: ['FY', 'SY', 'TY', 'Final Year'],
            message: 'Invalid year selection'
        }
    },
    // Timestamp of donation registration
    donatedAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
donorSchema.index({ donatedAt: -1 }); // For sorting recent donors
donorSchema.index({ bloodGroup: 1 }); // For filtering by blood group

module.exports = mongoose.model('Donor', donorSchema);
