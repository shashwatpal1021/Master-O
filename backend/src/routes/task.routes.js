import express from 'express';
import * as taskController from '../controllers/task.controllers.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();


router.use(authenticateToken);
// Task routes
router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.patch('/:id/status', taskController.updateTaskStatus);
router.patch('/:id/assign', taskController.assignTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
