/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('chat_sessions', (table) => {
    table.increments('id').primary();
    table.string('visitor_name', 255).notNullable();
    table.integer('assigned_ict_id').unsigned().references('id').inTable('accounts').onDelete('SET NULL');
    table.enum('status', ['waiting', 'active', 'closed']).defaultTo('waiting');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('chat_sessions');
};
