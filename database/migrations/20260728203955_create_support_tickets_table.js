/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('support_tickets', (table) => {
    table.increments('id').primary();
    table.string('ticket_number', 20).unique().notNullable();
    table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE').notNullable();
    table.string('subject', 255).notNullable();
    table.text('description').notNullable();
    table.enum('status', ['open', 'in_progress', 'resolved', 'closed']).defaultTo('open');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTableIfExists('support_tickets');
};
