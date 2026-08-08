/***********************
 * ACCOUNT ROUTE
 */
const express =require("express")
const router =new express.Router()
const accountController =require("../controllers/accountController")
const utilities =require("../utilities")
const regValidate = require('../utilities/account-validation')
const multer = require("multer");
const path =require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

const upload = multer({
  dest: "public/images/site/"
});

const guidesUploadPath = path.join(__dirname, "..", "public", "uploads", "guides");
if (!fs.existsSync(guidesUploadPath)) {
  fs.mkdirSync(guidesUploadPath, { recursive: true });
}

const guideStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, guidesUploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `guide-${Date.now()}${ext}`);
  },
});

const uploadGuide = multer({
  storage: guideStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ok = path.extname(file.originalname).toLowerCase() === ".pdf";
    cb(ok ? null : new Error("Only PDF files are allowed."), ok);
  },
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

// delivery profile photo
const profilePhotoPath = path.join(__dirname, "..", "public", "images", "profile_photos");
if (!fs.existsSync(profilePhotoPath)) {
  fs.mkdirSync(profilePhotoPath, { recursive: true });
}

const profilePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilePhotoPath);
  },
  filename: (req, file, cb) => {
    const accountId = req.session.account.id;
    const ext = path.extname(file.originalname);
    cb(null, `profile-${accountId}-${Date.now()}${ext}`);
  },
});

const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("Only JPG, PNG, or WEBP images are allowed."), ok);
  },
});


// delivery tasks upload

const taskReportsPath = path.join(__dirname, "..", "public", "uploads", "task-reports");
if (!fs.existsSync(taskReportsPath)) {
  fs.mkdirSync(taskReportsPath, { recursive: true });
}

const taskReportStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, taskReportsPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `report-${Date.now()}${ext}`);
  },
});

const uploadTaskReport = multer({
  storage: taskReportStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("Only PDF or DOC/DOCX files are allowed."), ok);
  },
});
// end here for both admin and icts

/************************
 * Delivery testmonials
 */
const testimonialPhotoPath = path.join(__dirname, "..", "public", "images", "testimonials");
if (!fs.existsSync(testimonialPhotoPath)) {
  fs.mkdirSync(testimonialPhotoPath, { recursive: true });
}

const testimonialPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, testimonialPhotoPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `testimonial-${Date.now()}${ext}`);
  },
});

const uploadTestimonialPhoto = multer({
  storage: testimonialPhotoStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("Only JPG or PNG images are allowed."), ok);
  },
});
// end here testimonials.

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

// Delivery upload materials
const materialsUploadPath = path.join(__dirname, "..", "public", "uploads", "materials");
if (!fs.existsSync(materialsUploadPath)) {
  fs.mkdirSync(materialsUploadPath, { recursive: true });
}

const materialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, materialsUploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `material-${Date.now()}${ext}`);
  },
});

const uploadMaterial = multer({
  storage: materialStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|mp4|mov/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("Only PDF, DOCX, or video files are allowed."), ok);
  },
});
// end here

/****************************
 * 
 * Delivery team member upload
 */
const teamPhotoPath = path.join(__dirname, "..", "public", "images", "team");
if (!fs.existsSync(teamPhotoPath)) {
  fs.mkdirSync(teamPhotoPath, { recursive: true });
}

const teamPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, teamPhotoPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `team-${Date.now()}${ext}`);
  },
});

const uploadTeamPhoto = multer({
  storage: teamPhotoStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("Only JPG or PNG images are allowed."), ok);
  },
});
// team member upload end here.


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

//Login rate limiter now
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  handler: (req, res) => {
    req.flash("error", "Too many login attempts. Please try again after 10 minutes.");
    return res.redirect("/account/login");   // safe now — GET isn't rate-limited
  },
});

router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Process the login request
router.post(
    "/login",
    loginLimiter,
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
  uploadProfilePhoto.single("profile_photo"),
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

/***********************************
 * 
 * Delivery training
 */
router.post(
  "/trainings/create",
  utilities.checkLogin,
  utilities.checkRole("admin"),
  utilities.trackActivity("Added a training program"),
  utilities.handleErrors(accountController.createTrainingPost)
);

router.post(
  "/trainings/:id/register",
  utilities.checkLogin,
  utilities.handleErrors(accountController.registerTraining)
);

/*******************************
 * 
 * Delivery training registrations
 */
router.post(
  "/training-registrations/:id/status",
  utilities.checkLogin,
  utilities.checkRole("admin"),
  utilities.handleErrors(accountController.updateTrainingRegistrationStatus)
);
// end here

/*****************
 * 
 * Delivery training guide
 */
router.post(
  "/training-guides/upload",
  utilities.checkLogin,
  utilities.checkRole("ict_staff"),
  uploadGuide.single("guide_file"),
  utilities.trackActivity("Uploaded a training guide"),
  utilities.handleErrors(accountController.uploadTrainingGuide)
);

router.post(
  "/training-guides/:id/delete",
  utilities.checkLogin,
  utilities.checkRole("ict_staff"),
  utilities.handleErrors(accountController.deleteTrainingGuide)
);
// end here

/**********************
 * 
 * Delivery lesson and materials
 */
router.post("/lessons/create", 
  utilities.checkLogin, 
  utilities.checkRole("ict_staff"), 
  utilities.trackActivity("Added a lesson"), 
  utilities.handleErrors(accountController.createLessonPost));

router.post("/lesson-materials/upload",
   utilities.checkLogin, 
   utilities.checkRole("ict_staff"), 
   uploadMaterial.single("material_file"), 
   utilities.trackActivity("Uploaded lesson material"), 
   utilities.handleErrors(accountController.uploadLessonMaterial));

router.post("/lesson-materials/:id/delete", 
  utilities.checkLogin, 
  utilities.checkRole("ict_staff"), 
  utilities.handleErrors(accountController.deleteLessonMaterialPost));

router.get("/lessons/:lessonId", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.viewLesson));

router.post("/lessons/:lessonId/complete", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.completeLesson));
  //end here.

  // ticket messages
  router.post("/tickets/create", 
    utilities.checkLogin, 
    utilities.trackActivity("Created a support ticket"), 
    utilities.handleErrors(accountController.createSupportTicket));

router.post("/tickets/:id/status", 
  utilities.checkLogin, 
  utilities.checkRole("ict_staff"), 
  utilities.handleErrors(accountController.updateTicketStatusPost));

router.post("/tickets/:id/reply", 
  utilities.checkLogin, 
  utilities.trackActivity("Replied to a support ticket"), 
  utilities.handleErrors(accountController.replyToTicket));

  // get ticket message
  router.get("/tickets/:id/messages", 
    utilities.checkLogin,
    utilities.handleErrors(accountController.getTicketMessagesJson));

    /*********************
     * 
     * deactivate post and reactivate post
     */
    router.post("/accounts/:id/deactivate", 
      utilities.checkLogin, 
      utilities.checkRole("admin"), 
      utilities.handleErrors(accountController.deactivateAccountPost));

    router.post("/accounts/:id/reactivate", 
      utilities.checkLogin, 
      utilities.checkRole("admin"), 
      utilities.handleErrors(accountController.reactivateAccountPost));
      
/**************************
* Delivery team member
*/
  router.post(
  "/team/create",
  utilities.checkLogin,
  utilities.checkRole("ict_staff"),
  uploadTeamPhoto.single("photo"),
  utilities.trackActivity("Posted a team member"),
  utilities.handleErrors(accountController.createTeamMemberPost)
);

router.post(
  "/team/:id/delete",
  utilities.checkLogin,
  utilities.checkRole("ict_staff"),
  utilities.handleErrors(accountController.deleteTeamMemberPost)
);
router.post(
  "/team/:id/update",
  utilities.checkLogin,
  utilities.checkRole("admin"),
  uploadTeamPhoto.single("photo"),
  utilities.handleErrors(accountController.updateTeamMemberPost)
);

router.post(
  "/team/:id/admin-delete",
  utilities.checkLogin,
  utilities.checkRole("admin"),
  utilities.handleErrors(accountController.deleteTeamMemberAdminPost)
);
// end here.

// Delivery update 
router.get("/members/:id/profile", 
  utilities.checkLogin, 
  utilities.checkRole("admin"), 
  utilities.handleErrors(accountController.viewMemberProfile));

router.get("/members/:id/profile/download", 
  utilities.checkLogin, 
  utilities.checkRole("admin"), 
  utilities.handleErrors(accountController.downloadMemberProfilePdf));
  // end here

  // delivery markread message.
  router.post(
    "/messages/:id/read", 
    utilities.checkLogin, 
    utilities.checkRole("ict_staff"), 
    utilities.handleErrors(accountController.markMessageReadPost));

    /*************************************
     * Delivery event registraion views
     */
  
    router.post("/event-registrations/:id/delete", 
      utilities.checkLogin, 
      utilities.checkRole("admin"), 
      utilities.handleErrors(accountController.deleteEventRegistrationPost));

    router.get("/events/:eventId/registrations/download", 
      utilities.checkLogin, 
      utilities.checkRole("admin"), 
      utilities.handleErrors(accountController.downloadEventRegistrationsPdf));
      // end here registered users.

      /***************************************
       * 
       * Delivery get search
       */

      router.get("/search/admin", 
        utilities.checkLogin, 
        utilities.checkRole("admin"), 
        utilities.handleErrors(accountController.searchAdmin));

      router.get("/search/ict", 
        utilities.checkLogin, 
        utilities.checkRole("ict_staff"), 
        utilities.handleErrors(accountController.searchIct));

      router.get("/search/member", 
        utilities.checkLogin, 
        utilities.handleErrors(accountController.searchMember));

        /*********************
         * payment check
         */
        router.post(
  "/payments/:id/approve",
  utilities.checkLogin,
  utilities.checkRole("admin"),
  utilities.handleErrors(accountController.approvePaymentPost)
);

router.post(
  "/payments/:id/reject",
  utilities.checkLogin,
  utilities.checkRole("admin"),
  utilities.handleErrors(accountController.rejectPaymentPost)
);

/************************
 * Delivery ict to delete member
 */
router.post(
  "/members/:id/reset-password",
  utilities.checkLogin,
  utilities.checkRole("ict_staff"),
  utilities.handleErrors(accountController.ictResetMemberPassword)
);

router.post(
  "/members/:id/delete",
  utilities.checkLogin,
  utilities.checkRole("ict_staff"),
  utilities.handleErrors(accountController.ictDeleteMember)
);
// end here

/*******************
 * 
 * Delivery admin 
 */
router.post("/admins/create", 
  utilities.checkLogin, 
  utilities.checkSuperAdmin, 
  utilities.handleErrors(accountController.createAdminPost));

router.post("/admins/:id/update-level", 
  utilities.checkLogin, 
  utilities.checkSuperAdmin, 
  utilities.handleErrors(accountController.updateAdminLevelPost));

router.post("/admins/:id/delete", 
  utilities.checkLogin, 
  utilities.checkSuperAdmin, 
  utilities.handleErrors(accountController.deleteAdminPost));
  // end here.

  /******************
   * Delivery notifications here
   */
router.get("/notifications", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.getNotificationsJson));

router.post("/notifications/:id/read",
   utilities.checkLogin, 
   utilities.handleErrors(accountController.markNotificationReadPost));

router.post("/notifications/mark-all-read", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.markAllNotificationsReadPost));

router.post("/notifications/:id/delete", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.deleteNotificationPost));
  // end here.

  // delivery create ict staff
  router.post(
  "/ict-staff/create",
  utilities.checkLogin,
  utilities.checkSuperAdmin,
  utilities.handleErrors(accountController.createIctStaffPost)
);
// end here

/************************
 * Delivery admin manage all ict staffs
 */
router.post("/ict-staff/:id/update", 
  utilities.checkLogin, 
  utilities.checkSuperAdmin, 
  utilities.handleErrors(accountController.updateIctStaffPost));

router.post("/ict-staff/:id/reset-password", 
  utilities.checkLogin, 
  utilities.checkSuperAdmin, 
  utilities.handleErrors(accountController.adminResetIctPasswordPost));

router.post("/ict-staff/:id/delete", 
  utilities.checkLogin, 
  utilities.checkSuperAdmin, 
  utilities.handleErrors(accountController.deleteIctStaffPost));

  // end here.

  // delivery task for minor admin and icts
router.post("/tasks/create", 
  utilities.checkLogin, 
  utilities.checkSuperAdmin, 
  utilities.handleErrors(accountController.createTaskPost));

router.post("/tasks/:id/delete", 
  utilities.checkLogin, 
  utilities.checkSuperAdmin, 
  utilities.handleErrors(accountController.deleteTaskPost));

router.post("/task-assignees/:taskAssigneeId/status", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.updateIndividualTaskStatusPost));

router.post("/task-assignees/:taskAssigneeId/submit-report", 
  utilities.checkLogin, 
  uploadTaskReport.single("report_file"), 
  utilities.handleErrors(accountController.submitTaskReportPost));

  // end here.

  /***************************
   * 
   * Delivery testimonials test
   */
router.post("/testimonials/create", 
  utilities.checkLogin, 
  utilities.checkRole("admin"), uploadTestimonialPhoto.single("photo"), utilities.handleErrors(accountController.createTestimonialPost));

router.post("/testimonials/:id/update", 
  utilities.checkLogin, 
  utilities.checkRole("admin"), 
  uploadTestimonialPhoto.single("photo"), 
  utilities.handleErrors(accountController.updateTestimonialPost));

router.post("/testimonials/:id/delete", 
  utilities.checkLogin, 
  utilities.checkRole("admin"), 
  utilities.handleErrors(accountController.deleteTestimonialPost));
  // end here.

  // register
router.get("/register", 
  utilities.handleErrors(accountController.buildRegisterGate));   // ✅ gate page first
router.get("/register/form", 
  utilities.handleErrors(accountController.buildRegister));  // ✅ actual form, only reachable if open

router.post("/intakes/create", 
  utilities.checkLogin, 
  utilities.checkRole("admin"), 
  utilities.handleErrors(accountController.createIntakePost));

router.post("/intakes/:id/close", 
  utilities.checkLogin, 
  utilities.checkRole("admin"), 
  utilities.handleErrors(accountController.closeIntakePost));
  // end here

module.exports= router