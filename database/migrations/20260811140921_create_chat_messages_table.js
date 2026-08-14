/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('chat_messages', (table) => {
    table.increments('id').primary();
    table.integer('session_id').unsigned().references('id').inTable('chat_sessions').onDelete('CASCADE').notNullable();
    table.enum('sender_type', ['visitor', 'ict', 'bot']).notNullable();
    table.string('sender_name', 255);
    table.text('message').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('chat_messages');
};
