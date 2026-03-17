import { HTTP_STATUS, ROLES } from '../utils/constants.js';

const MODULE_ACCESS = {
  dashboard: [ROLES.ADMIN, ROLES.MANAGER],
  sites: [ROLES.ADMIN, ROLES.FIELD_ENGINEER, ROLES.MANAGER],
  commissioning: [ROLES.ADMIN, ROLES.FIELD_ENGINEER],
  configuration: [ROLES.ADMIN, ROLES.FIELD_ENGINEER, ROLES.MANAGER],
  alarms: [ROLES.ADMIN, ROLES.NOC_ENGINEER],
  reports: [ROLES.ADMIN, ROLES.MANAGER],
  audit: [ROLES.ADMIN, ROLES.MANAGER],
  map: [ROLES.ADMIN, ROLES.FIELD_ENGINEER, ROLES.NOC_ENGINEER, ROLES.MANAGER]
};

export const permission = (moduleName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
        errorCode: 'AUTH_401'
      });
    }

    const allowedRoles = MODULE_ACCESS[moduleName] || [];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: `Access denied for ${moduleName} module`,
        errorCode: 'FORBIDDEN_403'
      });
    }

    next();
  };
};

export const getModuleAccess = () => MODULE_ACCESS;
