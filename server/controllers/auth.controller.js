import authService from '../services/auth.service.js';
import { HTTP_STATUS } from '../utils/constants.js';
import config from '../config/env.js';

const cookieOptions = {
  httpOnly: true,
  secure: config.COOKIE_SECURE,
  sameSite: config.COOKIE_SAME_SITE,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw { statusCode: 401, message: 'Refresh token not found', errorCode: 'NO_TOKEN' };
    }

    const tokens = await authService.refreshToken(refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken: tokens.accessToken }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken');
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { user: req.user }
  });
};
