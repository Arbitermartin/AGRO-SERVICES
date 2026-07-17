/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("payments", (table) => {

        table.increments("id").primary();
    
        table.integer("account_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("accounts")
          .onDelete("CASCADE");
    
        table.enum("membership_plan", [
          "Basic",
          "Standard",
          "Premium"
        ]).notNullable();
    
        table.decimal("amount", 10, 2).notNullable();
    
        table.enum("payment_method", [
          "Mobile Money",
          "Bank Transfer"
        ]).notNullable();
    
        table.string("transaction_reference", 100).notNullable();
    
        table.string("payment_proof", 500).notNullable();
    
        table.enum("payment_status", [
          "Pending",
          "Approved",
          "Rejected"
        ]).defaultTo("Pending");
    
        table.integer("verified_by")
          .unsigned()
          .references("id")
          .inTable("accounts")
          .onDelete("SET NULL");
    
        table.timestamp("verified_at");
    
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("payments");
};
