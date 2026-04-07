const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/history/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(messages);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;