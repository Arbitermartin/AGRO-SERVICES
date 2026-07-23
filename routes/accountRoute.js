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
const path =require("path");

const upload = multer({
  dest: "public/images/site/"
});

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "uploads", "cvs"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cv-${Date.now()}${ext}`);
  },
});

const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("Only PDF or DOCX files are allowed."), ok);
  },
});

/******************************
 * 
 * Delivery job application
 */
router.get(
  "/jobs/:id/apply",
  utilities.handleErrors(accountController.buildApplyJob)
);

router.post(
  "/jobs/:id/apply",
  uploadCV.single("cv_file"),
  utilities.handleErrors(accountController.submitJobApplication)
);
/************************************
 * 
 * Delivery view application
 */
router.post(
  "/applications/:id/status",
  utilities.checkLogin,
  utilities.checkRole("admin"),
  utilities.handleErrors(accountController.updateApplicationStatus)
);
/*************************
 * 
 * Delivery member to post job
 */
router.post(
  "/dashboard/member/jobs/:id/apply",
  utilities.checkLogin,
  uploadCV.single("cv_file"),
  utilities.handleErrors(accountController.submitMemberJobApplication)
);

/******************************
 * 
 * Delivery latest news and events and posts
 */
const newsImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "images", "news"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `news-${Date.now()}${ext}`);
  },
});
const uploadNewsImage = multer({ storage: newsImageStorage, limits: { fileSize: 3 * 1024 * 1024 } });

router.post(
  "/news/create",
  utilities.checkLogin,
  utilities.checkRole("admin"),
  uploadNewsImage.single("profile_image"),
  utilities.trackActivity("Posted a news update"),
  utilities.handleErrors(accountController.createNewsPost)
);

router.post(
  "/events/create",
  utilities.checkLogin,
  utilities.checkRole("admin"),
  utilities.trackActivity("Created an event"),
  utilities.handleErrors(accountController.createEventPost)
);
// end here

/*************************
 * 
 * Delivery get all news and events
 */
router.post("/news/:news_id/update", 
  utilities.checkLogin, 
  utilities.checkRole("admin"), 
  uploadNewsImage.single("profile_image"), 
  utilities.handleErrors(accountController.updateNewsPost));

router.post("/news/:news_id/delete", 
  utilities.checkLogin, 
  utilities.checkRole("admin"), 
  utilities.handleErrors(accountController.deleteNewsPost));

router.post("/events/:event_id/update", 
  utilities.checkLogin, 
  utilities.checkRole("admin"), 
  utilities.handleErrors(accountController.updateEventPost));

router.post("/events/:event_id/delete", 
  utilities.checkLogin, 
  utilities.checkRole("admin"), 
  utilities.handleErrors(accountController.deleteEventPost));
// end here delivery news and all events

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
/*********************
 * 
 * Delivery change password
 */
router.post(
  "/change-password",
  utilities.checkLogin,
  utilities.trackActivity("Changed password"),
  utilities.handleErrors(accountController.changePassword)
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
  utilities.trackActivity("Updated profile"),
  utilities.handleErrors(accountController.updateProfile)
);
// add job
router.post(
  "/jobs/create",
  utilities.checkLogin,
  utilities.checkRole("admin"),
  utilities.trackActivity("Created a job posting"),
  utilities.handleErrors(accountController.createJob)
);
router.post(
  "/jobs/:id/toggle-status",
  utilities.checkLogin,
  utilities.checkRole("admin"),
  utilities.handleErrors(accountController.toggleJobStatus)
);






module.exports= router