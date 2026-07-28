const utilities = require("../utilities")
const path = require("path");
const bcrypt = require('bcrypt'); // For password hashing
const accountModel = require("../models/account-model");

const db = require('../database/db');
const { title } = require("process");
const { error } = require("console");

async function accountManagement(req,res,next){
    res.render("dashboards/index", {
        title: "YASNET Dashboard",

      })

      
}
/* ****************************************
 * Deliver registration view
 * *************************************** */
async function buildRegister(req, res) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Registration",
    nav,
    errors: null,
  });
}
/***************************
 * Deliver build login
 *******************/
async function buildLogin(req,res) {
  let nav = await utilities.getNav();
  res.render("account/login"),{
    title: "Login",
    nav,
    error: null,
    success: req.flash("success"),
    error: req.flash("error"),
  }
  
}

/* ****************************************
 * Process registration
 * *************************************** */
async function registerAccount(req, res) {
  try {
    const { fullName, email, Phone_number, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await accountModel.registerAccount(fullName, email, Phone_number, hashedPassword);

    req.flash("success", "Registration successful. Please log in.");
    res.redirect("/account/login");
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      req.flash("error", "Email already exists. Please log in or use another email.");
      return res.redirect("/account/register");
    }

    res.status(500).send("Registration failed.");
  }
}
/* ****************************************
 * Process login and redirect based on role
 * *************************************** */
async function accountLogin(req, res) {
  try {
    const { email, password } = req.body;

    const account = await accountModel.getAccountByEmail(email);

    if (!account) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/account/login");
    }

    const passwordMatch = await bcrypt.compare(password, account.password);

    if (!passwordMatch) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/account/login");
    }

    if (account.status !== "active") {
      req.flash("error", "Your account is not active yet. Please contact support.");
      return res.redirect("/account/login");
    }
     // ✅ Create a login log entry
     const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
     const loginLog = await accountModel.createLoginLog(account.id, account.full_name, account.account_type, ip);
 

    // Store minimal account info in session (never store the password hash)
    req.session.account = {
      id: account.id,
      full_name: account.full_name,
      email: account.email,
      account_type: account.account_type,
      loginLogId: loginLog.id,
    };

    switch (account.account_type) {
      case "admin":
        return res.redirect("/account/dashboard/admin");
      case "ict_staff":
        return res.redirect("/account/dashboard/ict-staff");
      case "member":
        return res.redirect("/account/dashboard/member");
      default:
        req.flash("error", "Account type not recognized.");
        return res.redirect("/account/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed.");
  }
}
/* ****************************************
 * Helper: get initials from a full name
 * e.g. "John Doe" -> "JD", "Grace" -> "G"
 * *************************************** */
function getInitials(fullName) {
  if (!fullName) return "?";
  return fullName
    .trim()
    .split(/\s+/)
    .map(word => word[0].toUpperCase())
    .slice(0, 2)
    .join("");
}
/* ****************************************
 * Delivery admin dashboard here.
 * *************************************** */
async function buildAdminDashboard(req, res) {
  let nav = await utilities.getNav();
  const account = req.session.account;
  const profile = (await accountModel.getProfileByAccountId(account.id)) || {};
  const birthPlace = profile.id ? (await accountModel.getBirthPlaceByProfileId(profile.id)) || {} : {};
  const adminDetails = profile.id ? (await accountModel.getAdminDetailsByProfileId(profile.id)) || {} : {};
  const allJobs = await accountModel.getAllJobs();
  const allApplications = await accountModel.getAllApplications();
  const jobCount = await accountModel.countAllJobs();       // ✅ new
  const openJobCount = await accountModel.countOpenJobs();
  const eventCount = await accountModel.countAllEvents();           // ✅ new
  const upcomingEventCount = await accountModel.countUpcomingEvents();
  const allNews = await accountModel.getAllNews();
  const allEvents = await accountModel.getAllEventsAdmin();
  const allTrainingRegistrations = await accountModel.getAllTrainingRegistrations();
  const allAccounts = await accountModel.getAllAccounts();
  const totalMembers = await accountModel.countMembersOnly();
  const newMembersThisMonth = await accountModel.countNewMembersThisMonth();
  const totalAdmins = await accountModel.countAdminsOnly();

  res.render("dashboards/index", {
    title: "Admin Dashboard",
    nav,
    account,
    initials: getInitials(account.full_name),
    profile,
    birthPlace,
    adminDetails,
    allJobs,
    allApplications,
    jobCount,
    openJobCount,
    eventCount,
    upcomingEventCount,
    allNews,
    allEvents,
    allTrainingRegistrations,
    allAccounts,
    totalMembers,
    newMembersThisMonth,
    totalAdmins,
      // Add these two lines 👇
    showNav: false,
    showFooter: false,
    success: req.flash("success"),   
    error: req.flash("error"),       
  });
}

/************************************
 * 
 * Delivery training update
 */

async function updateTrainingRegistrationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await accountModel.updateTrainingRegistrationStatus(id, status);

    req.flash("success", "Registration status updated.");
    res.redirect("/account/dashboard/admin?trainingPosted=true");
  } catch (error) {
    console.error("UPDATE TRAINING REG STATUS ERROR:", error);
    req.flash("error", "Failed to update registration status.");
    res.redirect("/account/dashboard/admin");
  }
}
/***********************
 * 
 * delivery application status
 */
async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await accountModel.updateApplicationStatus(id, status);

    req.flash("success", "Application status updated.");
    res.redirect("/account/dashboard/admin?jobPosted=true");
  } catch (error) {
    console.error("UPDATE APPLICATION STATUS ERROR:", error);
    req.flash("error", "Failed to update application status.");
    res.redirect("/account/dashboard/admin");
  }
}
async function toggleJobStatus(req, res) {
  try {
    const jobId = req.params.id;
    await accountModel.toggleJobStatus(jobId);

    req.flash("success", "Job status updated.");
    res.redirect("/account/dashboard/admin?jobPosted=true");
  } catch (error) {
    console.error("TOGGLE JOB STATUS ERROR:", error);
    req.flash("error", "Failed to update job status.");
    res.redirect("/account/dashboard/admin");
  }
}

/****************************
 *
 * Delivery create job 
 */
async function createJob(req, res) {
  try {
    const { title, region, job_type, category, description, start_date, end_date } = req.body;
    console.log("JOB BODY:", req.body);

    await accountModel.createJob({ title, region, job_type, category, description, start_date, end_date });

    req.flash("success", "Job posting published successfully.");
    res.redirect("/account/dashboard/admin?jobPosted=true");
  } catch (error) {
    // console.error(error);
    console.error("CREATE JOB ERROR:", error);
    req.flash("error", "Failed to publish job posting.");
    res.redirect("/account/dashboard/admin");
  }
}
/***************************************
 * Delivery Update profile page
 *********************/
async function updateProfile(req, res) {
  try {
    const accountId = req.session.account.id;
    const { full_name, date_of_birth, gender, nationality, bio, region, district, ward, department, office, admin_role } = req.body;

    await accountModel.updateFullName(accountId, full_name);
    req.session.account.full_name = full_name;

    const profile = await accountModel.upsertProfile(accountId, { date_of_birth, gender, nationality, bio });
    await accountModel.upsertBirthPlace(profile.id, { region, district, ward });
    await accountModel.upsertAdminDetails(profile.id, { department, office, admin_role });

    req.flash("success", "Profile updated successfully.");
    res.redirect("/account/dashboard/admin?profileUpdated=true");
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to update profile.");
    res.redirect("/account/dashboard/admin");
  }
}

async function buildIctStaffDashboard(req, res) {
  let nav = await utilities.getNav();
  const loginLogs = await accountModel.getAllLoginLogs();
  const activityLogs = await accountModel.getAllActivityLogs();
  const allGuides = await accountModel.getAllTrainingGuides();
  const allTrainings = await accountModel.getAllTrainings();
  const allLessons = await accountModel.getAllLessons();
  const allTickets = await accountModel.getAllTickets();
  const ticketCounts = await accountModel.countTicketsByStatus();
  const recentTickets = allTickets.slice(0, 4);
  res.render("dashboards/ict-staff", {
    title: "ICT Staff Dashboard",
    nav,
    account: req.session.account,
    initials: getInitials(req.session.account.full_name),
    loginLogs,
    activityLogs,
    allGuides,
    allTrainings,
    allLessons,
    allTickets,
    ticketCounts,
    recentTickets,
     // Add these two lines 👇
     showNav: false,
     showFooter: false,
     success: req.flash("success"),   
     error: req.flash("error"),
  });
}

async function buildMemberDashboard(req, res) {
  let nav = await utilities.getNav();
  const account = req.session.account;   // ← This line MUST exist

    if (!account || !account.id) {
      req.flash("error", "Please log in to access the dashboard.");
      return res.redirect("/account/login");
    }
  const jobs = await accountModel.getAllOpenJobs();
  const myApplications = await accountModel.getApplicationsByAccountId(account.id);
  const profile = await accountModel.getProfileByAccountId(account.id) || {};
  const birthPlace = profile.id 
    ? (await accountModel.getBirthPlaceByProfileId(profile.id) || {}) 
    : {};
    const memberDetails = profile.id ? (await accountModel.getAdminDetailsByProfileId(profile.id)) || {} : {};
    const myApplicationsCount = await accountModel.countApplicationsByAccountId(account.id);
    const activeTrainings = await accountModel.getActiveTrainings();
    const myTrainings = await accountModel.getMyTrainingRegistrations(account.id);
    const myTrainingIds = myTrainings.map(t => t.training_id);
    const myLearningProgress = await accountModel.getTrainingProgressSummary(account.id);   
    const myTickets = await accountModel.getTicketsByAccountId(account.id);

  // For each training, figure out which lesson to jump to (first incomplete, or first lesson if none started)
  for (const item of myLearningProgress) {
    const lessons = await accountModel.getLessonsByTrainingId(item.training_id);
    const completedIds = (await accountModel.getProgressForTraining(account.id, item.training_id)).map(p => p.lesson_id);
    const nextLesson = lessons.find(l => !completedIds.includes(l.lesson_id));
    item.next_lesson_id = nextLesson ? nextLesson.lesson_id : (lessons.length > 0 ? lessons[0].lesson_id : null);
    item.has_lessons = lessons.length > 0;
  }

  // === Calculate profile completion (adjust fields to match your actual columns) ===
  let completed = 0;
  const totalFields = 8;   // change this number to match how many fields you check

  if (account.full_name) completed++;
  if (account.email) completed++;
  if (account.phone) completed++;
  if (account.profile_image || account.avatar) completed++;
  if (account.address || account.location) completed++;
  if (account.bio || account.about) completed++;
  if (account.date_of_birth || account.dob) completed++;
  if (account.gender) completed++;
  // add/remove fields according to what exists in your users/accounts table

  const profileCompletion = Math.round((completed / totalFields) * 100);
  res.render("dashboards/member", {
    title: "Member Dashboard",
    nav,
    account,
    initials: getInitials(req.session.account.full_name),
    profile,
    birthPlace,
    memberDetails,
    jobs,
    myApplications,
    myApplicationsCount,
    activeTrainings,
    myTrainings,
    myTrainingIds,
    myLearningProgress,
    myTickets,
    profileCompletion,
     // Add these two lines 👇
     showNav: false,
     showFooter: false,
     success: req.flash("success"),   // ← ADD THIS
     error: req.flash("error"),
  });
}
/***************************************
 * 
 * Delivery member submit application
 */
async function submitMemberJobApplication(req, res) {
  try {
    const jobId = req.params.id;
    const { applicant_name, applicant_email, applicant_phone, cover_letter, years_experience } = req.body;

    if (!req.file) {
      req.flash("error", "Please upload your CV/Resume.");
      return res.redirect("/account/dashboard/member");
    }

    const accountId = req.session.account.id;
    const cvFilePath = `/uploads/cvs/${req.file.filename}`;

    await accountModel.createJobApplication({
      job_id: jobId,
      account_id: accountId,
      applicant_name,
      applicant_email,
      applicant_phone,
      cover_letter,
      years_experience: parseInt(years_experience, 10) || 0,
      cv_file_path: cvFilePath,
    });

    req.flash("success", "Your application has been submitted successfully!");
    res.redirect("/account/dashboard/member");
  } catch (error) {
    console.error("SUBMIT MEMBER APPLICATION ERROR:", error);
    req.flash("error", "Failed to submit your application. Please try again.");
    res.redirect("/account/dashboard/member");
  }
}
/*****************************
 * *****
 * Delivery change password
 * 
 *********************/
async function changePassword(req, res) {
  try {
    const { current_password, new_password, confirm_new_password } = req.body;
    const accountId = req.session.account.id;

    if (new_password !== confirm_new_password) {
      req.flash("error", "New passwords do not match.");
      return res.redirect("/account/dashboard/admin");
    }

    const account = await accountModel.getAccountById(accountId);
    const currentMatch = await bcrypt.compare(current_password, account.password);

    if (!currentMatch) {
      req.flash("error", "Current password is incorrect.");
      return res.redirect("/account/dashboard/admin");
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    await accountModel.updatePassword(accountId, hashedNewPassword);

    req.flash("success", "Password updated successfully.");
    res.redirect("/account/dashboard/admin?passwordChanged=true");
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to update password.");
    res.redirect("/account/dashboard/admin");
  }
}

/***********************************
 * 
 * Delivery build job application
 ******************/
async function buildApplyJob(req, res) {
  try {
    const jobId = req.params.id;
    const job = await accountModel.getJobById(jobId);

    if (!job) {
      req.flash("error", "Job posting not found.");
      return res.redirect("/jobs");
    }

    let nav = await utilities.getNav();
    res.render("account/apply-job", {
      title: `Apply — ${job.title}`,
      nav,
      job,
      errors: null,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("BUILD APPLY JOB ERROR:", error);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/jobs");
  }
}
async function submitJobApplication(req, res) {
  try {
    const jobId = req.params.id;
    const { applicant_name, applicant_email, applicant_phone, cover_letter, years_experience } = req.body;

    if (!req.file) {
      req.flash("error", "Please upload your CV/Resume.");
      return res.redirect(`/account/jobs/${jobId}/apply`);
    }

    const accountId = req.session.account ? req.session.account.id : null;
    const cvFilePath = `/uploads/cvs/${req.file.filename}`;

    await accountModel.createJobApplication({
      job_id: jobId,
      account_id: accountId,
      applicant_name,
      applicant_email,
      applicant_phone,
      cover_letter,
      years_experience: parseInt(years_experience, 10) || 0,   // ✅ new field
      cv_file_path: cvFilePath,
    });

    req.flash("success", "Your application has been submitted successfully!");
    res.redirect("/jobs");
  } catch (error) {
    console.error("SUBMIT JOB APPLICATION ERROR:", error);
    req.flash("error", "Failed to submit your application. Please try again.");
    res.redirect(`/account/jobs/${req.params.id}/apply`);
  }
}
//end here

/*************************************
 * 
 * Delivery latest news and events
 */
async function createNewsPost(req, res) {
  try {
    const { title, description, news_date } = req.body;
    const profile_image = req.file ? `/images/news/${req.file.filename}` : null;

    await accountModel.createNews({ title, description, news_date, profile_image });

    req.flash("success", "News posted successfully.");
    res.redirect("/account/dashboard/admin?jobPosted=true");   // ✅ goes to home page after add
  } catch (error) {
    console.error("CREATE NEWS ERROR:", error);
    req.flash("error", "Failed to post news.");
    res.redirect("/account/dashboard/admin");
  }
}

async function createEventPost(req, res) {
  try {
    const { title, description, location, event_date, end_date } = req.body;

    await accountModel.createEvent({ title, description, location, event_date, end_date });

    req.flash("success", "Event created successfully.");
    res.redirect("/account/dashboard/admin?jobPosted=true");   // ✅ goes to home page after add
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    req.flash("error", "Failed to create event.");
    res.redirect("/account/dashboard/admin");
  }
}
// end here news and latest events

/*****************************************
 * 
 * Delivery news get and events all and delete
 */
async function updateNewsPost(req, res) {
  try {
    const { news_id } = req.params;
    const { title, description, news_date } = req.body;
    const updateData = { title, description, news_date };

    if (req.file) {
      updateData.profile_image = `/images/news/${req.file.filename}`;
    }

    await accountModel.updateNews(news_id, updateData);

    req.flash("success", "News updated successfully.");
    res.redirect("/account/dashboard/admin?newsPosted=true");
  } catch (error) {
    console.error("UPDATE NEWS ERROR:", error);
    req.flash("error", "Failed to update news.");
    res.redirect("/account/dashboard/admin");
  }
}

async function deleteNewsPost(req, res) {
  try {
    const { news_id } = req.params;
    await accountModel.deleteNews(news_id);

    req.flash("success", "News deleted successfully.");
    res.redirect("/account/dashboard/admin?newsPosted=true");
  } catch (error) {
    console.error("DELETE NEWS ERROR:", error);
    req.flash("error", "Failed to delete news.");
    res.redirect("/account/dashboard/admin");
  }
}

async function updateEventPost(req, res) {
  try {
    const { event_id } = req.params;
    const { title, description, location, event_date, end_date } = req.body;

    await accountModel.updateEvent(event_id, { title, description, location, event_date, end_date });

    req.flash("success", "Event updated successfully.");
    res.redirect("/account/dashboard/admin?eventPosted=true");
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    req.flash("error", "Failed to update event.");
    res.redirect("/account/dashboard/admin");
  }
}

async function deleteEventPost(req, res) {
  try {
    const { event_id } = req.params;
    await accountModel.deleteEvent(event_id);

    req.flash("success", "Event deleted successfully.");
    res.redirect("/account/dashboard/admin?eventPosted=true");
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    req.flash("error", "Failed to delete event.");
    res.redirect("/account/dashboard/admin");
  }
}

/*****************************************
 * 
 * delivery training
 */
async function createTrainingPost(req, res) {
  try {
    const { title, category, description, duration, level, icon, gradient_start, gradient_end, start_date, end_date } = req.body;

    await accountModel.createTraining({
      title, category, description, duration, level,
      icon: icon || 'bi-mortarboard',
      gradient_start: gradient_start || '#66BB6A',
      gradient_end: gradient_end || '#2E7D32',
      start_date, end_date,
    });

    req.flash("success", "Training program added successfully.");
    res.redirect("/account/dashboard/admin?trainingPosted=true");
  } catch (error) {
    console.error("CREATE TRAINING ERROR:", error);
    req.flash("error", "Failed to add training program.");
    res.redirect("/account/dashboard/admin");
  }
}

async function registerTraining(req, res) {
  try {
    const trainingId = req.params.id;
    const accountId = req.session.account.id;

    await accountModel.registerForTraining(trainingId, accountId);

    req.flash("success", "You have successfully registered for this training!");
    res.redirect("/account/dashboard/member?trainingRegistered=true");
  } catch (error) {
    console.error("REGISTER TRAINING ERROR:", error);
    req.flash("error", "Failed to register for training.");
    res.redirect("/account/dashboard/member");
  }
}
/*********************
 * 
 * Delivery uplaod training guides
 */
async function uploadTrainingGuide(req, res) {
  try {
    const { title, page_count } = req.body;

    if (!req.file) {
      req.flash("error", "Please select a PDF file to upload.");
      return res.redirect("/account/dashboard/ict-staff");
    }

    const file_path = `/uploads/guides/${req.file.filename}`;

    await accountModel.createTrainingGuide({
      title,
      file_path,
      page_count: parseInt(page_count, 10) || null,
      uploaded_by: req.session.account.id,
    });

    req.flash("success", "Guide uploaded successfully.");
    res.redirect("/account/dashboard/ict-staff");
  } catch (error) {
    console.error("UPLOAD GUIDE ERROR:", error);
    req.flash("error", "Failed to upload guide.");
    res.redirect("/account/dashboard/ict-staff");
  }
}

async function deleteTrainingGuide(req, res) {
  try {
    const { id } = req.params;
    await accountModel.deleteTrainingGuide(id);

    req.flash("success", "Guide deleted.");
    res.redirect("/account/dashboard/ict-staff");
  } catch (error) {
    console.error("DELETE GUIDE ERROR:", error);
    req.flash("error", "Failed to delete guide.");
    res.redirect("/account/dashboard/ict-staff");
  }
}
// end here

/* ---------- ICT Staff: create lesson ---------- */
async function createLessonPost(req, res) {
  try {
    const { training_id, title, description, lesson_order } = req.body;
    await accountModel.createLesson({ training_id, title, description, lesson_order: parseInt(lesson_order, 10) || 1 });

    req.flash("success", "Lesson added successfully.");
    res.redirect("/account/dashboard/ict-staff");
  } catch (error) {
    console.error("CREATE LESSON ERROR:", error);
    req.flash("error", "Failed to add lesson.");
    res.redirect("/account/dashboard/ict-staff");
  }
}

/* ---------- ICT Staff: upload material to a lesson ---------- */
async function uploadLessonMaterial(req, res) {
  try {
    const { lesson_id, title } = req.body;

    if (!req.file) {
      req.flash("error", "Please select a file to upload.");
      return res.redirect("/account/dashboard/ict-staff");
    }

    const ext = req.file.filename.split('.').pop().toLowerCase();
    const file_type = ['mp4', 'mov'].includes(ext) ? 'video' : ext;
    const file_path = `/uploads/materials/${req.file.filename}`;

    await accountModel.createLessonMaterial({
      lesson_id,
      title,
      file_path,
      file_type,
      uploaded_by: req.session.account.id,
    });

    req.flash("success", "Material uploaded successfully.");
    res.redirect("/account/dashboard/ict-staff");
  } catch (error) {
    console.error("UPLOAD MATERIAL ERROR:", error);
    req.flash("error", "Failed to upload material.");
    res.redirect("/account/dashboard/ict-staff");
  }
}

async function deleteLessonMaterialPost(req, res) {
  try {
    const { id } = req.params;
    await accountModel.deleteLessonMaterial(id);

    req.flash("success", "Material deleted.");
    res.redirect("/account/dashboard/ict-staff");
  } catch (error) {
    console.error("DELETE MATERIAL ERROR:", error);
    req.flash("error", "Failed to delete material.");
    res.redirect("/account/dashboard/ict-staff");
  }
}

/* ---------- Member: view a lesson (materials) ---------- */
async function viewLesson(req, res) {
  try {
    const { lessonId } = req.params;
    const lesson = await accountModel.getLessonById(lessonId);

    if (!lesson) {
      req.flash("error", "Lesson not found.");
      return res.redirect("/account/dashboard/member");
    }

    const materials = await accountModel.getMaterialsByLessonId(lessonId);
    const allLessons = await accountModel.getLessonsByTrainingId(lesson.training_id);
    const completedLessonIds = (await accountModel.getProgressForTraining(req.session.account.id, lesson.training_id)).map(p => p.lesson_id);

    let nav = await utilities.getNav();
    res.render("account/lesson-view", {
      title: lesson.title,
      nav,
      account: req.session.account,
      lesson,
      materials,
      allLessons,
      completedLessonIds,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("VIEW LESSON ERROR:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/account/dashboard/member");
  }
}

/* ---------- Member: mark lesson complete ---------- */
async function completeLesson(req, res) {
  try {
    const { lessonId } = req.params;
    await accountModel.markLessonComplete(req.session.account.id, lessonId);

    const lesson = await accountModel.getLessonById(lessonId);
    const allLessons = await accountModel.getLessonsByTrainingId(lesson.training_id);
    const currentIndex = allLessons.findIndex(l => l.lesson_id == lessonId);
    const nextLesson = allLessons[currentIndex + 1];

    req.flash("success", "Lesson marked as complete!");
    if (nextLesson) {
      res.redirect(`/account/lessons/${nextLesson.lesson_id}`);
    } else {
      res.redirect("/account/dashboard/member?trainingCompleted=true");
    }
  } catch (error) {
    console.error("COMPLETE LESSON ERROR:", error);
    req.flash("error", "Failed to update progress.");
    res.redirect("/account/dashboard/member");
  }
}
// end here



/*********************************************
 * 
 * Delivery ticket
 */
async function createSupportTicket(req, res) {
  try {
    const { subject, description } = req.body;
    const ticket = await accountModel.createTicket(req.session.account.id, subject, description);

    req.flash("success", `Ticket ${ticket.ticket_number} created successfully.`);
    res.redirect("/account/dashboard/member?ticketCreated=true");
  } catch (error) {
    console.error("CREATE TICKET ERROR:", error);
    req.flash("error", "Failed to create ticket.");
    res.redirect("/account/dashboard/member");
  }
}

async function updateTicketStatusPost(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await accountModel.updateTicketStatus(id, status);

    req.flash("success", "Ticket status updated.");
    res.redirect("/account/dashboard/ict-staff");
  } catch (error) {
    console.error("UPDATE TICKET STATUS ERROR:", error);
    req.flash("error", "Failed to update ticket.");
    res.redirect("/account/dashboard/ict-staff");
  }
}

async function replyToTicket(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;
    await accountModel.createTicketMessage(id, req.session.account.id, message);

    req.flash("success", "Reply sent.");
    const account = req.session.account;
    const redirectTo = account.account_type === "ict_staff" ? "/account/dashboard/ict-staff" : "/account/dashboard/member";
    res.redirect(`${redirectTo}`);
  } catch (error) {
    console.error("REPLY TICKET ERROR:", error);
    req.flash("error", "Failed to send reply.");
    res.redirect("back");
  }
}
// end here

/*******************************
 * 
 * Delivery json message
 */

async function getTicketMessagesJson(req, res) {
  try {
    const { id } = req.params;
    const messages = await accountModel.getMessagesByTicketId(id);
    res.json(messages);
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    res.status(500).json([]);
  }
}
// end here.

/****************************
 * Delivery deactivate and reactivate account
 */
async function deactivateAccountPost(req, res) {
  try {
    const { id } = req.params;
    const targetAccount = await accountModel.getAccountById(id);

    if (!targetAccount) {
      req.flash("error", "Account not found.");
      return res.redirect("/account/dashboard/admin");
    }

    // ✅ The core rule: admins can never deactivate another admin
    if (targetAccount.account_type === "admin") {
      req.flash("error", "Administrator accounts cannot be deactivated by another admin.");
      return res.redirect("/account/dashboard/admin");
    }

    await accountModel.deactivateAccount(id);
    req.flash("success", `${targetAccount.full_name}'s account has been deactivated.`);
    res.redirect("/account/dashboard/admin?membersUpdated=true");
  } catch (error) {
    console.error("DEACTIVATE ACCOUNT ERROR:", error);
    req.flash("error", "Failed to deactivate account.");
    res.redirect("/account/dashboard/admin");
  }
}

async function reactivateAccountPost(req, res) {
  try {
    const { id } = req.params;
    await accountModel.reactivateAccount(id);
    req.flash("success", "Account reactivated.");
    res.redirect("/account/dashboard/admin?membersUpdated=true");
  } catch (error) {
    console.error("REACTIVATE ACCOUNT ERROR:", error);
    req.flash("error", "Failed to reactivate account.");
    res.redirect("/account/dashboard/admin");
  }
}

/* ****************************************
 * Logout
 * *************************************** */
async function accountLogout(req, res) {
  try {
    if (req.session.account && req.session.account.loginLogId) {
      await accountModel.recordLogout(req.session.account.loginLogId);
    }
  req.flash("success","You have been logged out successfully.");
  const flashMessages =req.session.flash;

  req.session.regenerate((err)=>{
    if(err) console.error(err);
    req.session.flash =flashMessages;
    res.redirect("/account/login")
  }) 
} catch (error) {
  console.error("LOGOUT ERROR:", error);
  res.redirect("/account/login");
}
}








module.exports={
  accountManagement,buildLogin,buildRegister,registerAccount,accountLogin,buildAdminDashboard,updateProfile,changePassword, buildIctStaffDashboard,buildMemberDashboard,createJob,buildApplyJob,submitJobApplication,updateApplicationStatus,submitMemberJobApplication,toggleJobStatus,createNewsPost, createEventPost,updateNewsPost,deleteNewsPost,updateEventPost,deleteEventPost,createTrainingPost,registerTraining,updateTrainingRegistrationStatus,createLessonPost,uploadTrainingGuide,deleteTrainingGuide,uploadLessonMaterial,deleteLessonMaterialPost,viewLesson,completeLesson,createSupportTicket,updateTicketStatusPost,replyToTicket,getTicketMessagesJson,deactivateAccountPost,reactivateAccountPost,accountLogout
}
