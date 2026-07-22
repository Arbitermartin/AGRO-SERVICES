/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('jobs', (table) => {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.string('region', 100);
      table.enum('job_type', ['Full-time', 'Part-time', 'Contract', 'Internship']).notNullable();
      table.string('category', 100); // e.g. "Field Operations"
      table.text('description').notNullable(); // qualifications / requirements
      table.date('start_date').notNullable();
      table.date('end_date').notNullable(); // application deadline
      table.enum('status', ['open', 'closed']).defaultTo('open');
      table.timestamps(true, true);
    });
  };
  


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('jobs');
};
