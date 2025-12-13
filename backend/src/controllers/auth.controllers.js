import crypto from 'crypto';
import { prisma } from '../config/db.js';
import * as authService from '../services/auth.service.js';

const isProd = process.env.NODE_ENV === 'production';

export const registerUser = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        const { password, ...safe } = user;
        res.status(201).json(safe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken, user } = await authService.login(email, password);
        const { password: _p, ...safeUser } = user;

        // Set cookies
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        res.status(200).json({ user: safeUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refresh_token } = req.cookies || {};
        if (!refresh_token) return res.status(401).json({ message: 'No refresh token' });
        const { accessToken, user } = await authService.refreshAccessToken(refresh_token);
        // set a new access token cookie (no refresh rotation)
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });
        res.status(200).json({ user });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const { refresh_token } = req.cookies || {};
        if (refresh_token) {
            try {
                // Revoke only the presented refresh token
                const tokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');
                await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
            } catch (e) {
                // ignore
                console.error(e);
            }
        }
        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/' });
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
