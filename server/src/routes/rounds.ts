import { Router } from 'express';
import { create, list, stats } from '../controllers/roundsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', create);
router.get('/', list);
router.get('/stats', stats);

export default router;
