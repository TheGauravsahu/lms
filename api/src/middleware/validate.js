// validate req body
export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    console.log("VALIDATION_RESULT", result);
    if (!result.success) {
      return res.error(
        400,
        result.error.flatten().fieldErrors,
        "Validation failed",
      );
    }

    req.body = result.data;
    next();
  };
};
