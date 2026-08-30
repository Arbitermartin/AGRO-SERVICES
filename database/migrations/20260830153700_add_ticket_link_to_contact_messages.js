/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('contact_messages', (table) => {
    table.integer('converted_ticket_id').unsigned().references('id').inTable('support_tickets').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('contact_messages', (table) => {
    table.dropColumn('converted_ticket_id');
  });
};
