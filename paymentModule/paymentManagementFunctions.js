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

  selectUsedTransactions: async function(initialDate, endDate){
    return new Promise(async (selectUsedTransactionsPromiseResolve) => {
      const conditions = [];
            
      if (initialDate != ''){
        initialDate = new Date(initialDate);
        initialDate.setHours(initialDate.getHours() + 6);
        initialDate = initialDate.toString();
        initialDate = initialDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(transactionApprovedDate, '%a %b %d %Y %H:%i:%s GMT+0000') >= STR_TO_DATE('${initialDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      if (endDate != ''){
        endDate = new Date(endDate);
        endDate.setHours(endDate.getHours() + 6);
        endDate = endDate.toString();
        endDate = endDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(transactionApprovedDate, '%a %b %d %Y %H:%i:%s GMT+0000') <= STR_TO_DATE('${endDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      const whereClause = conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '';
      
      var selectUsedTransactionsSQL = 
      `
        SELECT 
          Transactions.transactionID,
          Transactions.transactionNote,
          Transactions.transactionAmount,
          Transactions.transactionDate,
          Transactions.transactionRelatedMessageID,
          Transactions.transactionApprovedDate,
          LocalityAgents.localityAgentName,
          Agents.agentName,
          Localities.localityName
        FROM Transactions
        LEFT JOIN LocalityAgents ON Transactions.transactionApprover = LocalityAgents.localityAgentID
        LEFT JOIN Agents ON Transactions.transactionApprover = Agents.agentID
        LEFT JOIN Localities ON Transactions.transactionStore = Localities.localityID
        WHERE transactionUsed = (?)
      `;

      selectUsedTransactionsSQL = selectUsedTransactionsSQL + whereClause;
      const selectUsedTransactionsValues = [true];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectUsedTransactionsSQL, selectUsedTransactionsValues);
      selectUsedTransactionsPromiseResolve(JSON.stringify(databaseResult));
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
      const syncTransactionValues = [transactionStore, transactionApprover, transactionRelatedMessageID, transactionApprovedDate, transactionUsed, transactionID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(syncTransactionSQL, syncTransactionValues);
      syncTransactionPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  reverseTransaction: async function(websocketConnection, transactionID){
    return new Promise(async (reverseTransactionPromiseResolve) => {
      const transactionStore = null;
      const transactionApprover = null;
      const transactionRelatedMessageID = null;
      const transactionApprovedDate = null;
      const transactionUsed = false;
      const reverseTransactionSQL = `UPDATE Transactions SET transactionStore=(?), transactionApprover=(?), transactionRelatedMessageID=(?), transactionApprovedDate=(?), transactionUsed=(?) WHERE transactionID=(?);`;
      const reverseTransactionValues = [transactionStore, transactionApprover, transactionRelatedMessageID, transactionApprovedDate, transactionUsed, transactionID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(reverseTransactionSQL, reverseTransactionValues);
      reverseTransactionPromiseResolve(JSON.stringify(databaseResult));
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