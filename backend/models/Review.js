import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  carpet: { type: mongoose.Schema.Types.ObjectId, ref: 'Carpet', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
  comment: { type: String, required: true, trim: true, maxlength: 2000 },
  approved: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Review', schema);
