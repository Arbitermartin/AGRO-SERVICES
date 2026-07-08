const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});


/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

module.exports = {
  development: {
    client: "pg",

    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },

    pool: {
      min: 2,
      max: 10,
    },

    migrations: {
      directory: "./migrations",
      tableName: "knex_migrations",
    },

    seeds: {
      directory: "./seeds",
    },
  },

  production: {
    client: "pg",

    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },

    pool: {
      min: 2,
      max: 10,
    },

    migrations: {
      directory: "./migrations",
      tableName: "knex_migrations",
    },

    seeds: {
      directory: "./seeds",
    },
  },
};