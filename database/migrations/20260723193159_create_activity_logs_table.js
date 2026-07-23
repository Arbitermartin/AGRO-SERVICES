/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('activity_logs', (table) => {
        table.increments('id').primary();
        table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE').notNullable();
        table.string('full_name', 255);
        table.string('action', 255).notNullable();   // e.g. "Updated profile", "Posted job: Field Officer"
        table.string('method', 10);                  // GET/POST
        table.string('route', 255);                  // e.g. /account/jobs/create
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('activity_logs');
  
};
