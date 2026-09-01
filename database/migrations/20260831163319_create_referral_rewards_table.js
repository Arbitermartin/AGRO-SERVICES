/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('referral_rewards', (table) => {
    table.increments('id').primary();
    table.integer('referrer_account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE');
    table.string('tier', 50).notNullable();
    table.integer('referral_count_at_award').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('referral_rewards');
};
