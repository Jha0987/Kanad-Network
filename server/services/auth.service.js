import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/env.js';

class AuthService {
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw { statusCode: 409, message: 'User already exists', errorCode: 'USER_EXISTS' };
    }

    const user = await User.create(userData);
    const tokens = this.generateTokens(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      ...tokens
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      throw { statusCode: 401, message: 'Invalid credentials', errorCode: 'INVALID_CREDENTIALS' };
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid credentials', errorCode: 'INVALID_CREDENTIALS' };
    }

    const tokens = this.generateTokens(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      ...tokens
    };
  }

  generateTokens(userId) {
    const accessToken = jwt.sign({ id: userId }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE
    });

    const refreshToken = jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRE
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        throw new Error('Invalid token');
      }

      return this.generateTokens(user._id);
    } catch (error) {
      throw { statusCode: 401, message: 'Invalid refresh token', errorCode: 'INVALID_TOKEN' };
    }
  }
}

export default new AuthService();
