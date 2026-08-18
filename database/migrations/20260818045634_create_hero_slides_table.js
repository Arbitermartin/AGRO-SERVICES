/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('hero_slides', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description').notNullable();
    table.string('image_path', 500).notNullable();
    table.string('primary_btn_text', 100);
    table.string('primary_btn_link', 255);
    table.string('secondary_btn_text', 100);
    table.string('secondary_btn_link', 255);
    table.integer('display_order').defaultTo(1);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTableIfExists('hero_slides');
};
