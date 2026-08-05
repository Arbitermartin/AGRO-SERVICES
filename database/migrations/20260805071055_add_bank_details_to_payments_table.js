/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('payments', (table) => {
    table.string('bank_name', 100);
    table.string('bank_account_number', 100);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('payments', (table) => {
    table.dropColumn('bank_name');
    table.dropColumn('bank_account_number');
  });
};
