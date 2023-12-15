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
      const selectWhatsappConversationSQL = `SELECT whatsappConversationID from WhatsappConversations WHERE whatsappConversationRecipientPhoneNumber=(?) AND whatsappConversationIsActive=(?);`;
      const whatsappConversationIsActive = true;
      const selectWhatsappConversationValues = [storeMessageRecipientPhoneNumber, whatsappConversationIsActive];
      const selectWhatsappConversationDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectWhatsappConversationSQL, selectWhatsappConversationValues);
      if (selectWhatsappConversationDatabaseResult.success){
        websocketConnection.sendWebsocketMessage('/grabStoreConversation', {success: true, result: {storeMessageID: storeMessageID, storeMessageStoreName: storeMessageStoreName}});
        if (selectWhatsappConversationDatabaseResult.result.length == 0) {
          const updateStoreMessageSQL = `UPDATE StoreMessages SET storeMessageAssignedAgentID=(?) WHERE storeMessageID=(?);`;
          const updateStoreMessageValues = [storeMessageAssignedAgentID, storeMessageID];
          const updateStoreMessageDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateStoreMessageSQL, updateStoreMessageValues);
          if (updateStoreMessageDatabaseResult.success){
            const sendWhatsappStoreMessageResult = await whatsappManagementFunctions.sendWhatsappStoreMessage(storeMessageStoreName, storeMessageStoreMessageID);
            if (sendWhatsappStoreMessageResult.success){
              const startWhatsappStoreConversationResult = await whatsappManagementFunctions.startWhatsappStoreConversation(storeMessageAssignedAgentID, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, messageToClientContent);
              const whatsappConversationID = startWhatsappStoreConversationResult.resultID;
              grabStoreConversationPromiseResolve(startWhatsappStoreConversationResult);
            } else {
              grabStoreConversationPromiseResolve(JSON.stringify(sendWhatsappStoreMessageResult));
            }
          } else {
            grabStoreConversationPromiseResolve(JSON.stringify(updateStoreMessageDatabaseResult));
          }
        } else {
          const deleteStoreMessageSQL = `DELETE FROM StoreMessages WHERE storeMessageAssignedAgentID=(?) WHERE storeMessageRecipientPhoneNumber=(?);`;
          const deleteStoreMessageValues = [null, storeMessageRecipientPhoneNumber];
          const deleteStoreMessageDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(deleteStoreMessageValues, deleteStoreMessageSQL);
          grabStoreConversationPromiseResolve(JSON.stringify({success: false, result: 'Duplicate'}));
        }
      } else {
        grabStoreConversationPromiseResolve(JSON.stringify(selectWhatsappConversationDatabaseResult));
      }
    });
  }

}