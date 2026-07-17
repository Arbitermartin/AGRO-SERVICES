/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('profiles', (table) => {
        table.increments('id').primary();
        table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE');
        table.date('date_of_birth');
        table.enum('gender', ['male', 'female', 'other']);
        table.string('nationality', 100);
        table.string('profile_photo', 500);
        table.text('bio');
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('profiles');
  
};
