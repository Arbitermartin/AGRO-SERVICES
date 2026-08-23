const utilities = require("../utilities")
const path = require("path");
const bcrypt = require('bcrypt'); // For password hashing
const accountModel = require("../models/account-model");
const PDFDocument = require("pdfkit");
const db = require('../database/db');
const { title } = require("process");
const { error } = require("console");
const mailer = require("../utilities/mailer");



/* ****************************************
 * Deliver registration view
 * *************************************** */
// async function buildRegister(req, res) {
//   let nav = await utilities.getNav();
//   res.render("account/register", {
//     title: "Registration",
//     nav,
//     errors: null,
//   });
// }
async function buildRegister(req, res) {
  const intake = await accountModel.getActiveIntake();

  if (!intake) {
    req.flash("error", "Registration is not currently open.");
    return res.redirect("/account/register");
  }
  

  const today = new Date(); today.setHours(0,0,0,0);
  const closeDate = new Date(intake.close_date); closeDate.setHours(0,0,0,0);

  if (today > closeDate) {
    req.flash("error", "Registration for this intake has closed.");
    return res.redirect("/account/register");
  }

  const referrers = await accountModel.getAllReferrers();

  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Registration",
    nav,
    errors: null,
    referrers,
  });
}
/***************************
 * Deliver build login
 *******************/
async function buildLogin(req,res) {
  let nav = await utilities.getNav();
   res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    success: req.flash("success"),
    error: req.flash("error"),
  });
}

/* ****************************************
 * Process registration
 * *************************************** */
async function registerAccount(req, res) {
  try {
    const {
      fullName,
      email,
      Phone_number,
      password,
      membership_plan,
      payment_method,
      transaction_reference,
      bank_name,
      bank_account_number,
      referrer_id
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAccount = await accountModel.registerAccount(fullName, email, Phone_number, hashedPassword,referrer_id);

    if (req.file) {
      const planPrices = { Basic: 10000, Standard: 25000, Premium: 50000 };
      const amount = planPrices[membership_plan] || 25000;

      await accountModel.createPayment({
        account_id: newAccount.id,
        membership_plan: membership_plan || "Standard",
        amount,
        payment_method: payment_method || "Mobile Money",
        transaction_reference: transaction_reference || "N/A",
        bank_name: payment_method === "Bank Transfer" ? bank_name : null,
        bank_account_number: payment_method === "Bank Transfer" ? bank_account_number : null,
        payment_proof: `/uploads/${req.file.filename}`,
      });
    }

    req.flash("success", "Registration successful! Your payment is under review. You'll be notified once approved.");
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

    const profilePhoto = await accountModel.getProfilePhotoByAccountId(account.id);

    if (!account) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/account/login");
    }

    const passwordMatch = await bcrypt.compare(password, account.password);

    // if (!passwordMatch) {
    //   req.flash("error", "Invalid email or password.");
    //   return res.redirect("/account/login");
    // }

    if (!passwordMatch) {
    const attempts = (account.failed_login_attempts || 0) + 1;
     const updateData = { failed_login_attempts: attempts };
       if (attempts >= 5) {
        updateData.locked_until = new Date(Date.now() + 15 * 60 * 1000);
       }
        await accountModel.updateFailedAttempts(account.id, updateData);
        req.flash("error", "Invalid email or password.");
        return res.redirect("/account/login");
       }

          if (account.locked_until && new Date(account.locked_until) > new Date()) {
         req.flash("error", "Account temporarily locked. Try again in a few minutes.");
         return res.redirect("/account/login");
         }

         // on success, reset:
        await accountModel.updateFailedAttempts(account.id, { failed_login_attempts: 0, locked_until: null });

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
       admin_level: account.admin_level || null,
      loginLogId: loginLog.id,
      profile_photo: profilePhoto || null,
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

  const freshAccount = await accountModel.getAccountById(account.id);
  account.is_online = freshAccount.is_online;

  const profile = (await accountModel.getProfileByAccountId(account.id)) || {};

  if (profile.profile_photo && account.profile_photo !== profile.profile_photo) {
    account.profile_photo = profile.profile_photo;
  }

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
   const allEventRegistrations = await accountModel.getAllEventRegistrations();
  const allAccounts = await accountModel.getAllAccounts();
  const totalMembers = await accountModel.countMembersOnly();
  const newMembersThisMonth = await accountModel.countNewMembersThisMonth();
  const totalAdmins = await accountModel.countAdminsOnly();
  const allTeamMembers = await accountModel.getAllTeamMembers();

    // ✅ Payments
  const pendingPayments = await accountModel.getAllPendingPayments();
  const recentPendingPayments = await accountModel.getRecentPendingPayments(3);
  const pendingPaymentCount = await accountModel.countPendingPayments();
  const allPaymentHistory = await accountModel.getAllPaymentHistory();

  // admins check
  const allAdminAccounts = await accountModel.getAllAdminAccounts();
  const isSuperAdmin = account.admin_level === "super_admin";

  // view all ict staff here
  const allIctStaffOnly = await accountModel.getAllIctStaffOnly();

  // view tasks
  const assignablePeople = [...(await accountModel.getAllAdminAccounts()), ...(await accountModel.getAllIctStaffOnly())];
  const allTasks = await accountModel.getAllTasksForSuperAdmin();
  const taskAssigneesMap = {};
              for (const t of allTasks) {
      taskAssigneesMap[t.id] = await accountModel.getAssigneesForTask(t.id);
    }
  const myTasks = await accountModel.getTasksForAccount(account.id);

  //delivery testmonials
  const allTestimonials = await accountModel.getAllTestimonials();

  // registration intake
  const activeIntake = await accountModel.getActiveIntake();

  // get upcoming event
  const upcomingEventsForDashboard = await accountModel.getUpcomingEventsWithRegistrationCount();
  const recentActivity = await accountModel.getRecentActivityForDashboard(4); 

  // member status
  const memberStats = await accountModel.getMemberRegistrationStats();
  
  // dashboard view for member in graph
  const monthlyRegistrations = await accountModel.getMonthlyMemberRegistrations();
  const canDownloadChart = monthlyRegistrations.length >= 3;


  // member referres
const allReferrers = await accountModel.getAllReferrers();
const membersByReferrer = await accountModel.getMembersByReferrer();


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
    allTeamMembers,
    allEventRegistrations,
     pendingPayments,
    recentPendingPayments,
    pendingPaymentCount,
    allPaymentHistory,
    allAdminAccounts,
    isSuperAdmin,
    allIctStaffOnly,
    assignablePeople,
    allTasks,
    taskAssigneesMap,
    myTasks,
    allTestimonials,
    activeIntake,
    upcomingEventsForDashboard,
    recentActivity,
    memberStats,
    monthlyRegistrations,
    canDownloadChart,
    allReferrers,
    membersByReferrer,
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

    // inside createJob, after insert:
    await accountModel.notifyRoles(
     ["member", "ict_staff"],
      "New Job Posting",
       `A new job "${title}" was posted.`,
      "/jobs"
     );

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
    const accountType = req.session.account.account_type;

    const {
      full_name,
      phone_number,
      date_of_birth,
      gender,
      nationality,
      bio,
      region,
      district,
      ward,
      // Admin fields
      department,
      office,
      admin_role,
      // Member fields
      student_number,
      programme,
      year_of_study,
      employment_status,
      company_name,
      position,
    } = req.body;

    // 1. Common: update full name
    await accountModel.updateFullName(accountId, full_name);
    req.session.account.full_name = full_name;

    // 2. Common: phone (if provided)
    if (phone_number !== undefined) {
      await accountModel.updatePhone(accountId, phone_number);
    }

    // 3. Common: profile + photo
    const profileData = { date_of_birth, gender, nationality, bio };
    if (req.file) {
      profileData.profile_photo = `/images/profile_photos/${req.file.filename}`;
      req.session.account.profile_photo = profileData.profile_photo;
    }
    const profile = await accountModel.upsertProfile(accountId, profileData);

    // 4. Common: birth place
    await accountModel.upsertBirthPlace(profile.id, { region, district, ward });

    // 5. Role-specific logic
    if (accountType === "admin" || accountType === "ict_staff") {
      // ===== ADMIN / ICT =====
      await accountModel.upsertAdminDetails(profile.id, {
        department,
        office,
        admin_role,
      });

      req.flash("success", "Profile updated successfully.");
      return res.redirect(`/account/dashboard/${accountType === "admin" ? "admin" : "ict-staff"}?profileUpdated=true`);
    }

    // ===== MEMBER =====
    await accountModel.upsertMember(profile.id, {
      student_number,
      programme,
      year_of_study: year_of_study || null,
      employment_status,
      company_name,
      position,
    });

    // Education
    const eduLevels = [].concat(req.body.edu_level || []);
    const eduInstitutions = [].concat(req.body.edu_institution || []);
    const eduCourses = [].concat(req.body.edu_course || []);
    const eduYears = [].concat(req.body.edu_year || []);

    const educations = eduInstitutions
      .map((inst, i) => ({
        level: eduLevels[i] || "Bachelor",
        institution: inst,
        course_name: eduCourses[i] || null,
        graduation_year: eduYears[i] ? Number(eduYears[i]) : null,
      }))
      .filter((e) => e.institution);

    await accountModel.replaceEducations(profile.id, educations);

    // Experiences
    const expCompanies = [].concat(req.body.exp_company || []);
    const expTitles = [].concat(req.body.exp_title || []);
    const expRoles = [].concat(req.body.exp_roles || []);
    const expYears = [].concat(req.body.exp_years || []);
    const expStarts = [].concat(req.body.exp_start || []);
    const expEnds = [].concat(req.body.exp_end || []);

    const experiences = expCompanies
      .map((company, i) => ({
        company_name: company,
        job_title: expTitles[i] || null,
        roles: expRoles[i] || null,
        years_exp: expYears[i] ? Number(expYears[i]) : null,
        start_date: expStarts[i] || null,
        end_date: expEnds[i] || null,
      }))
      .filter((e) => e.company_name);

    await accountModel.replaceExperiences(profile.id, experiences);

    req.flash("success", "Profile updated successfully.");
    res.redirect("/account/dashboard/member?profileUpdated=true");
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    req.flash("error", "Failed to update profile.");

    // Redirect back to the correct dashboard
    const type = req.session.account?.account_type;
    if (type === "admin") return res.redirect("/account/dashboard/admin");
    if (type === "ict_staff") return res.redirect("/account/dashboard/ict-staff");
    res.redirect("/account/dashboard/member");
  }
}

async function buildIctStaffDashboard(req, res) {
  let nav = await utilities.getNav();
  const account = req.session.account;

  // refresh online status from the database.
  const freshAccount = await accountModel.getAccountById(account.id);
  account.is_online = freshAccount.is_online;
  const loginLogs = await accountModel.getAllLoginLogs();
  const activityLogs = await accountModel.getAllActivityLogs();
  const allGuides = await accountModel.getAllTrainingGuides();
  const allTrainings = await accountModel.getAllTrainings();
  const allLessons = await accountModel.getAllLessons();
  const allTickets = await accountModel.getAllTickets();
  const ticketCounts = await accountModel.countTicketsByStatus();
  const recentTickets = allTickets.slice(0, 4);
  const allTeamMembers = await accountModel.getAllTeamMembers();
  const allMessages = await accountModel.getAllContactMessages();
  const unreadMessageCount = await accountModel.countUnreadContactMessages();

  //Members + full details, pre-loaded for inline view
  const allMembersOnly = await accountModel.getAllMembersOnly();
  const memberDetailsMap = {};
  for (const m of allMembersOnly) {
    memberDetailsMap[m.id] = await accountModel.getFullMemberDetailsForIct(m.id);
  }
  const totalMembers = await accountModel.countMembersOnly();

  // ict view tasks
  const myTasks = await accountModel.getTasksForAccount(account.id);

  // deliver faq
  const allSiteFaqs = await accountModel.getAllSiteFaqs();
  const allHeroSlides = await accountModel.getAllHeroSlides()

  res.render("dashboards/ict-staff", {
    title: "ICT Staff Dashboard",
    nav,
    account,
    initials: getInitials(account.full_name),
    // account: req.session.account,
    // initials: getInitials(req.session.account.full_name),
    loginLogs,
    activityLogs,
    allGuides,
    allTrainings,
    allLessons,
    allTickets,
    ticketCounts,
    recentTickets,
    allTeamMembers,
    totalMembers,
    allMessages,
    unreadMessageCount,
    allMembersOnly,
    memberDetailsMap,
    myTasks,
    allSiteFaqs,
    allHeroSlides,
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
  const birthPlace = profile.id ? (await accountModel.getBirthPlaceByProfileId(profile.id) || {})  : {};
  const member = profile.id? (await accountModel.getMemberByProfileId(profile.id)) || {}: {};
  const educations = profile.id? await accountModel.getEducationsByProfileId(profile.id): [];experiences = profile.id? await accountModel.getExperiencesByProfileId(profile.id): [];
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
    member,
    educations,
    experiences,
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

     // ✅ ADD THIS — right after the insert succeeds
    await accountModel.notifyRoles(
      ["admin", "ict_staff"],
      "New Job Application",
      `${applicant_name} applied for a job posting.`,
      "/account/dashboard/admin"
    );

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
    // inside createNewsPost, after insert:
    await accountModel.notifyRoles(
     ["member", "ict_staff"],
      "News Update",
      `New news posted: "${title}".`,
       "/"
      );

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
    // inside createEventPost, after insert:
    await accountModel.notifyRoles(
      ["member", "ict_staff"],
      "New Event Posted",
      `A new event "${title}" was posted.`,
      "/"
      );

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
    // inside createTrainingPost, after insert:
   await accountModel.notifyRoles(
    ["member", "ict_staff"],
     "New Training Program",
     `A new training "${title}" was posted.`,
     "/training"
     );

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

    // inside registerTraining, after successful insert:
    const trainingInfo = await accountModel.getTrainingById(trainingId);
     await accountModel.notifyRoles(
      ["admin", "ict_staff"],
      "New Training Registration",
      `${req.session.account.full_name} registered for "${trainingInfo.title}".`,
      "/account/dashboard/admin"
     );

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
    // inside createLessonPost, after insert:
    await accountModel.notifyRoles(
     ["member"],
     "New Lesson Added",
     `A new lesson "${title}" was added to your training program.`,
     "/account/dashboard/member"
    );

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
    // inside uploadLessonMaterial, after insert:
    await accountModel.notifyRoles(
    ["member"],
     "New Training Material",
     `New material "${title}" was uploaded for your training.`,
     "/account/dashboard/member"
     );

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

    // inside createSupportTicket, after ticket creation:
   await accountModel.notifyRoles(
      ["ict_staff"],
     "New Support Ticket",
      `${req.session.account.full_name} opened ticket #${ticket.ticket_number}: ${subject}.`,
     "/account/dashboard/ict-staff"
     );

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

/***********************************
 * 
 * Delivery team member
 */
async function createTeamMemberPost(req, res) {
  try {
    const { full_name, title, category, bio, linkedin_url, twitter_url,instagram_url, email, display_order } = req.body;
    const photo_path = req.file ? `/images/team/${req.file.filename}` : null;

    await accountModel.createTeamMember({
      full_name, title, category, bio,
      photo_path,
      linkedin_url: linkedin_url || null,
      twitter_url: twitter_url || null,
      instagram_url: instagram_url || null,
      email: email || null,
      display_order: parseInt(display_order, 10) || 1,
    });

    // inside createTeamMemberPost, after insert:
    await accountModel.notifyRoles(
      ["admin"],
     "New Team Member Added",
      `${full_name} was added to the team by ICT staff.`,
      "/account/dashboard/admin"
     );

    req.flash("success", "Team member posted successfully.");
    res.redirect("/account/dashboard/ict-staff?teamPosted=true");
  } catch (error) {
    console.error("CREATE TEAM MEMBER ERROR:", error);
    req.flash("error", "Failed to post team member.");
    res.redirect("/account/dashboard/ict-staff");
  }
}

async function deleteTeamMemberPost(req, res) {
  try {
    const { id } = req.params;
    await accountModel.deleteTeamMember(id);
    req.flash("success", "Team member removed.");
    res.redirect("/account/dashboard/ict-staff?teamPosted=true");
  } catch (error) {
    console.error("DELETE TEAM MEMBER ERROR:", error);
    req.flash("error", "Failed to remove team member.");
    res.redirect("/account/dashboard/ict-staff");
  }
}

async function updateTeamMemberPost(req, res) {
  try {
    const { id } = req.params;
    const { full_name, title, category, bio, linkedin_url, twitter_url,instagram_url, email, display_order } = req.body;
    const updateData = {
      full_name, title, category, bio,
      linkedin_url: linkedin_url || null,
      twitter_url: twitter_url || null,
      instagram_url: instagram_url || null,
      email: email || null,
      display_order: parseInt(display_order, 10) || 1,
    };

    if (req.file) {
      updateData.photo_path = `/images/team/${req.file.filename}`;
    }

    await accountModel.updateTeamMember(id, updateData);

    req.flash("success", "Team member updated successfully.");
    res.redirect("/account/dashboard/admin?teamPosted=true");
  } catch (error) {
    console.error("UPDATE TEAM MEMBER ERROR:", error);
    req.flash("error", "Failed to update team member.");
    res.redirect("/account/dashboard/admin");
  }
}

async function deleteTeamMemberAdminPost(req, res) {
  try {
    const { id } = req.params;
    await accountModel.deleteTeamMember(id);
    req.flash("success", "Team member removed.");
    res.redirect("/account/dashboard/admin?teamPosted=true");
  } catch (error) {
    console.error("DELETE TEAM MEMBER ERROR:", error);
    req.flash("error", "Failed to remove team member.");
    res.redirect("/account/dashboard/admin");
  }
}

// Delivery get profile.
async function viewMemberProfile(req, res) {
  try {
    const { id } = req.params;
    const data = await accountModel.getFullMemberProfile(id);

    if (!data) {
      req.flash("error", "Member not found.");
      return res.redirect("/account/dashboard/admin");
    }

    let nav = await utilities.getNav();
    res.render("account/member-profile", {
      title: `${data.account.full_name}'s Profile`,
      nav,
      data,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("VIEW MEMBER PROFILE ERROR:", error);
    req.flash("error", "Failed to load profile.");
    res.redirect("/account/dashboard/admin");
  }
}

async function downloadMemberProfilePdf(req, res) {
  try {
    const { id } = req.params;
    const data = await accountModel.getFullMemberProfile(id);

    if (!data) {
      req.flash("error", "Member not found.");
      return res.redirect("/account/dashboard/admin");
    }

    const { account, profile, birthPlace, adminDetails } = data;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${account.full_name.replace(/\s+/g, "_")}_profile.pdf`);
    doc.pipe(res);

    doc.fontSize(20).fillColor("#2E7D32").text("AgroServices Tanzania", { align: "center" });
    doc.fontSize(12).fillColor("#666").text("Member Profile Report", { align: "center" });
    doc.moveDown(1.5);

    doc.strokeColor("#2E7D32").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    const addRow = (label, value) => {
      doc.fontSize(11).fillColor("#333").font("Helvetica-Bold").text(label, { continued: true });
      doc.font("Helvetica").fillColor("#000").text(`  ${value || "N/A"}`);
      doc.moveDown(0.4);
    };

    doc.fontSize(14).fillColor("#2E7D32").text("Account Information");
    doc.moveDown(0.3);
    addRow("Full Name:", account.full_name);
    addRow("Email:", account.email);
    addRow("Phone Number:", account.phone_number);
    addRow("Account Type:", account.account_type);
    addRow("Status:", account.status);
    addRow("Joined:", new Date(account.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));

    doc.moveDown();
    doc.fontSize(14).fillColor("#2E7D32").text("Personal Information");
    doc.moveDown(0.3);
    if (profile) {
      addRow("Date of Birth:", profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-GB') : null);
      addRow("Gender:", profile.gender);
      addRow("Nationality:", profile.nationality);
      addRow("Bio:", profile.bio);
    } else {
      doc.fontSize(11).fillColor("#999").text("No additional profile information provided.");
    }

    doc.moveDown();
    doc.fontSize(14).fillColor("#2E7D32").text("Place of Birth");
    doc.moveDown(0.3);
    if (birthPlace) {
      addRow("Region:", birthPlace.region);
      addRow("District:", birthPlace.district);
      addRow("Ward:", birthPlace.ward);
    } else {
      doc.fontSize(11).fillColor("#999").text("Not provided.");
    }

    if (account.account_type === "admin" && adminDetails) {
      doc.moveDown();
      doc.fontSize(14).fillColor("#2E7D32").text("Work Details");
      doc.moveDown(0.3);
      addRow("Department:", adminDetails.department);
      addRow("Office:", adminDetails.office);
      addRow("Admin Role:", adminDetails.admin_role);
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#999").text(`Generated on ${new Date().toLocaleString('en-GB')}`, { align: "center" });

    doc.end();
  } catch (error) {
    console.error("DOWNLOAD PDF ERROR:", error);
    req.flash("error", "Failed to generate PDF.");
    res.redirect("/account/dashboard/admin");
  }
}
// end here.
/****************************
 * 
 * Derivery contact message from contact us page
 */
async function submitContactForm(req, res) {
  try {
    const { name, email, subject, message } = req.body;

     if (!name || !email || !subject || !message) {
      req.flash("error", "Please fill in all fields.");
      return res.redirect("/contact");
    }
     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      req.flash("error", "Please enter a valid email address.");
      return res.redirect("/contact");
    }
    if (message.length > 500) {
       req.flash("error", "Your message must be 500 characters or fewer.");
       return res.redirect("/contact");
    }
    

    await accountModel.createContactMessage({
      full_name: name,
      email,
      phone_number: null,
      subject,
      message,
    });

    req.flash("success", "Your message has been sent successfully.");
    res.redirect("/contact");
  } catch (error) {
    console.error("CONTACT FORM ERROR:", error);
    req.flash("error", "Failed to send your message. Please try again.");
    res.redirect("/contact");
  }
}

async function markMessageReadPost(req, res) {
  try {
    const { id } = req.params;
    await accountModel.markContactMessageAsRead(id);
    res.redirect("/account/dashboard/ict-staff?messageRead=true");
  } catch (error) {
    console.error("MARK MESSAGE READ ERROR:", error);
    res.redirect("/account/dashboard/ict-staff");
  }
}
// end here contact message from contact us page.

/*********************************
 * 
 * Delivery event registrtations form for event.
 */
async function viewEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await accountModel.getEventById(id);

    if (!event) {
      req.flash("error", "Event not found.");
      return res.redirect("/");
    }

    let nav = await utilities.getNav();
    res.render("pages/event-details", {
      title: event.title,
      nav,
      event,
    });
  } catch (error) {
    console.error("VIEW EVENT ERROR:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/");
  }
}

async function buildEventRegister(req, res) {
  try {
    const { id } = req.params;
    const event = await accountModel.getEventById(id);

    if (!event) {
      req.flash("error", "Event not found.");
      return res.redirect("/");
    }

    let nav = await utilities.getNav();
    res.render("pages/event-register", {
      title: `Register — ${event.title}`,
      nav,
      event,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("BUILD EVENT REGISTER ERROR:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/");
  }
}

async function submitEventRegistration(req, res) {
  try {
    const { id } = req.params;
    const { full_name, email, phone_number, age, country, region } = req.body;

    await accountModel.createEventRegistration({
      event_id: id,
      full_name,
      email,
      phone_number,
      age: parseInt(age, 10),
      country,
      region,
    });

    req.flash("success", "You have successfully registered for this event!");
    res.redirect(`/events/${id}/register`);
  } catch (error) {
    console.error("SUBMIT EVENT REGISTRATION ERROR:", error);
    req.flash("error", "Failed to register. Please try again.");
    res.redirect(`/events/${req.params.id}/register`);
  }
}
// end here

/**************************************
 * 
 * Delivery registered users for events
 */


async function deleteEventRegistrationPost(req, res) {
  try {
    const { id } = req.params;
    await accountModel.deleteEventRegistration(id);
    req.flash("success", "Registration removed.");
    res.redirect("/account/dashboard/admin?registeredUsersUpdated=true");
  } catch (error) {
    console.error("DELETE EVENT REGISTRATION ERROR:", error);
    req.flash("error", "Failed to remove registration.");
    res.redirect("/account/dashboard/admin");
  }
}

async function downloadEventRegistrationsPdf(req, res) {
  try {
    const { eventId } = req.params;
    const event = await accountModel.getEventById(eventId);
    const registrations = await accountModel.getEventRegistrationsByEventId(eventId);

    if (!event) {
      req.flash("error", "Event not found.");
      return res.redirect("/account/dashboard/admin");
    }

    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${event.title.replace(/\s+/g, "_")}_registrations.pdf`);
    doc.pipe(res);

    doc.fontSize(18).fillColor("#2E7D32").font("Helvetica-Bold")
      .text("YOUTH AGROSERVICE NETWORK", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(14).fillColor("#000").font("Helvetica-Bold")
      .text(event.title, { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor("#555").font("Helvetica")
      .text(
        `Event Dates: ${new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} — ${new Date(event.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        { align: "center" }
      );
    doc.moveDown(1);

    doc.strokeColor("#2E7D32").lineWidth(1).moveTo(40, doc.y).lineTo(802, doc.y).stroke();
    doc.moveDown(0.8);

    // Table header
    const startX = 40;
    let y = doc.y;
    const colWidths = [140, 170, 100, 40, 110, 170];
    const headers = ["Full Name", "Email", "Phone Number", "Age", "Country", "Region / City"];

    doc.fontSize(10).font("Helvetica-Bold").fillColor("#fff");
    doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 20).fill("#2E7D32");
    doc.fillColor("#fff");
    let x = startX;
    headers.forEach((h, i) => {
      doc.text(h, x + 5, y + 5, { width: colWidths[i] - 10 });
      x += colWidths[i];
    });

    y += 20;
    doc.font("Helvetica").fontSize(9);

    registrations.forEach((r, index) => {
      if (y > 520) {
        doc.addPage({ layout: "landscape" });
        y = 40;
      }

      const rowColor = index % 2 === 0 ? "#F4F8F2" : "#FFFFFF";
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 20).fill(rowColor);
      doc.fillColor("#000");

      x = startX;
      const rowData = [r.full_name, r.email, r.phone_number, String(r.age), r.country, r.region];
      rowData.forEach((val, i) => {
        doc.text(val || "N/A", x + 5, y + 5, { width: colWidths[i] - 10 });
        x += colWidths[i];
      });

      y += 20;
    });

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#999").text(`Generated on ${new Date().toLocaleString('en-GB')} — Total registrations: ${registrations.length}`, 40, y + 10);

    doc.end();
  } catch (error) {
    console.error("DOWNLOAD EVENT REGISTRATIONS PDF ERROR:", error);
    req.flash("error", "Failed to generate PDF.");
    res.redirect("/account/dashboard/admin");
  }
}
// end here registered users.

/***************************************
 * 
 * Delivery search in admin dashboards
 * member dashboards and ict staff dashboards
 */
async function searchAdmin(req, res) {
  try {
    const query = req.query.q || "";
    if (query.trim().length < 2) return res.json({ accounts: [], jobs: [], news: [], events: [] });

    const results = await accountModel.searchAdminDashboard(query);
    res.json(results);
  } catch (error) {
    console.error("SEARCH ADMIN ERROR:", error);
    res.status(500).json({ accounts: [], jobs: [], news: [], events: [] });
  }
}

async function searchIct(req, res) {
  try {
    const query = req.query.q || "";
    if (query.trim().length < 2) return res.json({ tickets: [], accounts: [] });

    const results = await accountModel.searchIctDashboard(query);
    res.json(results);
  } catch (error) {
    console.error("SEARCH ICT ERROR:", error);
    res.status(500).json({ tickets: [], accounts: [] });
  }
}

async function searchMember(req, res) {
  try {
    const query = req.query.q || "";
    if (query.trim().length < 2) return res.json({ jobs: [], trainings: [] });

    const results = await accountModel.searchMemberDashboard(query);
    res.json(results);
  } catch (error) {
    console.error("SEARCH MEMBER ERROR:", error);
    res.status(500).json({ jobs: [], trainings: [] });
  }
}
//end here search.

/*************************
 * 
 * Delivery payment here
 */

/* ---------- Approve / Reject payments (admin) ---------- */
async function approvePaymentPost(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.session.account.id;
    const payment = await accountModel.approvePayment(id, adminId);

    if (!payment) {
      req.flash("error", "Payment not found.");
      return res.redirect("/account/dashboard/admin");
    }

    req.flash("success", "Payment approved. Member account is now active.");
    res.redirect("/account/dashboard/admin?paymentUpdated=true");
  } catch (error) {
    console.error("APPROVE PAYMENT ERROR:", error);
    req.flash("error", "Failed to approve payment.");
    res.redirect("/account/dashboard/admin");
  }
}

async function rejectPaymentPost(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.session.account.id;
    await accountModel.rejectPayment(id, adminId);

    req.flash("success", "Payment rejected.");
    res.redirect("/account/dashboard/admin?paymentUpdated=true");
  } catch (error) {
    console.error("REJECT PAYMENT ERROR:", error);
    req.flash("error", "Failed to reject payment.");
    res.redirect("/account/dashboard/admin");
  }
}
// end here

/***********************************
 * delivery ict to reset password
 */
async function ictResetMemberPassword(req, res) {
  try {
    const { id } = req.params;
    const { new_password, confirm_new_password } = req.body;

    if (new_password !== confirm_new_password) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/account/dashboard/ict-staff");
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await accountModel.adminResetPassword(id, hashedPassword);

    req.flash("success", "Member's password has been reset successfully.");
    res.redirect("/account/dashboard/ict-staff?membersUpdated=true");
  } catch (error) {
    console.error("ICT RESET PASSWORD ERROR:", error);
    req.flash("error", "Failed to reset password.");
    res.redirect("/account/dashboard/ict-staff");
  }
}

async function ictDeleteMember(req, res) {
  try {
    const { id } = req.params;
    const memberAccount = await accountModel.getAccountById(id);

    if (!memberAccount || memberAccount.account_type !== "member") {
      req.flash("error", "Member not found.");
      return res.redirect("/account/dashboard/ict-staff");
    }

    await accountModel.permanentlyDeleteAccount(id);

    req.flash("success", `${memberAccount.full_name}'s account has been permanently deleted.`);
    res.redirect("/account/dashboard/ict-staff?membersUpdated=true");
  } catch (error) {
    console.error("ICT DELETE MEMBER ERROR:", error);
    req.flash("error", "Failed to delete member.");
    res.redirect("/account/dashboard/ict-staff");
  }
}

/******************************************
 * 
 * Delivery create admin accounts
 */

async function createAdminPost(req, res) {
  try {
    const { fullName, email, phoneNumber, password, adminLevel } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await accountModel.createAdminAccount(fullName, email, phoneNumber, hashedPassword, adminLevel || "minor_admin");

    req.flash("success", "Admin account created successfully.");
    res.redirect("/account/dashboard/admin?adminsUpdated=true");
  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);
    if (error.code === "23505") {
      req.flash("error", "Email already exists.");
      return res.redirect("/account/dashboard/admin");
    }
    req.flash("error", "Failed to create admin account.");
    res.redirect("/account/dashboard/admin");
  }
}

async function updateAdminLevelPost(req, res) {
  try {
    const { id } = req.params;
    const { admin_level } = req.body;
    await accountModel.updateAdminLevel(id, admin_level);

    req.flash("success", "Admin role updated.");
    res.redirect("/account/dashboard/admin?adminsUpdated=true");
  } catch (error) {
    console.error("UPDATE ADMIN LEVEL ERROR:", error);
    req.flash("error", "Failed to update admin role.");
    res.redirect("/account/dashboard/admin");
  }
}

async function deleteAdminPost(req, res) {
  try {
    const { id } = req.params;

    // ✅ prevent a Super Admin from accidentally deleting themselves
    if (parseInt(id, 10) === req.session.account.id) {
      req.flash("error", "You cannot delete your own account.");
      return res.redirect("/account/dashboard/admin");
    }

    const targetAdmin = await accountModel.getAccountById(id);
    await accountModel.permanentlyDeleteAccount(id);

    req.flash("success", `${targetAdmin.full_name}'s admin account has been removed.`);
    res.redirect("/account/dashboard/admin?adminsUpdated=true");
  } catch (error) {
    console.error("DELETE ADMIN ERROR:", error);
    req.flash("error", "Failed to delete admin account.");
    res.redirect("/account/dashboard/admin");
  }
}
// end here.



/************************************
 * 
 * Delivery read more news here
 */
async function viewNewsDetails(req, res) {
  try {
    const { id } = req.params;
    const newsItem = await accountModel.getNewsById(id);

    if (!newsItem) {
      req.flash("error", "News post not found.");
      return res.redirect("/");
    }

    let nav = await utilities.getNav();
    res.render("pages/news-details", {
      title: newsItem.title,
      nav,
      newsItem,
    });
  } catch (error) {
    console.error("VIEW NEWS DETAILS ERROR:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/");
  }
}
// end here news full updates.

/*******************************
 * Delivery notifications
 */
async function getNotificationsJson(req, res) {
  try {
    const notifications = await accountModel.getNotificationsForAccount(req.session.account.id);
    res.json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json([]);
  }
}

async function markNotificationReadPost(req, res) {
  try {
    const { id } = req.params;
    await accountModel.markNotificationRead(id);
    res.sendStatus(200);
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);
    res.sendStatus(500);
  }
}

async function markAllNotificationsReadPost(req, res) {
  try {
    await accountModel.markAllNotificationsRead(req.session.account.id);
    res.sendStatus(200);
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    res.sendStatus(500);
  }
}

async function deleteNotificationPost(req, res) {
  try {
    const { id } = req.params;
    await accountModel.deleteNotification(id);
    res.sendStatus(200);
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);
    res.sendStatus(500);
  }
}
// end here.
/*************************
 * 
 * Delivery Node mailer ict staff create
 */

async function createIctStaffPost(req, res) {
  try {
    const { fullName, email, phoneNumber } = req.body;

    const tempPassword = utilities.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newIctStaff = await accountModel.createIctStaffAccount(fullName, email, phoneNumber, hashedPassword);

    const emailResult = await mailer.sendCredentialsEmail(email, fullName, tempPassword);

    if (emailResult.sent) {
      req.flash("success", `ICT staff account created for ${fullName}. Login credentials sent via email.`);
    } else {
      req.flash("success", `ICT staff account created for ${fullName}. Temporary password: ${tempPassword} (email sending not yet connected — share this manually for now).`);
    }

    res.redirect("/account/dashboard/admin?ictStaffAdded=true");
  } catch (error) {
    console.error("CREATE ICT STAFF ERROR:", error);
    if (error.code === "23505") {
      req.flash("error", "An account with this email already exists.");
      return res.redirect("/account/dashboard/admin");
    }
    req.flash("error", "Failed to create ICT staff account.");
    res.redirect("/account/dashboard/admin");
  }
}
// end here.
/********************
 * Delivery management for ict staffs by admins
 */
async function updateIctStaffPost(req, res) {
  try {
    const { id } = req.params;
    const { full_name, email, phone_number, status } = req.body;

    await accountModel.updateIctStaffDetails(id, { full_name, email, phone_number, status });

    req.flash("success", "ICT staff details updated successfully.");
    res.redirect("/account/dashboard/admin?ictStaffUpdated=true");
  } catch (error) {
    console.error("UPDATE ICT STAFF ERROR:", error);
    if (error.code === "23505") {
      req.flash("error", "That email is already in use by another account.");
      return res.redirect("/account/dashboard/admin");
    }
    req.flash("error", "Failed to update ICT staff details.");
    res.redirect("/account/dashboard/admin");
  }
}

async function adminResetIctPasswordPost(req, res) {
  try {
    const { id } = req.params;
    const { new_password, confirm_new_password } = req.body;

    if (new_password !== confirm_new_password) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/account/dashboard/admin");
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await accountModel.adminResetPassword(id, hashedPassword);

    req.flash("success", "ICT staff password has been reset successfully.");
    res.redirect("/account/dashboard/admin?ictStaffUpdated=true");
  } catch (error) {
    console.error("ADMIN RESET ICT PASSWORD ERROR:", error);
    req.flash("error", "Failed to reset password.");
    res.redirect("/account/dashboard/admin");
  }
}

async function deleteIctStaffPost(req, res) {
  try {
    const { id } = req.params;
    const ictAccount = await accountModel.getAccountById(id);

    if (!ictAccount || ictAccount.account_type !== "ict_staff") {
      req.flash("error", "ICT staff account not found.");
      return res.redirect("/account/dashboard/admin");
    }

    await accountModel.permanentlyDeleteAccount(id);

    req.flash("success", `${ictAccount.full_name}'s ICT staff account has been permanently deleted.`);
    res.redirect("/account/dashboard/admin?ictStaffUpdated=true");
  } catch (error) {
    console.error("DELETE ICT STAFF ERROR:", error);
    req.flash("error", "Failed to delete ICT staff account.");
    res.redirect("/account/dashboard/admin");
  }
}
// end here.

// delivery task assign for both minor admin and supper admin
async function createTaskPost(req, res) {
  try {
    const { title, description, due_date, assignee_ids } = req.body;

    let assigneeIds = Array.isArray(assignee_ids) ? assignee_ids : [assignee_ids];
    assigneeIds = assigneeIds.filter(Boolean);

    if (assigneeIds.length === 0) {
      req.flash("error", "Please select at least one person to assign this task to.");
      return res.redirect("/account/dashboard/admin");
    }

    await accountModel.createTask(req.session.account.id, title, description, due_date, assigneeIds);

    await accountModel.notifyRoles(["admin"], "Task Assigned", `A new task "${title}" was assigned.`, "/account/dashboard/admin");
    for (const id of assigneeIds) {
      await accountModel.createNotification(id, "New Task Assigned", `You have been assigned a new task: "${title}".`, null);
    }

    req.flash("success", "Task assigned successfully.");
    res.redirect("/account/dashboard/admin?tasksUpdated=true");
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    req.flash("error", "Failed to assign task.");
    res.redirect("/account/dashboard/admin");
  }
}

async function deleteTaskPost(req, res) {
  try {
    const { id } = req.params;
    await accountModel.deleteTask(id);
    req.flash("success", "Task deleted.");
    res.redirect("/account/dashboard/admin?tasksUpdated=true");
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);
    req.flash("error", "Failed to delete task.");
    res.redirect("/account/dashboard/admin");
  }
}

async function submitTaskReportPost(req, res) {
  try {
    const { taskAssigneeId } = req.params;

    if (!req.file) {
      req.flash("error", "Please upload your report as a PDF or DOC file.");
      return res.redirect("back");
    }

    const reportFilePath = `/uploads/task-reports/${req.file.filename}`;
    await accountModel.submitTaskReport(taskAssigneeId, reportFilePath);

    req.flash("success", "Task report submitted successfully.");
    res.redirect("back");
  } catch (error) {
    console.error("SUBMIT TASK REPORT ERROR:", error);
    req.flash("error", "Failed to submit report.");
    res.redirect("back");
  }
}

async function updateIndividualTaskStatusPost(req, res) {
  try {
    const { taskAssigneeId } = req.params;
    const { status } = req.body;
    await accountModel.updateIndividualTaskStatus(taskAssigneeId, status);
    req.flash("success", "Task status updated.");
    res.redirect("back");
  } catch (error) {
    console.error("UPDATE TASK STATUS ERROR:", error);
    req.flash("error", "Failed to update status.");
    res.redirect("back");
  }
}
// end here.

/***************************
 * Delivery testimonials create and view
 */

async function createTestimonialPost(req, res) {
  try {
    const { full_name, role_location, message, display_order } = req.body;
    const photo_path = req.file ? `/images/testimonials/${req.file.filename}` : null;

    await accountModel.createTestimonial({
      full_name,
      role_location,
      message,
      photo_path,
      display_order: parseInt(display_order, 10) || 1,
    });

    req.flash("success", "Testimonial posted successfully.");
    res.redirect("/account/dashboard/admin?testimonialsUpdated=true");
  } catch (error) {
    console.error("CREATE TESTIMONIAL ERROR:", error);
    req.flash("error", "Failed to post testimonial.");
    res.redirect("/account/dashboard/admin");
  }
}

async function deleteTestimonialPost(req, res) {
  try {
    const { id } = req.params;
    await accountModel.deleteTestimonial(id);
    req.flash("success", "Testimonial removed.");
    res.redirect("/account/dashboard/admin?testimonialsUpdated=true");
  } catch (error) {
    console.error("DELETE TESTIMONIAL ERROR:", error);
    req.flash("error", "Failed to remove testimonial.");
    res.redirect("/account/dashboard/admin");
  }
}

async function updateTestimonialPost(req, res) {
  try {
    const { id } = req.params;
    const { full_name, role_location, message, display_order, is_active } = req.body;
    const updateData = {
      full_name,
      role_location,
      message,
      display_order: parseInt(display_order, 10) || 1,
      is_active: is_active === "on",
    };

    if (req.file) {
      updateData.photo_path = `/images/testimonials/${req.file.filename}`;
    }

    await accountModel.updateTestimonial(id, updateData);

    req.flash("success", "Testimonial updated.");
    res.redirect("/account/dashboard/admin?testimonialsUpdated=true");
  } catch (error) {
    console.error("UPDATE TESTIMONIAL ERROR:", error);
    req.flash("error", "Failed to update testimonial.");
    res.redirect("/account/dashboard/admin");
  }
}
// end here.

// delivery intake registration
async function createIntakePost(req, res) {
  try {
    const {
      intake_name, open_date, close_date,
      mobile_money_number, mobile_money_provider,
      bank_name, bank_account_name, bank_account_number,
    } = req.body;

    await accountModel.createIntake({
      intake_name, open_date, close_date,
      mobile_money_number, mobile_money_provider,
      bank_name, bank_account_name, bank_account_number,
    });

    req.flash("success", `Registration for "${intake_name}" is now open.`);
    res.redirect("/account/dashboard/admin?intakeUpdated=true");
  } catch (error) {
    console.error("CREATE INTAKE ERROR:", error);
    req.flash("error", "Failed to open registration.");
    res.redirect("/account/dashboard/admin");
  }
}

async function closeIntakePost(req, res) {
  try {
    const { id } = req.params;
    await accountModel.closeIntake(id);
    req.flash("success", "Registration has been closed.");
    res.redirect("/account/dashboard/admin?intakeUpdated=true");
  } catch (error) {
    console.error("CLOSE INTAKE ERROR:", error);
    req.flash("error", "Failed to close registration.");
    res.redirect("/account/dashboard/admin");
  }
}

/* ✅ This replaces / precedes buildRegister — shown when user clicks "Register" */
async function buildRegisterGate(req, res) {
  try {
    const intake = await accountModel.getActiveIntake();
    let nav = await utilities.getNav();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let isOpen = false;
    let daysRemaining = 0;

    if (intake) {
      const closeDate = new Date(intake.close_date);
      closeDate.setHours(0, 0, 0, 0);
      isOpen = today <= closeDate;
      daysRemaining = Math.ceil((closeDate - today) / (1000 * 60 * 60 * 24));
    }

    res.render("account/register-gate", {
      title: "Registration",
      nav,
      intake,
      isOpen,
      daysRemaining,
    });
  } catch (error) {
    console.error("BUILD REGISTER GATE ERROR:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/");
  }
}
// end here.

/**************************
 * 
 * Delivery chatbot
 * 
 */
// async function chatbotAsk(req, res) {
//   try {
//     const { message } = req.body;

//     if (!message || message.trim().length === 0) {
//       return res.json({ type: "bot", text: "Please type a question and I'll try to help." });
//     }

//     const match = await accountModel.findFaqMatch(message);

//     if (match) {
//       return res.json({ type: "bot", text: match.answer });
//     }

//     // No FAQ match — check for a live agent
//     const agent = await accountModel.getAvailableIctStaff();

//     if (agent) {
//       return res.json({
//         type: "agent_available",
//         text: `I'm not sure about that one — but ${agent.name || agent.full_name} from our ICT team is online. Would you like me to connect you?`,
//       });
//     }

//     return res.json({
//       type: "no_agent",
//       text: "I'm not sure about that, and no ICT staff are online right now. Would you like to leave a message and we'll get back to you?",
//     });
//   } catch (error) {
//     console.error("CHATBOT ASK ERROR:", error);
//     res.status(500).json({ type: "bot", text: "Something went wrong. Please try again." });
//   }
// }

async function chatbotCreateTicket(req, res) {
  try {
    const { name, email, message } = req.body;

    // Create a lightweight ticket for anonymous chatbot handoff
    const guestAccount = await db("accounts").where({ email }).first();
    let accountId = guestAccount ? guestAccount.id : null;

    if (!accountId) {
      return res.json({ success: false, text: "Please log in or register to create a support ticket, or use the Contact Us page." });
    }

    const ticket = await accountModel.createTicket(accountId, "Chatbot handoff request", message);
    await accountModel.notifyRoles(["ict_staff"], "New Support Ticket (via Chatbot)", `A visitor requested live support: "${message}"`, "/account/dashboard/ict-staff");

    res.json({ success: true, text: `Got it — ticket #${ticket.ticket_number} has been created. Our ICT team will follow up soon.` });
  } catch (error) {
    console.error("CHATBOT CREATE TICKET ERROR:", error);
    res.status(500).json({ success: false, text: "Something went wrong creating your request." });
  }
}
// end here chatboat

// messages

async function chatbotStartSession(req, res) {
  try {
    const { visitor_name } = req.body;
    const session = await accountModel.createChatSession(visitor_name);
    res.json({ session_id: session.id, text: `Nice to meet you, ${visitor_name}! How can I help you today?` });
  } catch (error) {
    console.error("CHATBOT START SESSION ERROR:", error);
    res.status(500).json({ text: "Something went wrong. Please refresh and try again." });
  }
}

async function chatbotAsk(req, res) {
  try {
    const { message, session_id } = req.body;

    if (!message || message.trim().length === 0) {
      return res.json({ type: "bot", text: "Please type a question and I'll try to help." });
    }

    const match = await accountModel.findFaqMatch(message);

    if (match) {
      if (session_id) await accountModel.addChatMessage(session_id, "bot", "Assistant", match.answer);
      return res.json({ type: "bot", text: match.answer });
    }

    return res.json({
      type: "no_match",
      text: "I don't have an answer for that one. Would you like me to connect you with a live ICT agent?",
    });
  } catch (error) {
    console.error("CHATBOT ASK ERROR:", error);
    res.status(500).json({ type: "bot", text: "Something went wrong. Please try again." });
  }
}

async function chatbotConnectAgent(req, res) {
  try {
    const { session_id } = req.body;
    const agent = await accountModel.getAvailableIctStaff();

    if (!agent) {
      return res.json({ connected: false, text: "No ICT agents are online right now. Please try again shortly, or leave a message and we'll follow up." });
    }

    await accountModel.assignChatToAgent(session_id, agent.id);
    await accountModel.notifyRoles(["ict_staff"], "New Live Chat", `A visitor is waiting for live chat support.`, "/account/dashboard/ict-staff");

    res.json({
      connected: true,
      agent_name: agent.full_name,
      text: `Connecting you with ${agent.full_name} from our ICT team...`,
    });
  } catch (error) {
    console.error("CHATBOT CONNECT AGENT ERROR:", error);
    res.status(500).json({ connected: false, text: "Failed to connect to an agent. Please try again." });
  }
}

async function chatSendMessage(req, res) {
  try {
    const { session_id } = req.params;
    const { message, sender_type, sender_name } = req.body;

    await accountModel.addChatMessage(session_id, sender_type, sender_name, message);
    res.sendStatus(200);
  } catch (error) {
    console.error("CHAT SEND MESSAGE ERROR:", error);
    res.status(500).json({ error: true });
  }
}

async function chatGetMessages(req, res) {
  try {
    const { session_id } = req.params;
    const messages = await accountModel.getChatMessages(session_id);
    res.json(messages);
  } catch (error) {
    console.error("CHAT GET MESSAGES ERROR:", error);
    res.status(500).json([]);
  }
}

async function chatGetWaitingSessions(req, res) {
  try {
    const sessions = await accountModel.getWaitingChatSessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json([]);
  }
}

async function chatIctAcceptSession(req, res) {
  try {
    const { session_id } = req.params;
    const ictId = req.session.account.id;
    await accountModel.assignChatToAgent(session_id, ictId);
    await accountModel.addChatMessage(session_id, "bot", "System", `${req.session.account.full_name} has joined the chat.`);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: true });
  }
}

async function chatCloseSession(req, res) {
  try {
    const { session_id } = req.params;
    await accountModel.closeChatSession(session_id);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: true });
  }
}
// end here

// Delivery faq 
async function createSiteFaqPost(req, res) {
  try {
    const { question, answer, display_order } = req.body;
    await accountModel.createSiteFaq(question, answer, parseInt(display_order, 10) || 1);

    req.flash("success", "FAQ posted successfully.");
    res.redirect("/account/dashboard/ict-staff?faqsUpdated=true");
  } catch (error) {
    console.error("CREATE FAQ ERROR:", error);
    req.flash("error", "Failed to post FAQ.");
    res.redirect("/account/dashboard/ict-staff");
  }
}

async function updateSiteFaqPost(req, res) {
  try {
    const { id } = req.params;
    const { question, answer, display_order } = req.body;
    await accountModel.updateSiteFaq(id, question, answer, parseInt(display_order, 10) || 1);

    req.flash("success", "FAQ updated successfully.");
    res.redirect("/account/dashboard/ict-staff?faqsUpdated=true");
  } catch (error) {
    console.error("UPDATE FAQ ERROR:", error);
    req.flash("error", "Failed to update FAQ.");
    res.redirect("/account/dashboard/ict-staff");
  }
}

async function deleteSiteFaqPost(req, res) {
  try {
    const { id } = req.params;
    await accountModel.deleteSiteFaq(id);

    req.flash("success", "FAQ deleted.");
    res.redirect("/account/dashboard/ict-staff?faqsUpdated=true");
  } catch (error) {
    console.error("DELETE FAQ ERROR:", error);
    req.flash("error", "Failed to delete FAQ.");
    res.redirect("/account/dashboard/ict-staff");
  }
}
// end here
/******************
 * 
 * Delivery  hero
 */
async function createHeroSlidePost(req, res) {
  try {
    const { title, description, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link, display_order } = req.body;

    if (!req.file) {
      req.flash("error", "Please upload background image.");
      return res.redirect("/account/dashboard/ict-staff");
    }

    const image_path = `/images/hero-slides/${req.file.filename}`;

    await accountModel.createHeroSlide({
      title,
      description,
      image_path,
      primary_btn_text,
      primary_btn_link,
      secondary_btn_text,
      secondary_btn_link,
      display_order
    });

    req.flash("success", "Slide created successfully.");
    res.redirect("/account/dashboard/ict-staff");
  } catch (error) {
    console.error("CREATE HERO SLIDE ERROR:", error);
    req.flash("error", "Failed to create slide.");
    res.redirect("/account/dashboard/ict-staff");
  }
}


async function deleteHeroSlidePost(req, res) {
  try {
    await accountModel.deleteHeroSlide(req.params.id);
    req.flash("success", "Slide removed.");
    res.redirect("/account/dashboard/ict-staff?slidesUpdated=true");
  } catch (error) {
    console.error("DELETE HERO SLIDE ERROR:", error);
    req.flash("error", "Failed to remove slide.");
    res.redirect("/account/dashboard/ict-staff");
  }
}
// end here.

// delivery referral

async function createReferrerPost(req, res) {
  try {
    const { full_name } = req.body;
    await accountModel.createReferrer(full_name);
    req.flash("success", "Name added successfully.");
    res.redirect("/account/dashboard/admin?referrersUpdated=true");
  } catch (error) {
    console.error("CREATE REFERRER ERROR:", error);
    req.flash("error", "Failed to add name.");
    res.redirect("/account/dashboard/admin");
  }
}

async function deleteReferrerPost(req, res) {
  try {
    await accountModel.deleteReferrer(req.params.id);
    req.flash("success", "Name removed.");
    res.redirect("/account/dashboard/admin?referrersUpdated=true");
  } catch (error) {
    console.error("DELETE REFERRER ERROR:", error);
    req.flash("error", "Failed to remove name.");
    res.redirect("/account/dashboard/admin");
  }
}

async function downloadMembersByReferrerPdf(req, res) {
  try {
    const members = await accountModel.getMembersByReferrer();

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=members-by-referrer.pdf`);
    doc.pipe(res);

    doc.fontSize(16).fillColor("#2E7D32").font("Helvetica-Bold").text("AgroServices — Members by Registered By", { align: "center" });
    doc.moveDown(1);

    let currentReferrer = null;
    members.forEach((m) => {
      const referrerLabel = m.referrer_name || "Not specified";
      if (referrerLabel !== currentReferrer) {
        currentReferrer = referrerLabel;
        doc.moveDown(0.8);
        doc.fontSize(12).fillColor("#000").font("Helvetica-Bold").text(`Registered by: ${currentReferrer}`);
        doc.moveDown(0.3);
      }
      doc.fontSize(10).font("Helvetica").fillColor("#333")
        .text(`${m.full_name} — ${m.email} — ${m.phone_number || 'N/A'} — ${new Date(m.created_at).toLocaleDateString('en-GB')}`);
    });

    doc.end();
  } catch (error) {
    console.error("DOWNLOAD MEMBERS BY REFERRER PDF ERROR:", error);
    req.flash("error", "Failed to generate PDF.");
    res.redirect("/account/dashboard/admin");
  }
}
//end here



/* ****************************************
 * Logout
 * *************************************** */
function accountLogout(req, res) {
  const accountId = req.session.account ? req.session.account.id : null;

  if (accountId) {
    accountModel.markOffline(accountId).catch(err => console.error("MARK OFFLINE ERROR:", err));
  }

  req.flash("success", "You have been logged out successfully.");
  const flashMessages = req.session.flash;

  req.session.regenerate((err) => {
    if (err) console.error(err);
    req.session.flash = flashMessages;
    res.redirect("/account/login");
  });
}




module.exports={
  buildLogin,buildRegister,registerAccount,accountLogin,buildAdminDashboard,updateProfile,changePassword, buildIctStaffDashboard,buildMemberDashboard,createJob,buildApplyJob,submitJobApplication,updateApplicationStatus,submitMemberJobApplication,toggleJobStatus,createNewsPost, createEventPost,updateNewsPost,deleteNewsPost,updateEventPost,deleteEventPost,createTrainingPost,registerTraining,updateTrainingRegistrationStatus,createLessonPost,uploadTrainingGuide,deleteTrainingGuide,uploadLessonMaterial,deleteLessonMaterialPost,viewLesson,completeLesson,createSupportTicket,updateTicketStatusPost,replyToTicket,getTicketMessagesJson,deactivateAccountPost,reactivateAccountPost,createTeamMemberPost,updateTeamMemberPost,deleteTeamMemberAdminPost,deleteTeamMemberPost,viewMemberProfile,downloadMemberProfilePdf,submitContactForm,markMessageReadPost,viewEvent,buildEventRegister,submitEventRegistration,deleteEventRegistrationPost,downloadEventRegistrationsPdf,searchAdmin,searchIct,searchMember,approvePaymentPost,rejectPaymentPost,ictResetMemberPassword,ictDeleteMember,viewNewsDetails,createAdminPost,updateAdminLevelPost,deleteAdminPost,getNotificationsJson,markNotificationReadPost,markAllNotificationsReadPost,deleteNotificationPost,createIctStaffPost,updateIctStaffPost,adminResetIctPasswordPost,deleteIctStaffPost,createTaskPost,deleteTaskPost,submitTaskReportPost,updateIndividualTaskStatusPost,createTestimonialPost,deleteTestimonialPost,updateTestimonialPost,createIntakePost,closeIntakePost, buildRegisterGate,chatbotStartSession,chatbotAsk,chatbotConnectAgent,chatSendMessage,chatGetMessages,chatGetWaitingSessions,chatIctAcceptSession,chatCloseSession,createSiteFaqPost, updateSiteFaqPost, deleteSiteFaqPost,createHeroSlidePost, deleteHeroSlidePost,createReferrerPost,deleteReferrerPost,downloadMembersByReferrerPdf,accountLogout
}
