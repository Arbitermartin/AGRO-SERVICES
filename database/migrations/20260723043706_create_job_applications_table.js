/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('job_applications', (table) => {
        table.increments('id').primary();
        table.integer('job_id').unsigned().references('id').inTable('jobs').onDelete('CASCADE').notNullable();
        table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('SET NULL').nullable();
        table.string('applicant_name', 255).notNullable();
        table.string('applicant_email', 255).notNullable();
        table.string('applicant_phone', 20).notNullable();
        table.integer('years_experience').defaultTo(0);
        table.text('cover_letter').notNullable();
        table.string('cv_file_path', 500).notNullable();
        table.enum('status', ['submitted', 'under_review', 'shortlisted', 'rejected', 'hired']).defaultTo('submitted');
        table.timestamps(true, true);
    });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('job_applications');
  
};
