const constants = require('../constants.js');
const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');
const whatsappManagementFunctions = require('../whatsappModule/whatsappManagementFunctions.js');

module.exports = {
  selectAllStoreMessage: async function(){
    return new Promise(async (selectAllStoreMessagePromiseResolve) => {
      const selectAllStoreMessageSQL = `SELECT * FROM StoreMessages WHERE storeMessageAssignedAgentID IS NULL;`;
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAllStoreMessageSQL);
      selectAllStoreMessagePromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  grabStoreConversation: async function(websocketConnection, storeMessageID, storeMessageStoreMessageID, storeMessageStoreName, storeMessageAssignedAgentID, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, messageToClientContent){
    return new Promise(async (grabStoreConversationPromiseResolve) => {
      console.log(storeMessageID);
      console.log(storeMessageAssignedAgentID);
      const updateStoreMessageSQL = `UPDATE StoreMessages SET storeMessageAssignedAgentID=(?) WHERE storeMessageID=(?);`;
      const updateStoreMessageValues = [storeMessageAssignedAgentID, storeMessageID];
      const updateStoreMessageDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateStoreMessageSQL, updateStoreMessageValues);
      if (updateStoreMessageDatabaseResult.success){
        const sendWhatsappStoreMessageResult = await whatsappManagementFunctions.sendWhatsappStoreMessage(storeMessageStoreName, storeMessageStoreMessageID);
        if (sendWhatsappStoreMessageResult.success){
          const startWhatsappStoreConversationResult = await whatsappManagementFunctions.startWhatsappStoreConversation(storeMessageAssignedAgentID, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, messageToClientContent);
          const whatsappConversationID = startWhatsappStoreConversationResult.resultID;
          websocketConnection.sendWebsocketMessage('/grabStoreConversation', {success: true, result: {storeMessageID: storeMessageID, storeMessageStoreName: storeMessageStoreName}});
          grabStoreConversationPromiseResolve(startWhatsappStoreConversationResult);
        } else {
          grabStoreConversationPromiseResolve(JSON.stringify(sendWhatsappStoreMessageResult));
        }
      } else {
        grabStoreConversationPromiseResolve(JSON.stringify(updateStoreMessageDatabaseResult));
      }
    });
  }

}