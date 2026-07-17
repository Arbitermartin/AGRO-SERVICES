/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('members', (table) => {
        table.increments('id').primary();
        table.integer('profile_id').unsigned().references('id').inTable('profiles').onDelete('CASCADE').unique();
        table.string('student_number', 50).unique();
        table.string('programme', 255);
        table.integer('year_of_study');
        table.enum("employment_status",[
            "Employed",
            "Self-employed",
            "Student",
            "Unemployed"
        ]);
        table.string("company_name");
        table.string("position");
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('members');
};
