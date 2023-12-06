const constants = require('../constants.js');
const mysql = require('mysql');
const util = require('util');

// Create a connection pool
const pool = mysql.createPool(constants.databaseCredentials);

module.exports = {
  executeDatabaseSQL: async function (databaseSQL, databaseValues) {
    return new Promise(async (executeDatabaseSQLPromiseResolve) => {
      try {
        const query = util.promisify(pool.query).bind(pool);
        const queryResult = await query(databaseSQL, databaseValues);
        executeDatabaseSQLPromiseResolve({ success: true, result: queryResult });
      } catch (error) {
        executeDatabaseSQLPromiseResolve({ success: false, result: error });
      }
    });
  }
};