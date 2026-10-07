const { badRequest } = require("../utils/httpErrors");

function validate(validator) {
  return function (req, res, next) {
    const result = validator(req);

    if (!result.valid) {
      return next(
        badRequest(
          "Validation failed",
          "VALIDATION_ERROR",
          result.errors
        )
      );
    }

    next();
  };
}

module.exports = validate;