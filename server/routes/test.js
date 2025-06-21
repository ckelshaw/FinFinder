import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  console.log('✅ /api/test route hit');
  res.json({ ok: true });
});

export default router;