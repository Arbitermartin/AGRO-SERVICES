/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('contact_messages', (table) => {
    table.increments('id').primary();
    table.string('full_name', 255).notNullable();
    table.string('email', 255).notNullable();
    table.string('phone_number', 20);
    table.string('subject', 255).notNullable();
    table.text('message').notNullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('contact_messages');
};
