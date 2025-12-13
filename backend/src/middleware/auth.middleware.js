import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN } from '../config/jwt.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    // allow token from cookie as well
    if (!token && req.cookies && req.cookies.access_token) {
        token = req.cookies.access_token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const user = jwt.verify(token, ACCESS_TOKEN);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Forbidden' });
    }
};
