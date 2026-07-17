/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('admins', (table) => {
        table.increments('id').primary();
        table.integer('profile_id').unsigned().references('id').inTable('profiles').onDelete('CASCADE').unique();
        table.string('department', 100);
        table.string('office', 100);
        table.string('admin_role', 100);
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('admins');
};
