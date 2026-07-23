/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('events', (table) => {
        table.increments('event_id').primary();
        table.string('title', 255).notNullable();
        table.text('description');
        table.string('location', 255);
        table.date('event_date').notNullable();   // start date
        table.date('end_date').notNullable();     // event disappears after this
        table.timestamps(true, true);
      });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('events');
};
