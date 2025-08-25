// server/routes/newsletter.js
const express = require('express');
const Newsletter = require('../models/Newsletter');

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (existing.active) {
        return res.status(400).json({ message: 'Email already subscribed' });
      } else {
        existing.active = true;
        await existing.save();
        return res.json({ message: 'Resubscribed successfully' });
      }
    }

    // Create new subscription
    const subscription = new Newsletter({ email });
    await subscription.save();

    res.json({ message: 'Subscribed successfully' });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already subscribed' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    const subscription = await Newsletter.findOne({ email });
    if (!subscription) {
      return res.status(404).json({ message: 'Email not found' });
    }

    subscription.active = false;
    await subscription.save();

    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;