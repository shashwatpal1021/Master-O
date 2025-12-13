import express from 'express';
import * as authController from '../controllers/auth.controllers.js';

const router = express.Router();

router.post('/login', authController.loginUser);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logoutUser);
export default router;

