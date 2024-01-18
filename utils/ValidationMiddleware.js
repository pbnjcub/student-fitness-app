// validationMiddleware.js
// validationMiddleware.js
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  console.log("Validating request for:", req.originalUrl);
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    console.log("No validation errors found for request.");
    return next();
  }

  console.log("Validation errors found:", errors.array());
  const extractedErrors = errors.array().map(err => ({ [err.path]: err.msg }));
  return res.status(422).json({ errors: extractedErrors });
};

module.exports = validate;

