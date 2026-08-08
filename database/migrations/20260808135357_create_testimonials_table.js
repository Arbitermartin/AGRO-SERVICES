/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('testimonials', (table) => {
    table.increments('id').primary();
    table.string('full_name', 255).notNullable();
    table.string('role_location', 255);
    table.text('message').notNullable();
    table.string('photo_path', 500);
    table.integer('display_order').defaultTo(1);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTableIfExists('testimonials');
};
