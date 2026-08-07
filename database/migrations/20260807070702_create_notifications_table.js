/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.integer('recipient_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE').notNullable();
    table.string('title', 255).notNullable();
    table.text('message').notNullable();
    table.string('link', 500);
    table.boolean('is_read').defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('notifications');
};
