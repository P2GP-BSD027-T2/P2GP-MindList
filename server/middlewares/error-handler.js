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
  } else if (err.message === "EMPTY_TITLE") {
    statusCode = 400;
    message = "Title is required";
  } else if (err.message === "EMPTY_DESCRIPTION") {
    statusCode = 400;
    message = "Description is required";
  } else if (err.message === "EMPTY_STATUS") {
    statusCode = 400;
    message = "Status is required";
  } else if (err.message === "EMPTY_ORDER") {
    statusCode = 400;
    message = "Order is required";
  } else if (err.message === "EMPTY_REQ_FILE") {
    statusCode = 400;
    message = "File is required";
  } else if (err.message === "ATTACHMENT_NOT_FOUND") {
    statusCode = 404;
    message = "Attachment not found";
  }

  res.status(statusCode).json({
    statusCode: statusCode,
    error: message,
  });
};

module.exports = errorHandler;
