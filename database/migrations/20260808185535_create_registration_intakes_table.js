/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
      return knex.schema.createTable('registration_intakes', (table) => {
    table.increments('id').primary();
    table.string('intake_name', 255).notNullable();
    table.date('open_date').notNullable();
    table.date('close_date').notNullable();
    table.string('mobile_money_number', 50);
    table.string('mobile_money_provider', 100);
    table.string('bank_name', 100);
    table.string('bank_account_name', 255);
    table.string('bank_account_number', 100);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
   return knex.schema.dropTableIfExists('registration_intakes');
};
