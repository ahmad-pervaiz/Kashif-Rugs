import express from 'express';
import Review from '../models/Review.js';
import { requireAdmin } from '../middleware/admin.js';
const router = express.Router();
router.use(requireAdmin);
router.get('/', async (req, res, next) => { try { res.json(await Review.find({ approved: false }).populate('carpet', 'title').sort({ createdAt: -1 }).limit(100)); } catch (e) { next(e); } });
router.patch('/:id', async (req, res, next) => { try { const review = await Review.findByIdAndUpdate(req.params.id, { approved: true }, { new: true }); if (!review) return res.sendStatus(404); res.json(review); } catch (e) { next(e); } });
router.delete('/:id', async (req, res, next) => { try { await Review.findByIdAndDelete(req.params.id); res.sendStatus(204); } catch (e) { next(e); } });
export default router;
