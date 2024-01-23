const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');

module.exports = {
  localityLogin: async function(localityUsername, localityPassword){
    return new Promise(async (localityLoginPromiseResolve) => {
      const localityLoginSQL = `SELECT localityID, localityName FROM Localities WHERE localityUsername=(?) AND localityPassword=(?);`;
      const localityLoginValues = [localityUsername, localityPassword];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(localityLoginSQL, localityLoginValues);
      if (databaseResult.success){
        if (databaseResult.result.length == 0){
          const localityLoginResult = {success: false};
          localityLoginPromiseResolve(JSON.stringify(localityLoginResult));
        } else {
          const localityID = databaseResult.result[0].localityID;
          const localityName = databaseResult.result[0].localityName;
          const localityLoginResult = 
          {
            success: true,
            result: 
            {
              localityID: localityID,
              localityName: localityName
            }
          };
          localityLoginPromiseResolve(JSON.stringify(localityLoginResult));
        }
      } else {
        localityLoginPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },


  selectNotUsedTransactions: async function(){
    return new Promise(async (selectNotUsedTransactionsPromiseResolve) => {
      const selectNotUsedTransactionsSQL = `SELECT * FROM Transactions WHERE transactionUsed = (?);`;
      const selectNotUsedTransactionsValues = [false];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectNotUsedTransactionsSQL, selectNotUsedTransactionsValues);
      selectNotUsedTransactionsPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectLocalityAgents: async function(localityAgentLocalityID){
    return new Promise(async (selectLocalityAgentsPromiseResolve) => {
      const selectLocalityAgentsSQL = `SELECT * FROM LocalityAgents WHERE localityAgentLocalityID = (?) AND localityAgentActive = (?);`;
      const localityAgentActive = true;
      const selectLocalityAgentsValues = [localityAgentLocalityID, localityAgentActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectLocalityAgentsSQL, selectLocalityAgentsValues);
      selectLocalityAgentsPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  syncTransaction: async function(websocketConnection, transactionID, transactionStore, transactionApprover, transactionRelatedMessageID){
    return new Promise(async (syncTransactionPromiseResolve) => {
      const transactionApprovedDate = new Date().toString();
      const transactionUsed = true;
      const syncTransactionSQL = `UPDATE Transactions SET transactionStore=(?), transactionApprover=(?), transactionRelatedMessageID=(?), transactionApprovedDate=(?), transactionUsed=(?) WHERE transactionID=(?);`;
      const syncTransactionSQLValues = [transactionStore, transactionApprover, transactionRelatedMessageID, transactionApprovedDate, transactionUsed, transactionID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(syncTransactionSQL, syncTransactionSQLValues);
      syncTransactionPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectLocalities: async function(){
    return new Promise(async (selectLocalitiesPromiseResolve) => {
      const selectLocalitiesSQL = `SELECT * FROM Localities;`;
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectLocalitiesSQL);
      selectLocalitiesPromiseResolve(JSON.stringify(databaseResult));
    });
  },



}