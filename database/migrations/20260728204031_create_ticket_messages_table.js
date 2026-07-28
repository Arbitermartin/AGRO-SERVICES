/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('ticket_messages', (table) => {
    table.increments('id').primary();
    table.integer('ticket_id').unsigned().references('id').inTable('support_tickets').onDelete('CASCADE').notNullable();
    table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE').notNullable();
    table.text('message').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('ticket_messages');
};
