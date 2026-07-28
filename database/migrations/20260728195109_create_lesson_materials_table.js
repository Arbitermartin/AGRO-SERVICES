/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('lesson_materials', (table) => {
    table.increments('material_id').primary();
    table.integer('lesson_id').unsigned().references('lesson_id').inTable('lessons').onDelete('CASCADE').notNullable();
    table.string('title', 255).notNullable();
    table.string('file_path', 500).notNullable();
    table.string('file_type', 50);   // pdf, video, docx
    table.integer('uploaded_by').unsigned().references('id').inTable('accounts').onDelete('SET NULL');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTableIfExists('lesson_materials');
};
