/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('education', (table) => {
        table.increments('id').primary();
        table.integer('profile_id').unsigned().references('id').inTable('profiles').onDelete('CASCADE');
        table.enum('level',[
            'Primary',
            'Secondary',
            'Certificate',
            'Diploma',
            'Bachelor',
            'Master',
            'PhD'
        ]).notNullable();
        table.string('institution',255).notNullable();
        table.string('course_name',255);
        table.integer('graduation_year');
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('education');
};
