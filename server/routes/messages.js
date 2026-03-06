const router  = require('express').Router();
const auth    = require('../middleware/auth');
const Message = require('../models/Message');

// GET /api/messages/:channelId?limit=50&before=<id>&search=text
router.get('/:channelId', auth, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, before, search } = req.query;

    let query = { channelId };

    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
      const messages = await Message.find(query)
        .populate('userId', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(Number(limit));
      return res.json(messages.reverse());
    }

    if (before) query._id = { $lt: before };

    const messages = await Message.find(query)
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(messages.reverse());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;