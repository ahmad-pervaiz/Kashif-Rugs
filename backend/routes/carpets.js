import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import Carpet from '../models/Carpet.js';
import Review from '../models/Review.js';
import { requireAdmin } from '../middleware/admin.js';
import { rateLimit } from '../middleware/limits.js';
const router = express.Router();
const directory = fileURLToPath(new URL('../uploads/', import.meta.url));
mkdirSync(directory, { recursive: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 8, fields: 8 },
  fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) });
export function imageExtension(buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([255,216,255]))) return '.jpg';
  if (buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return '.png';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return '.webp';
  return null;
}
router.param('id', (req, res, next, id) => mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: 'Invalid rug ID' }));
router.get('/', async (req, res, next) => { try { res.json(await Carpet.find().sort({ createdAt: -1 })); } catch (e) { next(e); } });
router.get('/:id/reviews', async (req, res, next) => { try { res.json(await Review.find({ carpet: req.params.id, approved: true }).select('name rating comment createdAt').sort({ createdAt: -1 }).limit(100)); } catch (e) { next(e); } });
router.post('/:id/reviews', rateLimit(5, 3600000), async (req, res, next) => {
  try {
    if (!await Carpet.exists({ _id: req.params.id })) return res.status(404).json({ message: 'Rug not found' });
    const { name, rating, comment } = req.body;
    await Review.create({ carpet: req.params.id, name, rating, comment, approved: false });
    res.status(201).json({ message: 'Thank you. Your review is awaiting moderation.' });
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => { try { const rug = await Carpet.findById(req.params.id); if (!rug) return res.status(404).json({ message: 'Rug not found' }); res.json(rug); } catch (e) { next(e); } });
async function saveRug(req, res, next) {
  const saved = [];
  try {
    const rug = req.params.id ? await Carpet.findById(req.params.id) : new Carpet();
    if (!rug) return res.status(404).json({ message: 'Rug not found' });
    for (const field of ['title', 'description', 'category', 'material', 'dimensions', 'price']) if (req.body[field] !== undefined) rug[field] = req.body[field];
    const files = req.files || [];
    const extensions = files.map(f => imageExtension(f.buffer));
    if (extensions.some(x => !x)) return res.status(400).json({ message: 'Only valid JPEG, PNG and WebP photos are supported' });
    if (files.length) {
      const { writeFile } = await import('node:fs/promises');
      const urls = [];
      for (let i = 0; i < files.length; i++) {
        const filename = randomUUID() + extensions[i];
        const target = path.join(directory, filename);
        await writeFile(target, files[i].buffer, { flag: 'wx' }); saved.push(target);
        urls.push('/uploads/' + filename);
      }
      rug.imageUrl = urls[0]; rug.images = urls;
    }
    await rug.save();
    res.status(req.params.id ? 200 : 201).json(rug);
  } catch (e) { await Promise.allSettled(saved.map(f => unlink(f))); next(e); }
}
router.post('/', requireAdmin, upload.array('images', 8), saveRug);
router.put('/:id', requireAdmin, upload.array('images', 8), saveRug);
router.delete('/:id', requireAdmin, async (req, res, next) => { try { const rug = await Carpet.findByIdAndDelete(req.params.id); if (!rug) return res.status(404).json({ message: 'Rug not found' }); await Review.deleteMany({ carpet: req.params.id }); res.json({ message: 'Rug deleted' }); } catch (e) { next(e); } });
export default router;
