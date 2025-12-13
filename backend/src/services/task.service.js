// src/services/task.service.js
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/db.js';

const isValidStatus = (s) => ['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(s);

export const createTask = async (title, description, due_date, created_by, assigned_to = null) => {
    return prisma.task.create({
        data: {
            id: uuidv4(),
            title,
            description,
            status: 'PENDING',
            due_date: due_date ? new Date(due_date) : null,
            created_by,
            assigned_to
        }
    });
};

export const assignTask = async (taskId, assigned_to) => {
    return prisma.task.update({
        where: { id: taskId },
        data: {
            assigned_to,
            status: 'PENDING'
        }
    });
};

export const updateTaskStatus = async (taskId, status) => {
    if (!isValidStatus(status)) {
        throw new Error('Invalid status');
    }
    return prisma.task.update({
        where: { id: taskId },
        data: { status }
    });
};

export const updateTask = async (taskId, data) => {
    const updateData = { ...data };
    if (updateData.due_date) {
        updateData.due_date = new Date(updateData.due_date);
    }
    return prisma.task.update({
        where: { id: taskId },
        data: updateData
    });
};

export const deleteTask = async (taskId) => {
    return prisma.task.delete({
        where: { id: taskId }
    });
};

export const getTaskById = async (taskId) => {
    return prisma.task.findUnique({
        where: { id: taskId },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            assignedTo: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });
};

export const getUserTasks = async (userId) => {
    return prisma.task.findMany({
        where: { assigned_to: userId },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { created_at: 'desc' }
    });
};

export const getAllTasks = async () => {
    return prisma.task.findMany({
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            assignedTo: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { created_at: 'desc' }
    });
};

export const checkUserIsAssigned = async (taskId, userId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { assigned_to: true }
    });
    return task && task.assigned_to === userId;
};

export const checkUserIsCreator = async (taskId, userId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { created_by: true }
    });
    return task && task.created_by === userId;
};
