import { Router } from 'express';
import { search } from '../controllers/courseController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/search', requireAuth, search);

export default router;
