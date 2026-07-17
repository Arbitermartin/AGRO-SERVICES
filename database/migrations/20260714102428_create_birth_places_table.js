/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('birth_places', (table) => {
        table.increments('id').primary();
        table.integer('profile_id').unsigned().references('id').inTable('profiles').onDelete('CASCADE');
        table.string('region', 100);
        table.string('district', 100);
        table.string('ward', 100);
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('birth_places');
};
