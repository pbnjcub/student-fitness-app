// validationMiddleware.js
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  console.log('Validating request body in ValidationMiddleware.js:', JSON.stringify(req.body, null, 2));
  const errors = validationResult(req);
  console.log('Validation errors:', errors.array());
  if (errors.isEmpty()) {
      console.log('No validation errors found');
      return next();
  }

  const extractedErrors = errors.array().map(err => {
    console.log(`The error object:" ${JSON.stringify(err)}`)
      console.log(`Error found: ${err.path} - ${err.msg}`);
      return {
          field: err.path,
          message: err.msg
      };
  });
  console.log('extractedErrors:', extractedErrors);

  return res.status(422).json({ errs: extractedErrors });
};

module.exports = validate;
