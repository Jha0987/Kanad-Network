import { HTTP_STATUS } from '../utils/constants.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const payload = req[source] || {};
    const { error, value } = schema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors,
        errorCode: 'VALIDATION_ERROR'
      });
    }

    req[source] = value;
    next();
  };
};
