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
};