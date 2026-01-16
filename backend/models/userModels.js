import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: '' }, // empty for google accounts
  image: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: Object, default: {} },
  dob: { type: String, default: '' },
  gender: { type: String, default: '' },
  // new fields for Google / auth type handling
  // authType: { type: String, enum: ['local', 'google'], default: 'local' },
  // googleId: { type: String, default: '' },
  date: { type: Date, default: Date.now }
})

export default mongoose.model('User', userSchema)