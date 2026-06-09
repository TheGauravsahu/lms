export const errorHandler = (err, req, res, next) => {
  console.error("server error: ", err);
  return res.status(500).json({
    statusCode: 500,
    message: err.message || "Internal Server Error",
    data: null,
  });
};
