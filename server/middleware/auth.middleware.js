import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const auth = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    const token = bearerToken || req.cookies?.accessToken;

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'No token provided',
        errorCode: 'AUTH_401'
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token or user inactive',
        errorCode: 'AUTH_401'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token verification failed',
      errorCode: 'AUTH_401'
    });
  }
};
