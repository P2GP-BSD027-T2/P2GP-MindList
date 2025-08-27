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
  } else if (err.message === "EMPTY_NAME") {
    statusCode = 400;
    message = "Name is required";
  } else if (err.message === "USER_NOT_FOUND") {
    statusCode = 404;
    message = "User not found";
  } else if (err.message === "BOARD_NOT_FOUND") {
    statusCode = 404;
    message = "Board not found.";
  }

  res.status(statusCode).json({
    statusCode: statusCode,
    error: message,
  });
};

module.exports = errorHandler;
