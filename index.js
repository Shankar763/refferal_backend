const express = require('express');
const connectDB = require('./db.js');
const User = require('./models/item.js');  // Assuming 'itemModel' is renamed to 'User'
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['https://referalsystem.vercel.app', 'http://localhost:3000']
}));

// Connect to the database
connectDB();

// POST: Save referral information and award points
app.post('/user/referrals', async (req, res) => {
  const { userId, referrerId } = req.body;

  if (!userId || !referrerId) {
    return res.status(400).json({ error: 'Missing userId or referrerId' });
  }

  try {
    console.log('Incoming data:', userId, referrerId);

    // Ensure referrer and user are different
    if (userId === referrerId) {
      return res.status(400).json({ error: 'Self-referral is not allowed' });
    }

    // Find or create the referred user
    let user = await User.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, referrerId, referrals: [], points: 0 } },  // Add points
      { upsert: true, new: true }
    );

    // Find the referrer
    let referrer = await User.findOne({ userId: referrerId });
    if (!referrer) {
      return res.status(404).json({ error: 'Referrer not found' });
    }

    // Award points if not already referred by this referrer
    if (!user.referrals.includes(referrerId)) {
      // Add the referrer to the user's referrals
      user.referrals.push(referrerId);

      // Award points to the referrer (e.g., 10 points for each successful referral)
      referrer.points = (referrer.points || 0) + 10;

      // Save both the referred user and referrer
      await user.save();
      await referrer.save();
    }

    return res.json({ success: true, points: referrer.points });
  } catch (error) {
    console.error('Error saving referral:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Fetch referral data and points
app.get('/user/referrals', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    console.log('Fetching referrals and points for userId:', userId);
    const user = await User.findOne({ userId });

    if (!user) {
      return res.json({ referrals: [], referrer: null, points: 0 });
    }

    return res.json({ referrals: user.referrals, referrer: user.referrerId, points: user.points });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(process.env.PORT || 5000, () => {
  console.log("App is running on port " + (process.env.PORT || 5000));
});
