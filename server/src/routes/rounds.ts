import { Router } from 'express';
import { create, list, stats, byId, analytics } from '../controllers/roundsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', create);
router.get('/', list);
router.get('/stats', stats);
router.get('/analytics', analytics);
router.get('/:id', byId);

export default router;
