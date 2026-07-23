const db = require("../database/config/knex");

async function registerAccount(fullName, email, Phone_number, hashedPassword) {
  try {
    const account = await db("accounts")
      .insert({
        full_name: fullName,
        email,
        phone_number: Phone_number,
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

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updatePassword,
  updateFullName,
  getProfileByAccountId,
  upsertProfile,
  getBirthPlaceByProfileId,
  upsertBirthPlace,
  getAdminDetailsByProfileId,
  upsertAdminDetails,
  createJob,
  getAllOpenJobs,
  getAllJobs,
  toggleJobStatus,
  getJobById,
  createJobApplication,
  getAllApplications,
  getApplicationsByJobId,
  updateApplicationStatus,
  getApplicationsByAccountId,
  countAllJobs,
  countOpenJobs,
  countApplicationsByAccountId,
  createNews,
  getLatestNews,
  createEvent,
  getUpcomingEvents,
  countAllEvents,
  countUpcomingEvents,
  getNewsById,
  updateNews,
  deleteNews,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllNews,
  getAllEventsAdmin,
  createLoginLog,
  recordLogout,
  getAllLoginLogs,
  createActivityLog,
  getAllActivityLogs

};