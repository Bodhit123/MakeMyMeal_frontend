const Joi = require("joi");

const emailRegexPattern =
  /^[\w-]+(\.[\w-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/;

// Define login schema with email validation using custom TLD list
const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexPattern).required(),
  password: Joi.string().alphanum().min(6).max(30).required(),
});

const signupSchema = Joi.object({
  firstname: Joi.string().trim().alphanum().required(),
  lastname: Joi.string().trim().alphanum().required(),
  email: Joi.string().trim().pattern(emailRegexPattern).required(),
  mobile: Joi.string().length(10).allow('').optional(),
  role: Joi.string().valid('admin', 'employee').allow('').optional()
});

const isValid = (obj, schema) => {
  const result = schema.validate(obj, { abortEarly: false });
  return result.error;
};

const inputValidationHandler = (FormData, ComponentSchema) => {
  const Error = isValid(FormData, ComponentSchema);

  if (Error) {
    const emailAddressError =
      "Oops! Invalid Email Format";
    const errorDetails = Error.details.find(
      (detail) => detail.context.key === "email"
    );

    if (errorDetails) {
      return emailAddressError;
    } else {
      return Error.message;
    }
  }
};

export { loginSchema, signupSchema, inputValidationHandler };
