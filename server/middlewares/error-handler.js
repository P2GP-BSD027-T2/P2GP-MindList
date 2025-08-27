const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = 500;
  let message = `Internal server error`;

  res.status(statusCode).json({
    statusCode: statusCode,
    error: message,
  });
};

module.exports = errorHandler;
