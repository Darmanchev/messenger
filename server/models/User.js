const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  avatar:       { type: String, default: '' },
  status:       { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
}, { timestamps: true });

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toPublic = function() {
  return { _id: this._id, username: this.username, email: this.email, avatar: this.avatar, status: this.status };
};

module.exports = mongoose.model('User', userSchema);