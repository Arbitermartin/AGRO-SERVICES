/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.alterTable('accounts', (table) => {
    table.integer('referrer_id').unsigned().references('id').inTable('member_referrers').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('accounts', (table) => {
    table.dropColumn('referrer_id');
  });
};
