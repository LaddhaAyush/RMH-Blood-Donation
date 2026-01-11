/**
 * Blood Donation Event Website - Server
 * Express.js backend with MongoDB integration
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import models
const Donor = require('./models/Donor');
const Stats = require('./models/Stats');

// Initialize Express app
const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blood_donation';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

/**
 * Connect to MongoDB
 */
async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully');
        
        // Initialize stats document if it doesn't exist
        await Stats.getStats();
        console.log('✅ Stats collection initialized');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
}

// ============================================
// API ROUTES
// ============================================

/**
 * POST /api/donate
 * Register a new blood donor and increment count
 */
app.post('/api/donate', async (req, res) => {
    try {
        const { fullName, bloodGroup, age, year } = req.body;

        // Server-side validation
        if (!fullName || !bloodGroup || !age || !year) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate age
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 18) {
            return res.status(400).json({
                success: false,
                message: 'Donor must be at least 18 years old'
            });
        }

        // Validate blood group
        const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (!validBloodGroups.includes(bloodGroup)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid blood group'
            });
        }

        // Validate year
        const validYears = ['FY', 'SY', 'TY', 'Final Year'];
        if (!validYears.includes(year)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year selection'
            });
        }

        // Create new donor record
        const donor = new Donor({
            fullName: fullName.trim(),
            bloodGroup,
            age: ageNum,
            year
        });

        await donor.save();

        // Increment total blood units count
        const stats = await Stats.incrementCount(1);

        console.log(`🩸 New donor registered: ${fullName} (${bloodGroup})`);

        res.status(201).json({
            success: true,
            message: 'Donation registered successfully',
            data: {
                donor: {
                    fullName: donor.fullName,
                    bloodGroup: donor.bloodGroup
                },
                totalUnits: stats.totalBloodUnits
            }
        });

    } catch (error) {
        console.error('Error registering donor:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

/**
 * GET /api/stats
 * Get total blood units collected
 */
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await Stats.getStats();
        
        res.json({
            success: true,
            data: {
                totalBloodUnits: stats.totalBloodUnits,
                lastUpdated: stats.lastUpdated
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

/**
 * POST /api/sync-stats
 * Sync stats with actual donor count (admin utility)
 */
app.post('/api/sync-stats', async (req, res) => {
    try {
        const donorCount = await Donor.countDocuments();
        await Stats.findOneAndUpdate(
            { identifier: 'global' },
            { totalBloodUnits: donorCount, lastUpdated: new Date() },
            { upsert: true }
        );
        
        res.json({
            success: true,
            message: `Stats synced. Total donors: ${donorCount}`,
            data: { totalBloodUnits: donorCount }
        });
    } catch (error) {
        console.error('Error syncing stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error syncing statistics'
        });
    }
});

/**
 * GET /api/donors
 * Get list of recent donors (optional endpoint)
 */
app.get('/api/donors', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const donors = await Donor.find()
            .select('fullName bloodGroup donatedAt')
            .sort({ donatedAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: donors
        });

    } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching donors'
        });
    }
});

// ============================================
// PAGE ROUTES
// ============================================

// Serve registration page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve thank you page
app.get('/thank-you', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/thankyou.html'));
});

// Serve dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ============================================
// START SERVER
// ============================================

async function startServer() {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log('========================================');
        console.log('🩸 Blood Donation Event Website');
        console.log('========================================');
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📝 Registration: http://localhost:${PORT}/`);
        console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
        console.log('========================================');
    });
}

startServer();
