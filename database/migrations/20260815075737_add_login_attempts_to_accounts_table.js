/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('accounts', (table) => {
    table.integer('failed_login_attempts').defaultTo(0);
    table.timestamp('locked_until').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.alterTable('accounts', (table) => {
    table.dropColumn('failed_login_attempts');
    table.dropColumn('locked_until');
  });
};
