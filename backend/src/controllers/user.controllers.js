import * as userService from '../services/user.service.js';

export const getUser = async (req, res) => {
    try {
        const user = await userService.getAllUsers();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await userService.getById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Prevent deleting ADMIN users
        if (user.role === 'ADMIN') {
            return res.status(403).json({ message: 'Cannot delete ADMIN users' });
        }
        await userService.deleteUser(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await userService.getById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
