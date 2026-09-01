/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('accounts', (table) => {
    table.integer('referred_by_account_id').unsigned().references('id').inTable('accounts').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('accounts', (table) => {
    table.dropColumn('referred_by_account_id');
  });
};
