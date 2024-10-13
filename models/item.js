const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    userId: { type: String, required: true },
  referrerId: { type: String, required: false },
  referrals: { type: [String], default: [] },
});

// Create the model using the schema
const itemModel = mongoose.model("Item", itemSchema);
module.exports = itemModel;