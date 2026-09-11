/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  await knex("appointments").del();
  await knex("staff_availability").del();
  await knex("appointment_services").del();

  // 1. Services
  await knex("appointment_services").insert([
    {
      name: "Agricultural Consultation",
      description: "One-on-one advice on crops, soil and farming practices",
      duration_minutes: 30,
      is_active: true,
    },
    {
      name: "Membership Support",
      description: "Help with registration, payments and account issues",
      duration_minutes: 20,
      is_active: true,
    },
    {
      name: "Training Guidance",
      description: "Guidance on available trainings and how to register",
      duration_minutes: 30,
      is_active: true,
    },
  ]);

  // 2. Find an ICT staff or Admin account to use as staff
  const staff = await knex("accounts")
    .whereIn("account_type", ["ict_staff", "admin"])
    .first();

  if (!staff) {
    console.log("No ICT/Admin account found. Please create one first.");
    return;
  }

  // 3. Staff availability (Monday – Friday, 09:00 – 16:00)
  const days = [1, 2, 3, 4, 5]; // Mon–Fri
  for (const day of days) {
    await knex("staff_availability").insert({
      staff_id: staff.id,
      day_of_week: day,
      start_time: "09:00",
      end_time: "16:00",
    });
  }
};
