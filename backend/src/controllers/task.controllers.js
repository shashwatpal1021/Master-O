// src/controllers/task.controllers.js
import { prisma } from '../config/db.js';
import * as taskService from '../services/task.service.js';

const handleError = (res, error, defaultMessage) => {
    console.error(error);
    res.status(500).json({
        message: error.message || defaultMessage
    });
};

export const createTask = async (req, res) => {
    try {
        const { title, description, due_date } = req.body;
        console.debug('createTask body:', req.body);

        if (!title) {
            return res.status(400).json({
                message: 'Title is required'
            });
        }

        const assigned_to = req.body.userId || req.body.assigned_to || null;
        const task = await taskService.createTask(
            title,
            description,
            due_date,
            req.user.id,
            assigned_to
        );

        // fetch task with relations
        const full = await taskService.getTaskById(task.id);
        res.status(201).json(full);
    } catch (error) {
        handleError(res, error, 'Failed to create task');
    }
};

export const assignTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { assigned_to } = req.body;

        if (!assigned_to) {
            return res.status(400).json({
                message: 'assigned_to is required'
            });
        }

        const task = await taskService.getTaskById(taskId);
        if (!task) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }

        // ensure the assigned_to exists and is an EMPLOYEE
        const user = await prisma.user.findFirst({ where: { id: assigned_to, role: 'EMPLOYEE' } });

        if (!user) {
            return res.status(400).json({
                message: 'Employee not found'
            });
        }

        const updatedTask = await taskService.assignTask(taskId, assigned_to);
        const full = await taskService.getTaskById(updatedTask.id);
        res.status(200).json(full);
    } catch (error) {
        handleError(res, error, 'Failed to assign task');
    }
};

export const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const task = await taskService.getTaskById(id);
        if (!task) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }

        if (req.user.role === 'EMPLOYEE' &&
            !(await taskService.checkUserIsAssigned(id, req.user.id))) {
            return res.status(403).json({
                message: 'You can only update tasks assigned to you'
            });
        }

        const updatedTask = await taskService.updateTaskStatus(id, status);
        const full = await taskService.getTaskById(updatedTask.id);
        res.status(200).json(full);
    } catch (error) {
        handleError(res, error, 'Failed to update task status');
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, due_date } = req.body;

        const task = await taskService.getTaskById(id);
        if (!task) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }

        if (req.user.role !== 'ADMIN' &&
            !(await taskService.checkUserIsCreator(id, req.user.id))) {
            return res.status(403).json({
                message: 'You are not authorized to update this task'
            });
        }

        const updatedTask = await taskService.updateTask(id, {
            title: title || task.title,
            description: description !== undefined ? description : task.description,
            due_date: due_date ? new Date(due_date) : task.due_date
        });

        const full = await taskService.getTaskById(updatedTask.id);
        res.status(200).json(full);
    } catch (error) {
        handleError(res, error, 'Failed to update task');
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await taskService.getTaskById(id);
        if (!task) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }

        if (req.user.role !== 'ADMIN' &&
            !(await taskService.checkUserIsCreator(id, req.user.id))) {
            return res.status(403).json({
                message: 'You are not authorized to delete this task'
            });
        }

        await taskService.deleteTask(id);
        res.status(204).end();
    } catch (error) {
        handleError(res, error, 'Failed to delete task');
    }
};

export const getTasks = async (req, res) => {
    try {
        const tasks = req.user.role === 'ADMIN'
            ? await taskService.getAllTasks()
            : await taskService.getUserTasks(req.user.id);

        res.status(200).json(tasks);
    } catch (error) {
        handleError(res, error, 'Failed to fetch tasks');
    }
};
