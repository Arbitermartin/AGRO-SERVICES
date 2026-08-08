/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.integer('assigned_by').unsigned().references('id').inTable('accounts').onDelete('SET NULL');
    table.string('title', 255).notNullable();
    table.text('description').notNullable();
    table.date('due_date');
    table.enum('status', ['pending', 'in_progress', 'completed', 'overdue']).defaultTo('pending');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTableIfExists('tasks');
};
