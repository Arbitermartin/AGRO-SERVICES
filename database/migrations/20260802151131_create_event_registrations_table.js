/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('event_registrations', (table) => {
    table.increments('id').primary();
    table.integer('event_id').unsigned().references('event_id').inTable('events').onDelete('CASCADE').notNullable();
    table.string('full_name', 255).notNullable();
    table.string('email', 255).notNullable();
    table.string('phone_number', 20).notNullable();
    table.integer('age').notNullable();
    table.string('country', 100).notNullable();
    table.string('region', 100).notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTableIfExists('event_registrations');
};
