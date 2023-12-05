// INTERNAL MODULES IMPORT
const constants = require('../constants.js');

// EXTERNAL MODULES IMPORT
const mysql = require('mysql');

module.exports = {
  executeDatabaseSQL: async function(databaseSQL, databaseValues){
    return new Promise (async (executeDatabaseSQLPromiseResolve) => {
      try {
        const databaseConnection = mysql.createConnection(constants.databaseCredentials);
        databaseConnection.connect(function(connectionError){
          if (connectionError){
            executeDatabaseSQLPromiseResolve({success: false, result: connectionError});
          } else {
            databaseConnection.query(databaseSQL, databaseValues, function (queryError, queryResult) {
              if (queryError) {
                executeDatabaseSQLPromiseResolve({success: false, result: queryError});
              } else {
                executeDatabaseSQLPromiseResolve({success: true, result: queryResult});
              }
              databaseConnection.end();
            });
          }
        });
      } catch {

      }
    });
  }

}