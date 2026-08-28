/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('crop_cost_benchmarks', (table) => {
    table.increments('id').primary();
    table.string('region', 100).notNullable();
    table.string('district', 100).notNullable();
    table.string('crop_name', 100).notNullable();
    table.enum('farming_method', ['rain_fed', 'irrigated']).notNullable();
    table.decimal('seed_cost_per_acre', 12, 2).notNullable();
    table.decimal('fertilizer_cost_per_acre', 12, 2).notNullable();
    table.decimal('land_prep_cost_per_acre', 12, 2).notNullable();
    table.decimal('labor_cost_per_acre', 12, 2).notNullable();
    table.decimal('irrigation_cost_per_acre', 12, 2).defaultTo(0);
    table.decimal('pesticide_cost_per_acre', 12, 2).notNullable();
    table.decimal('machinery_cost_per_acre', 12, 2).notNullable();
    table.decimal('harvesting_cost_per_acre', 12, 2).notNullable();
    table.decimal('transport_cost_per_acre', 12, 2).notNullable();
    table.decimal('expected_yield_per_acre', 12, 2).notNullable(); // in kg
    table.decimal('market_price_per_kg', 12, 2).notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTableIfExists('crop_cost_benchmarks');
};
