/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('lesson_progress', (table) => {
    table.increments('id').primary();
    table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE').notNullable();
    table.integer('lesson_id').unsigned().references('lesson_id').inTable('lessons').onDelete('CASCADE').notNullable();
    table.boolean('completed').defaultTo(false);
    table.timestamp('completed_at').nullable();
    table.timestamps(true, true);
    table.unique(['account_id', 'lesson_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('lesson_progress');
};
