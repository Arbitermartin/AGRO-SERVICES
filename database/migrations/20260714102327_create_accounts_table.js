/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('accounts',(table)=>{
    table.increments('id').primary();
    table.string('full_name',255).notNullable();
    table.string('email',255).unique().notNullable();
    table.string('phone_number',20);
    table.string('password',255).notNullable();
    table.enum('account_type',['admin','ict_staff','member']);
    table.enum('status', ['active', 'inactive', 'pending']).defaultTo('pending');
    table.timestamps(true, true);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('accounts');
};
