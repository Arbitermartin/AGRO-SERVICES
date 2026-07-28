/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('training_guides', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.string('file_path', 500).notNullable();
    table.integer('page_count');
    table.integer('uploaded_by').unsigned().references('id').inTable('accounts').onDelete('SET NULL');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('training_guides');
};
