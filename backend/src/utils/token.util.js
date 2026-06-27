const jwt = require('jsonwebtoken');
const env = require('../config/env');

const ACCESS_EXPIRES_IN = env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN || '7d';

// Short-lived access token (SRS default: 15 minutes)
exports.signToken = (user) =>
    jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });

// Long-lived refresh token (SRS default: 7 days)
exports.signRefreshToken = (user) =>
    jwt.sign({ id: user.id, role: user.role, type: 'refresh' }, env.JWT_SECRET, {
        expiresIn: REFRESH_EXPIRES_IN,
    });

exports.verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);

exports.ACCESS_EXPIRES_IN = ACCESS_EXPIRES_IN;
exports.REFRESH_EXPIRES_IN = REFRESH_EXPIRES_IN;
