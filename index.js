const express = require('express');
const connectDB = require('./db.js');
const itemModel = require('./models/item.js');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://referalsystem.vercel.app'  // Replace with your frontend URL
}));

// Connect to the database
connectDB();

// POST: Save referral information
app.post('/user/referrals', async (req, res) => {
  const { userId, referrerId } = req.body;

  if (!userId || !referrerId) {
    return res.status(400).json({ error: 'Missing userId or referrerId' });
  }

  try {
    // Log data
    console.log('Incoming data:', userId, referrerId);

    // Check if the user already exists
    let user = await itemModel.findOne({ userId });

    if (!user) {
      console.log('Creating new user');
      user = new itemModel({ userId, referrerId, referrals: [] });
    }

    // Save referrer if not self-referring and referrer not already added
    if (userId !== referrerId && !user.referrals.includes(referrerId)) {
      user.referrals.push(referrerId);
    }

    // Save the user in the database
    await user.save();
    return res.json({ success: true });
  } catch (error) {
    console.error('Error saving referral:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Fetch referral data
app.get('/user/referrals', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    console.log('Fetching referrals for userId:', userId);
    const user = await itemModel.findOne({ userId });

    if (!user) {
      return res.json({ referrals: [], referrer: null });
    }

    return res.json({ referrals: user.referrals, referrer: user.referrerId });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log("App is running on port " + process.env.PORT);
});
