/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('lessons', (table) => {
    table.increments('lesson_id').primary();
    table.integer('training_id').unsigned().references('training_id').inTable('trainings').onDelete('CASCADE').notNullable();
    table.string('title', 255).notNullable();
    table.text('description');
    table.integer('lesson_order').notNullable().defaultTo(1);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('lessons');
};
