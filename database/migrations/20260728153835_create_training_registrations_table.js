/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('training_registrations', (table) => {
    table.increments('id').primary();
    table.integer('training_id').unsigned().references('training_id').inTable('trainings').onDelete('CASCADE').notNullable();
    table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE').notNullable();
    table.enum('status', ['registered', 'attended', 'cancelled']).defaultTo('registered');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('training_registrations');
};
