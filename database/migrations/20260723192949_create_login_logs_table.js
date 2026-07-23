/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('login_logs', (table) => {
        table.increments('id').primary();
        table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE').notNullable();
        table.string('full_name', 255);
        table.string('account_type', 50);
        table.timestamp('login_time').defaultTo(knex.fn.now());
        table.timestamp('logout_time').nullable();
        table.string('ip_address', 100);
      });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('login_logs');
  
};
