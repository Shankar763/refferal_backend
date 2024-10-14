const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  referrerId: { type: String, default: null },
  referrals: { type: [String], default: [] },
  points: { type: Number, default: 0 },  // New field for points
});

// Create the model using the schema
const itemModel = mongoose.model("Item", itemSchema);
module.exports = itemModel;