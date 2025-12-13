import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { ACCESS_TOKEN } from '../config/jwt.js';

export const register = async (data) => {
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
        data: {
            ...data,
            password: hashed,
        }
    });
    return user;
}


export const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
    }
    const accessToken = jwt.sign({ id: user.id, role: user.role }, ACCESS_TOKEN, { expiresIn: '15m' });
    // create a random refresh token and persist its hash in DB (per-device)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({ data: { tokenHash, userId: user.id, expiresAt } });
    return { accessToken, refreshToken, user };
}

export const verifyRefreshToken = async (token) => {
    try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const dbToken = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
        if (!dbToken || dbToken.revoked) throw new Error('Invalid refresh token');
        if (dbToken.expiresAt < new Date()) throw new Error('Refresh token expired');
        return dbToken;
    } catch (err) {
        throw new Error('Invalid refresh token');
    }
};

export const refreshAccessToken = async (token) => {
    // Verify the refresh token and return a fresh access token (no rotation)
    const dbToken = await verifyRefreshToken(token);
    // issue a new access token for the associated user
    const accessToken = generateAccessToken(dbToken.user);
    return { accessToken, user: dbToken.user };
};

export const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, ACCESS_TOKEN, { expiresIn: '15m' });
};


