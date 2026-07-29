/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('team_members', (table) => {
    table.increments('id').primary();
    table.string('full_name', 255).notNullable();
    table.string('title', 255).notNullable();
    table.enum('category', ['leadership', 'advisory']).notNullable().defaultTo('leadership');
    table.text('bio');
    table.string('photo_path', 500);
    table.string('linkedin_url', 500);
    table.string('twitter_url', 500);
    table.string('instagram_url',500);
    table.string('email', 255);
    table.integer('display_order').defaultTo(1);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('team_members');
};
