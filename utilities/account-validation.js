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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email: req.body.email,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  }
  next();
};
/* **********************************
 * Registration Data Validation Rules
 * ********************************** */
validate.registrationRules = () => [
  body("fullName")
    .trim()
    .escape()
    .isLength({ min: 3, max: 100 })
    .withMessage("Full name must be between 3 and 100 characters."),

  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email.")
    .custom(async (email) => {
      const exists = await accountModel.checkExistingEmail(email);
      if (exists) throw new Error("Email already exists. Please login.");
      return true;
    }),
    // Phone Number
   body("Phone_number")
    .trim()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number."),

  body("password")
    .trim()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password must be strong (8+ chars, upper, lower, number, symbol)."),

  body("confirm_password")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error("Passwords do not match.");
      return true;
    }),
];
/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req);
  const referrers = await accountModel.getAllReferrers(); // or whatever your function is called
const referredByAccountId = req.body.referred_by_account_id || req.query.ref || null;
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/register", {
      title: "Registration",
      nav,
      referrers,
      referredByAccountId,
      errors: errors.array(),
      fullName: req.body.fullName,
      email: req.body.email,
      Phone_number: req.body.Phone_number,
      
    });
  };
  next();
}

module.exports = validate