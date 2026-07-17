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

async function checkExistingEmail(email) {
  const accounts = await db("accounts").where({ email });
  return accounts.length > 0;
}

async function getAccountByEmail(email) {
  const accounts = await db("accounts").where({ email });
  return accounts[0];
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail };