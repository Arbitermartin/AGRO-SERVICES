/*
Account route
Deliver a login view
*/
// need resources
const express =require("express")
const router =new express.Router()
const accountController =require("../controllers/accountController")
const utilities =require("../utilities")
const regValidate = require('../utilities/account-validation')
const multer = require("multer");

const upload = multer({
  dest: "public/images/site/"
});


/* ****************************************
 * Deliver views
 * *************************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Process the login request
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
  )

  // Register account
  router.post(
    "/register",
    upload.single("payment_proof"),
    regValidate.registrationRules(),   
    regValidate.checkRegData,          
    accountController.registerAccount  
  );

  /* ****************************************
 * Dashboards — protected by login + role
 * *************************************** */
router.get(
  "/dashboard/admin",
  utilities.checkLogin,
  utilities.checkRole("admin"),
  utilities.handleErrors(accountController.buildAdminDashboard)
);

router.get(
  "/dashboard/ict-staff",
  utilities.checkLogin,
  utilities.checkRole("ict_staff"),
  utilities.handleErrors(accountController.buildIctStaffDashboard)
);

router.get(
  "/dashboard/member",
  utilities.checkLogin,
  utilities.checkRole("member"),
  utilities.handleErrors(accountController.buildMemberDashboard)
);

/* ****************************************
 * Logout
 * *************************************** */
router.get("/logout", accountController.accountLogout);

/****************************
 * 
 * update profile
 */
router.post(
  "/update-profile",
  utilities.checkLogin,
  utilities.handleErrors(accountController.updateProfile)
);






module.exports= router