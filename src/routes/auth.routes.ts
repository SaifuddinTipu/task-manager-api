import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { validateMiddleware } from '../middleware/validate.middleware';

const router = Router();

router.post('/register',
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8 }),
  validateMiddleware,
  authController.register,
);

router.post('/login',
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8 }),
  validateMiddleware,
  authController.login,
);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
