import ApiError from '../utils/ApiError.js';

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw ApiError.validationError(errors);
    }

    req.body = value;
    next();
  };
};

export default validate;
