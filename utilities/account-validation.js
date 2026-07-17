const utilities = require(".")
const accountModel =require("../models/account-model")
const { body, validationResult } = require("express-validator");
const validate = {};

/**********
 * Login Data validation Rules
 *************************/

/* Login Data Validation Rules */
validate.loginRules = () => {
  return [
    body("email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("password")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a password.")
  ]
}

/* Check Login Data */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}
/* **********************************
 * Registration Data Validation Rules
 * ********************************** */
validate.registrationRules = () => {
  return [
    // Full Name
    body("fullName")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Please provide your full name."),

    // Email
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (email) => {
        const emailExists = await accountModel.checkExistingEmail(email);

        if (emailExists) {
          throw new Error(
            "Email already exists. Please log in or use another email."
          );
        }
      }),

    // Phone Number
    body("Phone_number")
      .trim()
      .notEmpty()
      .isMobilePhone("any")
      .withMessage("Please provide a valid phone number."),

    // Password
    body("password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must contain at least 8 characters, including uppercase, lowercase, number and symbol."
      ),

    // ✅ NEW: Confirm Password
    body("confirm_password")
      .trim()
      .notEmpty()
      .withMessage("Please confirm your password.")
      .custom((confirm_password, { req }) => {
        if (confirm_password !== req.body.password) {
          throw new Error("Passwords do not match.");
        }
        return true;
      }),
  ];
};
/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { fullName, email, Phone_number } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();   // ✅ needed since your layout likely uses nav
    return res.render("account/register", {
      title: "Registration",
      nav,                                 // ✅ added
      errors: errors.array(),              // ✅ so you can loop with err.msg in EJS
      fullName,
      email,
      Phone_number,
    });
  }

  next();
};

module.exports = validate