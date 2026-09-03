/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('device_trust_scores', (table) => {
    table.increments('id').primary();
    table.string('device_hash', 128).notNullable().unique();
    table.string('ip_address', 100);
    table.integer('trust_score').defaultTo(50);
    table.integer('successful_registrations').defaultTo(0);
    table.integer('flagged_attempts').defaultTo(0);
    table.timestamp('last_seen_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTableIfExists('device_trust_scores');
};
