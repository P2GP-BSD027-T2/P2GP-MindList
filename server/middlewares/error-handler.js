const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = 500;
  let message = `Internal server error`;

  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    statusCode = 400;
    message = err.errors.map((error) => error.message).join(", ");
  }

  res.status(statusCode).json({
    statusCode: statusCode,
    error: message,
  });
};

module.exports = errorHandler;
