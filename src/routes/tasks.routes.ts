import { Router } from 'express';
import { body } from 'express-validator';
import * as tasksController from '../controllers/tasks.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateMiddleware } from '../middleware/validate.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/stats', tasksController.stats);
router.get('/', tasksController.findAll);
router.get('/:id', tasksController.findOne);

router.post('/',
  body('title').notEmpty().isString().isLength({ max: 200 }),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  validateMiddleware,
  tasksController.create,
);

router.patch('/:id', tasksController.update);
router.delete('/:id', tasksController.remove);

export default router;
