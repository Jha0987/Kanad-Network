import { HTTP_STATUS } from '../utils/constants.js';

export const role = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
        errorCode: 'AUTH_401'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Access denied. Insufficient permissions',
        errorCode: 'FORBIDDEN_403'
      });
    }

    next();
  };
};
