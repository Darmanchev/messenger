const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:      { type: String, required: true, trim: true },
}, { timestamps: true });

messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.index({ text: 'text' }); // для full-text поиска

module.exports = mongoose.model('Message', messageSchema);