/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('task_assignees', (table) => {
    table.increments('id').primary();
    table.integer('task_id').unsigned().references('id').inTable('tasks').onDelete('CASCADE').notNullable();
    table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE').notNullable();
    table.enum('individual_status', ['pending', 'in_progress', 'completed']).defaultTo('pending');
    table.string('report_file_path', 500);
    table.timestamp('submitted_at');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTableIfExists('task_assignees');
};
