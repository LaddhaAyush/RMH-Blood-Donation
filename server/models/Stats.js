/**
 * Stats Model
 * Stores the total blood units collected counter
 * Uses a singleton pattern - only one document exists
 */

const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    // Identifier for the stats document (always 'global')
    identifier: {
        type: String,
        default: 'global'
        // Removed 'unique: true' to avoid duplicate with schema.index below
    },
    // Total number of blood units collected
    totalBloodUnits: {
        type: Number,
        default: 0,
        min: 0
    },
    // Last updated timestamp
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Ensure unique index on identifier
statsSchema.index({ identifier: 1 }, { unique: true });

/**
 * Static method to get the current stats
 * Creates the document if it doesn't exist
 */
statsSchema.statics.getStats = async function() {
    let stats = await this.findOne({ identifier: 'global' });
    
    if (!stats) {
        stats = await this.create({ identifier: 'global', totalBloodUnits: 0 });
    }
    
    return stats;
};

/**
 * Static method to increment the blood unit count
 * @param {Number} amount - Amount to increment (default: 1)
 */
statsSchema.statics.incrementCount = async function(amount = 1) {
    const stats = await this.findOneAndUpdate(
        { identifier: 'global' },
        { 
            $inc: { totalBloodUnits: amount },
            $set: { lastUpdated: new Date() }
        },
        { 
            new: true, 
            upsert: true,
            setDefaultsOnInsert: true
        }
    );
    
    return stats;
};

module.exports = mongoose.model('Stats', statsSchema);
