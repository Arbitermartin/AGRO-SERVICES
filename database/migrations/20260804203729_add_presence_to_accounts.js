/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('accounts', (table) => {
    table.timestamp('last_active_at').nullable();
    table.boolean('is_online').defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.alterTable('accounts', (table) => {
    table.dropColumn('last_active_at');
    table.dropColumn('is_online');
  });
};
