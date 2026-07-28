/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('trainings', (table) => {
    table.increments('training_id').primary();
    table.string('title', 255).notNullable();
    table.enum('category', ['crop', 'livestock', 'agribusiness', 'finance']).notNullable();
    table.text('description');
    table.string('duration', 100).notNullable();       // e.g. "6 weeks"
    table.enum('level', ['Beginner', 'Intermediate', 'Advanced']).notNullable();
    table.string('icon', 100).defaultTo('bi-mortarboard');
    table.string('gradient_start', 20).defaultTo('#66BB6A');
    table.string('gradient_end', 20).defaultTo('#2E7D32');
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTableIfExists('trainings');
};
