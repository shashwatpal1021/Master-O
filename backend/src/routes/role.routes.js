import express from 'express';
import * as authController from '../controllers/auth.controllers.js';
import * as userController from '../controllers/user.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Admin-only user management routes
router.post('/register', authenticateToken, authorize('ADMIN'), authController.registerUser);
router.get('/users', authenticateToken, authorize('ADMIN'), userController.getUser);
router.delete('/users/:id', authenticateToken, authorize('ADMIN'), userController.deleteUser);

export default router;

