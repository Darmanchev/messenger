const router  = require('express').Router();
const auth    = require('../middleware/auth');
const Channel = require('../models/Channel');

// GET /api/channels
router.get('/', auth, async (req, res) => {
  try {
    const channels = await Channel.find({ isPublic: true }).sort({ name: 1 });
    res.json(channels);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/channels
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPublic = true } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const channel = await Channel.create({
      name, description, isPublic,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json(channel);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Channel name taken' });
    res.status(500).json({ error: e.message });
  }
});

// POST /api/channels/:id/join
router.post('/:id/join', auth, async (req, res) => {
  try {
    const channel = await Channel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.user._id } },
      { new: true }
    );
    if (!channel) return res.status(404).json({ error: 'Not found' });
    res.json(channel);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;