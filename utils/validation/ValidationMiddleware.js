// validationMiddleware.js
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
      console.log('No validation errors found');
      return next();
  }

  const extractedErrors = errors.array().map(err => {
      return {
          field: err.path,
          message: err.msg
      };
  });

  return res.status(422).json({ errs: extractedErrors });
};

module.exports = validate;
