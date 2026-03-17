export const ROLES = {
  ADMIN: 'Admin',
  FIELD_ENGINEER: 'Field Engineer',
  NOC_ENGINEER: 'NOC Engineer',
  MANAGER: 'Manager'
};

export const INSTALLATION_STATUS = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  INSTALLED: 'Installed',
  COMMISSIONED: 'Commissioned',
  ACTIVE: 'Active'
};

export const ALARM_SEVERITY = {
  CRITICAL: 'Critical',
  MAJOR: 'Major',
  MINOR: 'Minor'
};

export const ALARM_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved'
};

export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  COMMISSION: 'COMMISSION',
  CONFIG_CHANGE: 'CONFIG_CHANGE',
  ROLLBACK: 'ROLLBACK',
  RESOLVE_ALARM: 'RESOLVE_ALARM',
  ASSIGN_ENGINEER: 'ASSIGN_ENGINEER',
  ESCALATE: 'ESCALATE'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};
