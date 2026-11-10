import mongoose from 'mongoose';

const carpetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: 120,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 10000,
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image is required']
  },
  category: { type: String, trim: true, maxlength: 80, default: 'Rugs' },
  country: { type: String, enum: ['', 'Pakistan', 'Afghanistan'], default: '' },
  material: { type: String, trim: true, maxlength: 120, default: '' },
  dimensions: { type: String, trim: true, maxlength: 120, default: '' },
  images: { type: [String], default: [] },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Carpet', carpetSchema);