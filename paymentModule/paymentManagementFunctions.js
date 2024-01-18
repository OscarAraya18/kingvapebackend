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
}