const express = require('express');
const connectDB = require('./db.js');
const itemModel = require('./models/item.js');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
connectDB();


// POST: Save itemModel
app.post('user/referrals', async (req, res) => {
  const { userId, referrerId } = req.body;
  if (!userId || !referrerId) {
    return res.status(400).json({ error: 'Missing userId or referrerId' });
  }

  // Check if user already exists
  let user = await itemModel.findOne({ userId });
  if (!user) {
    user = new itemModel({ userId, referrerId });
  }

  user.referrals.push(userId);
  await user.save();
  return res.json({ success: true });
});

// GET: Fetch referrals
app.get('user/referrals', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const user = await itemModel.findOne({ userId });
  if (!user) {
    return res.json({ referrals: [], referrer: null });
  }

  return res.json({ referrals: user.referrals, referrer: user.referrerId });
});


app.listen(process.env.PORT, () => {
  console.log("App is running on port " + process.env.PORT);
});