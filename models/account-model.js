const db = require("../database/config/knex");

// ====================== SECURITY HELPER ======================
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input.trim().replace(/<script.*?>.*?<\/script>/gi, '')
                     .replace(/javascript:/gi, '');
  }
  return input;
}

async function registerAccount(fullName, email, Phone_number, hashedPassword) {
  try {
    const safeFullName = sanitizeInput(fullName);
    const safeEmail = sanitizeInput(email).toLowerCase();
    const safePhone = sanitizeInput(Phone_number);
    const account = await db("accounts")
      .insert({
        full_name:safeFullName,
        email:safeEmail,
        phone_number: safePhone,
        password: hashedPassword,
        account_type: "member",
      })
      .returning("*");

    return account[0];
  } catch (error) {
    throw error;
  }
}

/****************************
 * delivery change password by id
 */

async function getAccountById(id) {
  const accounts = await db("accounts").where({ id });
  return accounts[0];
}

async function updatePassword(id, hashedPassword) {
  return await db("accounts").where({ id }).update({ password: hashedPassword });
}
// end here for password change

// Delivery update profile
// async function updateProfilePhoto(accountId, photoPath) {
//   return await db("profiles").where({account_id: accountId }).update({ profile_photo: photoPath });
// }
async function upsertProfile(accountId, data) {
  const existing = await getProfileByAccountId(accountId);
  if (existing) {
    await db("profiles").where({ id: existing.id }).update(data);
    return { profile_photo: photoPath};
  }
  const inserted = await db("profiles").insert({ account_id: accountId, ...data }).returning("*");
  return inserted[0];
}

async function getProfilePhotoByAccountId(accountId) {
  const profile = await getProfileByAccountId(accountId);
  return profile ? profile.profile_photo : null;
}

async function checkExistingEmail(email) {
  const accounts = await db("accounts").where({ email });
  return accounts.length > 0;
}

async function getAccountByEmail(email) {
  const accounts = await db("accounts").where({ email });
  return accounts[0];
}
/* *****************************
 * Update full name
 * ***************************** */
async function updateFullName(accountId, fullName) {
  return await db("accounts").where({ id: accountId }).update({ full_name: fullName });
}

/* *****************************
 * Profile — get by account id
 * ***************************** */
async function getProfileByAccountId(accountId) {
  const rows = await db("profiles").where({ account_id: accountId });
  return rows[0];
}

/* *****************************
 * Profile — insert or update
 * ***************************** */
async function upsertProfile(accountId, data) {
  const existing = await getProfileByAccountId(accountId);
  if (existing) {
    await db("profiles").where({ id: existing.id }).update(data);
    return existing;
  }
  const inserted = await db("profiles").insert({ account_id: accountId, ...data }).returning("*");
  return inserted[0];
}

/* *****************************
 * Birth place — get by profile id
 * ***************************** */
async function getBirthPlaceByProfileId(profileId) {
  const rows = await db("birth_places").where({ profile_id: profileId });
  return rows[0];
}

/* *****************************
 * Birth place — insert or update
 * ***************************** */
async function upsertBirthPlace(profileId, data) {
  const existing = await getBirthPlaceByProfileId(profileId);
  if (existing) {
    return await db("birth_places").where({ id: existing.id }).update(data);
  }
  return await db("birth_places").insert({ profile_id: profileId, ...data });
}

/* *****************************
 * Admin details — get by profile id
 * ***************************** */
async function getAdminDetailsByProfileId(profileId) {
  const rows = await db("admins").where({ profile_id: profileId });
  return rows[0];
}

/* *****************************
 * Admin details — insert or update
 * ***************************** */
async function upsertAdminDetails(profileId, data) {
  const existing = await getAdminDetailsByProfileId(profileId);
  if (existing) {
    return await db("admins").where({ id: existing.id }).update(data);
  }
  return await db("admins").insert({ profile_id: profileId, ...data });
}
/****************
 * Delivery create job 
 */
async function createJob(data){
  const inserted = await db("jobs").insert(data).returning("*");
  return inserted[0];
}
async function getAllOpenJobs() {
  return await db("jobs")
  .where("status","open")
  .andWhere("end_date",">=",db.fn.now())
  .orderBy("created_at","desc");
  
}
async function getAllJobs() {
  return await db("jobs").orderBy("created_at", "desc");
}

async function toggleJobStatus(jobId) {
  const job = await db("jobs").where({ id: jobId }).first();
  if (!job) return null;
  const newStatus = job.status === "open" ? "closed" : "open";
  await db("jobs").where({ id: jobId }).update({ status: newStatus });
  return newStatus;
}

/************************************
 * Delivery job application
 */
async function getJobById(jobId){
  return await db("jobs").where({id:jobId}).first();
}
async function createJobApplication(data){
  const inserted = await db("job_applications").insert(data).returning("*");
  return inserted[0];
}
/************************************
 * 
 * Deivery appliction for admin
 */
async function getAllApplications() {
  return await db("job_applications as ja")
    .join("jobs as j", "ja.job_id", "j.id")
    .select(
      "ja.*",
      "j.title as job_title"
    )
    .orderBy("ja.created_at", "desc");
}

async function getApplicationsByJobId(jobId) {
  return await db("job_applications as ja")
    .join("jobs as j", "ja.job_id", "j.id")
    .where("ja.job_id", jobId)
    .select("ja.*", "j.title as job_title")
    .orderBy("ja.created_at", "desc");
}

async function updateApplicationStatus(applicationId, status) {
  return await db("job_applications").where({ id: applicationId }).update({ status });
}
/***********************************
 * delivery get application
 */
async function getApplicationsByAccountId(accountId) {
  return await db("job_applications as ja")
    .join("jobs as j", "ja.job_id", "j.id")
    .where("ja.account_id", accountId)
    .select("ja.*", "j.title as job_title", "j.region as job_region", "j.job_type as job_job_type")
    .orderBy("ja.created_at", "desc");
}
// end here

/**************************
 * 
 * Delivery job counting from db
 */
async function countAllJobs() {
  const result = await db("jobs").count("id as count").first();
  return parseInt(result.count, 10);
}

async function countOpenJobs() {
  const result = await db("jobs").where("status", "open").count("id as count").first();
  return parseInt(result.count, 10);
}
// end here

/***************************************
 * 
 * Delivery create news
 */
/* News */
async function createNews(data) {
  const inserted = await db("news").insert(data).returning("*");
  return inserted[0];
}

async function getLatestNews(limit = 3) {
  return await db("news").orderBy("news_date", "desc").limit(limit);
}

/* Events — only returns events that haven't ended yet */
async function createEvent(data) {
  const inserted = await db("events").insert(data).returning("*");
  return inserted[0];
}

async function getUpcomingEvents(limit = 3) {
  return await db("events")
    .where("end_date", ">=", db.fn.now())   // ✅ auto-hides expired events
    .orderBy("event_date", "asc")
    .limit(limit);
}

/**********************************
 * 
 * Delivery count event in admin dashboard
 */
async function countUpcomingEvents() {
  const result = await db("events")
    .where("end_date", ">=", db.fn.now())
    .count("event_id as count")
    .first();
  return parseInt(result.count, 10);
}

async function countAllEvents() {
  const result = await db("events").count("event_id as count").first();
  return parseInt(result.count, 10);
}
// end here counting for event

/*******************
 * 
 * Delivery member job count that he or she applied
 */
async function countApplicationsByAccountId(accountId) {
  const result = await db("job_applications")
    .where("account_id", accountId)
    .count("id as count")
    .first();
  return parseInt(result.count, 10);
}

/***************************************
 * 
 * Delivery news view and edit and delete news and events
 */
/* News management */
async function getNewsById(newsId) {
  return await db("news").where({ news_id: newsId }).first();
}

async function updateNews(newsId, data) {
  return await db("news").where({ news_id: newsId }).update(data);
}

async function deleteNews(newsId) {
  return await db("news").where({ news_id: newsId }).del();
}

/* Event management */
async function getEventById(eventId) {
  return await db("events").where({ event_id: eventId }).first();
}

async function updateEvent(eventId, data) {
  return await db("events").where({ event_id: eventId }).update(data);
}

async function deleteEvent(eventId) {
  return await db("events").where({ event_id: eventId }).del();
}

async function getAllNews() {
  return await db("news").orderBy("news_date", "desc");
}

async function getAllEventsAdmin() {
  return await db("events").orderBy("event_date", "desc");
}
// end here

/*****************************
 * 
 * Delivery activity and login logs
 * 
 */
/* Login logs */
async function createLoginLog(accountId, fullName, accountType, ipAddress) {
  const inserted = await db("login_logs")
    .insert({ account_id: accountId, full_name: fullName, account_type: accountType, ip_address: ipAddress })
    .returning("*");
  return inserted[0];
}

async function recordLogout(loginLogId) {
  return await db("login_logs").where({ id: loginLogId }).update({ logout_time: db.fn.now() });
}

async function getAllLoginLogs() {
  return await db("login_logs").orderBy("login_time", "desc");
}

/* Activity logs */
async function createActivityLog(accountId, fullName, action, method, route) {
  return await db("activity_logs").insert({ account_id: accountId, full_name: fullName, action, method, route });
}

async function getAllActivityLogs() {
  return await db("activity_logs").orderBy("created_at", "desc").limit(200);
}

/********************************************
 * Delivery training and registration
 */
/* Trainings */
async function createTraining(data) {
  const inserted = await db("trainings").insert(data).returning("*");
  return inserted[0];
}

async function getAllTrainings() {
  return await db("trainings").orderBy("created_at", "desc");
}

async function getActiveTrainings() {
  return await db("trainings").where("end_date", ">=", db.fn.now()).orderBy("start_date", "asc");
}

async function getTrainingById(trainingId) {
  return await db("trainings").where({ training_id: trainingId }).first();
}

async function updateTraining(trainingId, data) {
  return await db("trainings").where({ training_id: trainingId }).update(data);
}

async function deleteTraining(trainingId) {
  return await db("trainings").where({ training_id: trainingId }).del();
}

/* Training registrations */
async function registerForTraining(trainingId, accountId) {
  const existing = await db("training_registrations").where({ training_id: trainingId, account_id: accountId }).first();
  if (existing) return existing;
  const inserted = await db("training_registrations").insert({ training_id: trainingId, account_id: accountId }).returning("*");
  return inserted[0];
}

async function getMyTrainingRegistrations(accountId) {
  return await db("training_registrations as tr")
    .join("trainings as t", "tr.training_id", "t.training_id")
    .where("tr.account_id", accountId)
    .select("tr.*", "t.title", "t.category", "t.duration", "t.level", "t.start_date", "t.end_date")
    .orderBy("tr.created_at", "desc");
}

async function isRegisteredForTraining(trainingId, accountId) {
  const row = await db("training_registrations").where({ training_id: trainingId, account_id: accountId }).first();
  return !!row;
}

/****************************************************
 * 
 * Delivery get all training
 */
async function getAllTrainingRegistrations() {
  return await db("training_registrations as tr")
    .join("trainings as t", "tr.training_id", "t.training_id")
    .join("accounts as a", "tr.account_id", "a.id")
    .select(
      "tr.id",
      "tr.status",
      "tr.created_at",
      "t.title as training_title",
      "t.category",
      "t.start_date",
      "t.end_date",
      "a.full_name",
      "a.email",
      "a.phone_number"
    )
    .orderBy("tr.created_at", "desc");
}

async function updateTrainingRegistrationStatus(registrationId, status) {
  return await db("training_registrations").where({ id: registrationId }).update({ status });
}
// end here

/*******************
 * Delivery training guide
 */
async function createTrainingGuide(data) {
  const inserted = await db("training_guides").insert(data).returning("*");
  return inserted[0];
}

async function getAllTrainingGuides() {
  return await db("training_guides").orderBy("created_at", "desc");
}

async function deleteTrainingGuide(guideId) {
  return await db("training_guides").where({ id: guideId }).del();
}
// end here

/***************************
 * 
 * Delivery lessons and materials
 */
/* Lessons */
async function createLesson(data) {
  const inserted = await db("lessons").insert(data).returning("*");
  return inserted[0];
}
async function getAllLessons() {
  return await db("lessons").orderBy("created_at", "desc");
}

async function getLessonsByTrainingId(trainingId) {
  return await db("lessons").where({ training_id: trainingId }).orderBy("lesson_order", "asc");
}

async function getLessonById(lessonId) {
  return await db("lessons").where({ lesson_id: lessonId }).first();
}

/* Materials */
async function createLessonMaterial(data) {
  const inserted = await db("lesson_materials").insert(data).returning("*");
  return inserted[0];
}

async function getMaterialsByLessonId(lessonId) {
  return await db("lesson_materials").where({ lesson_id: lessonId }).orderBy("created_at", "asc");
}

async function deleteLessonMaterial(materialId) {
  return await db("lesson_materials").where({ material_id: materialId }).del();
}

/* Progress */
async function markLessonComplete(accountId, lessonId) {
  const existing = await db("lesson_progress").where({ account_id: accountId, lesson_id: lessonId }).first();
  if (existing) {
    return await db("lesson_progress").where({ id: existing.id }).update({ completed: true, completed_at: db.fn.now() });
  }
  return await db("lesson_progress").insert({ account_id: accountId, lesson_id: lessonId, completed: true, completed_at: db.fn.now() });
}

async function getProgressForTraining(accountId, trainingId) {
  return await db("lesson_progress as lp")
    .join("lessons as l", "lp.lesson_id", "l.lesson_id")
    .where("l.training_id", trainingId)
    .andWhere("lp.account_id", accountId)
    .andWhere("lp.completed", true)
    .select("lp.lesson_id");
}

async function getTrainingProgressSummary(accountId) {
  return await db("training_registrations as tr")
    .join("trainings as t", "tr.training_id", "t.training_id")
    .where("tr.account_id", accountId)
    .select("tr.training_id", "t.title", "t.category")
    .then(async (regs) => {
      for (const reg of regs) {
        const totalLessons = await db("lessons").where({ training_id: reg.training_id }).count("lesson_id as count").first();
        const completedLessons = await db("lesson_progress as lp")
          .join("lessons as l", "lp.lesson_id", "l.lesson_id")
          .where("l.training_id", reg.training_id)
          .andWhere("lp.account_id", accountId)
          .andWhere("lp.completed", true)
          .count("lp.id as count")
          .first();
        reg.total_lessons = parseInt(totalLessons.count, 10);
        reg.completed_lessons = parseInt(completedLessons.count, 10);
        reg.progress_percent = reg.total_lessons > 0 ? Math.round((reg.completed_lessons / reg.total_lessons) * 100) : 0;
      }
      return regs;
    });
}
// end here.
/* Support Tickets */
async function generateTicketNumber() {
  const last = await db("support_tickets").orderBy("id", "desc").first();
  const nextNum = last ? parseInt(last.ticket_number.split("-")[1], 10) + 1 : 1001;
  return `TKT-${nextNum}`;
}

async function createTicket(accountId, subject, description) {
  const ticket_number = await generateTicketNumber();
  const inserted = await db("support_tickets")
    .insert({ ticket_number, account_id: accountId, subject, description })
    .returning("*");
  return inserted[0];
}

async function getAllTickets() {
  return await db("support_tickets as t")
    .join("accounts as a", "t.account_id", "a.id")
    .select("t.*", "a.full_name", "a.email")
    .orderBy("t.created_at", "desc");
}

async function getTicketsByAccountId(accountId) {
  return await db("support_tickets").where({ account_id: accountId }).orderBy("created_at", "desc");
}

async function getTicketById(ticketId) {
  return await db("support_tickets as t")
    .join("accounts as a", "t.account_id", "a.id")
    .where("t.id", ticketId)
    .select("t.*", "a.full_name", "a.email")
    .first();
}

async function updateTicketStatus(ticketId, status) {
  return await db("support_tickets").where({ id: ticketId }).update({ status });
}

async function countTicketsByStatus() {
  const rows = await db("support_tickets").select("status").count("id as count").groupBy("status");
  const result = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
  rows.forEach(r => { result[r.status] = parseInt(r.count, 10); });
  return result;
}

/* Ticket Messages */
async function createTicketMessage(ticketId, accountId, message) {
  const inserted = await db("ticket_messages").insert({ ticket_id: ticketId, account_id: accountId, message }).returning("*");
  return inserted[0];
}

async function getMessagesByTicketId(ticketId) {
  return await db("ticket_messages as m")
    .join("accounts as a", "m.account_id", "a.id")
    .where("m.ticket_id", ticketId)
    .select("m.*", "a.full_name", "a.account_type")
    .orderBy("m.created_at", "asc");
}
// end here support tickets

// GET ALL MEMBER
async function getAllAccounts() {
  return await db("accounts").orderBy("account_type", "asc").orderBy("full_name", "asc");
}

async function deactivateAccount(accountId) {
  return await db("accounts").where({ id: accountId }).update({ status: "inactive" });
}

async function reactivateAccount(accountId) {
  return await db("accounts").where({ id: accountId }).update({ status: "active" });
}
// end here

/****************************************
 * Delivery count members
 */
async function countMembersOnly() {
  const result = await db("accounts").where("account_type", "member").count("id as count").first();
  return parseInt(result.count, 10);
}

async function countNewMembersThisMonth() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const result = await db("accounts")
    .where("account_type", "member")
    .andWhere("created_at", ">=", startOfMonth)
    .count("id as count")
    .first();
  return parseInt(result.count, 10);
}

async function countAdminsOnly() {
  const result = await db("accounts").where("account_type", "admin").count("id as count").first();
  return parseInt(result.count, 10);
}
// end here count member and admin

/************************
 * 
 * Delivery team page
 */
async function createTeamMember(data) {
  const inserted = await db("team_members").insert(data).returning("*");
  return inserted[0];
}

async function getAllTeamMembers() {
  return await db("team_members").orderBy("category", "asc").orderBy("display_order", "asc");
}

async function getTeamMembersByCategory(category) {
  return await db("team_members").where({ category }).orderBy("display_order", "asc");
}

async function deleteTeamMember(id) {
  return await db("team_members").where({ id }).del();
}
async function getTeamMemberById(id) {
  return await db("team_members").where({ id }).first();
}

async function updateTeamMember(id, data) {
  return await db("team_members").where({ id }).update(data);
}
// team member end here.

/* *****************************
 * Member — get by profile id
 * ***************************** */
async function getMemberByProfileId(profileId) {
  return db("members").where({ profile_id: profileId }).first();
}

/* *****************************
 * Member — insert or update
 * ***************************** */
async function upsertMember(profileId, data) {
  const existing = await getMemberByProfileId(profileId);
  if (existing) {
    await db("members")
      .where({ id: existing.id })
      .update({ ...data, updated_at: db.fn.now() });
    return existing;
  }
  const [inserted] = await db("members")
    .insert({ profile_id: profileId, ...data })
    .returning("*");
  return inserted;
}

/* *****************************
 * Education
 * ***************************** */
async function getEducationsByProfileId(profileId) {
  return db("education")
    .where({ profile_id: profileId })
    .orderBy("graduation_year", "desc");
}

async function replaceEducations(profileId, items) {
  await db("education").where({ profile_id: profileId }).del();
  if (items && items.length > 0) {
    await db("education").insert(
      items.map((i) => ({ profile_id: profileId, ...i }))
    );
  }
}

/* *****************************
 * Experiences
 * ***************************** */
async function getExperiencesByProfileId(profileId) {
  return db("experiences")
    .where({ profile_id: profileId })
    .orderBy("start_date", "desc");
}

async function replaceExperiences(profileId, items) {
  await db("experiences").where({ profile_id: profileId }).del();
  if (items && items.length > 0) {
    await db("experiences").insert(
      items.map((i) => ({ profile_id: profileId, ...i }))
    );
  }
}

/* *****************************
 * Phone number
 * ***************************** */
async function updatePhone(accountId, phone) {
  return db("accounts")
    .where({ id: accountId })
    .update({ phone_number: phone });
}

// get all member 
async function getFullMemberProfile(accountId) {
  const account = await db("accounts").where({ id: accountId }).first();
  if (!account) return null;

  const profile = await db("profiles").where({ account_id: accountId }).first();
  let birthPlace = null;
  let adminDetails = null;

  if (profile) {
    birthPlace = await db("birth_places").where({ profile_id: profile.id }).first();
    adminDetails = await db("admins").where({ profile_id: profile.id }).first();
  }

  return { account, profile, birthPlace, adminDetails };
}
// end here.

// Delivery contact us message
async function createContactMessage(data) {
  const inserted = await db("contact_messages").insert(data).returning("*");
  return inserted[0];
}

async function getAllContactMessages() {
  return await db("contact_messages").orderBy("created_at", "desc");
}

async function countUnreadContactMessages() {
  const result = await db("contact_messages").where("is_read", false).count("id as count").first();
  return parseInt(result.count, 10);
}

async function markContactMessageAsRead(id) {
  return await db("contact_messages").where({ id }).update({ is_read: true });
}

module.exports = {
  registerAccount,checkExistingEmail,getAccountByEmail,getAccountById,updatePassword,updateFullName,getProfileByAccountId,upsertProfile,
  getBirthPlaceByProfileId,upsertBirthPlace,getAdminDetailsByProfileId,
  upsertAdminDetails,createJob,getAllOpenJobs,getAllJobs,toggleJobStatus,
  getJobById,createJobApplication,getAllApplications,getApplicationsByJobId,updateApplicationStatus,getApplicationsByAccountId,countAllJobs,countOpenJobs,countApplicationsByAccountId,createNews,getLatestNews,createEvent,getUpcomingEvents,countAllEvents,countUpcomingEvents,getNewsById,updateNews,deleteNews,getEventById,updateEvent,deleteEvent,getAllNews,getAllEventsAdmin,createLoginLog,recordLogout,getAllLoginLogs,createActivityLog,getAllActivityLogs,createTraining,getAllTrainings,getActiveTrainings,
  getTrainingById,updateTraining,deleteTraining,registerForTraining,getMyTrainingRegistrations,isRegisteredForTraining,getAllTrainingRegistrations,updateTrainingRegistrationStatus,createTrainingGuide,getAllTrainingGuides,deleteTrainingGuide,createLesson,getAllLessons,getLessonsByTrainingId,getLessonById,createLessonMaterial,getMaterialsByLessonId,deleteLessonMaterial,markLessonComplete,getProgressForTraining,getTrainingProgressSummary,
  createTicket,generateTicketNumber,getAllTickets,getTicketsByAccountId,getTicketById,updateTicketStatus,countTicketsByStatus,createTicketMessage,getMessagesByTicketId,getAllAccounts,deactivateAccount,reactivateAccount,
  countMembersOnly,countNewMembersThisMonth,countAdminsOnly,createTeamMember,
  getAllTeamMembers,getTeamMemberById,updateTeamMember,getTeamMembersByCategory,deleteTeamMember,upsertProfile,getProfilePhotoByAccountId,getMemberByProfileId,upsertMember,getEducationsByProfileId,replaceEducations,
  getExperiencesByProfileId,replaceExperiences,updatePhone,getFullMemberProfile,createContactMessage,getAllContactMessages,countUnreadContactMessages,markContactMessageAsRead,

};