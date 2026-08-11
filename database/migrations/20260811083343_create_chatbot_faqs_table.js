/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('chatbot_faqs', (table) => {
    table.increments('id').primary();
    table.string('question', 500).notNullable();
    table.text('answer').notNullable();
    table.text('keywords').notNullable(); // comma-separated match terms
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('chatbot_faqs');
};
