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

connectDB();

// POST: Save referral information
app.post('/user/referrals', async (req, res) => {
  const { userId, referrerId } = req.body;
  
  if (!userId || !referrerId) {
    return res.status(400).json({ error: 'Missing userId or referrerId' });
  }

  try {
    // Check if the user already exists
    let user = await itemModel.findOne({ userId });
    if (!user) {
      // Create new user with the referrer ID
      console.log("heelo from post 1")
      console.log(userId)
      console.log(referrerId)
      console.log(referrals);
      user = new itemModel({ userId, referrerId, referrals: [] });
    }

    // Save referrer if not self-referring
    if (userId !== referrerId && !user.referrals.includes(userId)) {
      user.referrals.push(referrerId); // Referrer is being recorded
    }
    // if (userId !== referrerId && !user.referrals.includes(referrerId)) {
    //   user.referrals.push(referrerId); 
    // }

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
    const user = await itemModel.findOne({ userId });

    if (!user) {
      return res.json({ referrals: [], referrer: null });
    }
    console.log(user)
    return res.json({ referrals: user.referrals, referrer: user.referrerId });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(process.env.PORT, () => {
  console.log("App is running on port " + process.env.PORT);
});
