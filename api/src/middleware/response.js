export const responseMiddleware = (req, res, next) => {
  res.success = (statusCode, data = null, message = "Success") => {
    return res.status(statusCode || 200).json({
      statusCode,
      message,
      data,
    });
  };
  res.error = (statusCode, error = null, message = "Error") => {
    return res.status(400).json({
      statusCode,
      error,
      message,
    });
  };
  next();
};
