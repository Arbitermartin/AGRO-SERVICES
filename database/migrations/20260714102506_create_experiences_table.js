/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('experiences', (table) => {
        table.increments('id').primary();
        table.integer('profile_id').unsigned().references('id').inTable('profiles').onDelete('CASCADE');
        table.string('company_name', 255);
        table.string('job_title', 255);
        table.text('roles');
        table.integer('years_exp');
        table.date('start_date');
        table.date('end_date');
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('experiences');
};
