/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.alterTable('accounts', (table) => {
    table.integer('registration_trust_score');
    table.jsonb('behavior_metrics');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.alterTable('accounts', (table) => {
    table.dropColumn('registration_trust_score');
    table.dropColumn('behavior_metrics');
  });
};
