import { prisma } from '../config/db.js';

export const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            tasks: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    due_date: true,
                },
            },
        },
    });
};

export const getById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            tasks: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    due_date: true,
                }
            },
        }
    });
};

export const deleteUser = async (id) => {
    // delete tasks assigned to or created by user first to avoid FK errors
    await prisma.task.deleteMany({ where: { OR: [{ assigned_to: id }, { created_by: id }] } });
    return await prisma.user.delete({ where: { id } });
};


