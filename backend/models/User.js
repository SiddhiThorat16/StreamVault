// Cloud-Based-Media-Files-Storage-Service\StreamVault\backend\models\User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  image_url: String,
  created_at: { type: Date, default: Date.now }
});

// ✅ FIXED - Return promise instead of using next()
userSchema.pre('save', async function() {  // Remove 'next' parameter
  if (!this.isModified('password')) return;  // Return early, no next()
  
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
