/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('cost_calculations', (table) => {
    table.increments('id').primary();
    table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE');
    table.string('region', 100);
    table.string('district', 100);
    table.string('crop_name', 100);
    table.decimal('farm_size', 8, 2);
    table.string('farming_method', 20);
    table.decimal('total_cost', 14, 2);
    table.decimal('expected_revenue', 14, 2);
    table.decimal('estimated_profit', 14, 2);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTableIfExists('cost_calculations');
};
