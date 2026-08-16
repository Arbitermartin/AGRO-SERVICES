/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('site_faqs', (table) => {
    table.increments('id').primary();
    table.string('question', 500).notNullable();
    table.text('answer').notNullable();
    table.integer('display_order').defaultTo(1);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('site_faqs');
};
