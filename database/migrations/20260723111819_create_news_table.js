/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('news', (table) => {
        table.increments('news_id').primary();
        table.string('title', 255).notNullable();
        table.text('description').notNullable();
        table.string('profile_image', 500);
        table.date('news_date').notNullable();
        table.timestamps(true, true);
      });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('news');
  
};
