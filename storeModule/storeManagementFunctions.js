const constants = require('../constants.js');
const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');
const whatsappManagementFunctions = require('../whatsappModule/whatsappManagementFunctions.js');


var storeRequests = {};

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
      if (!(storeMessageRecipientPhoneNumber in storeRequests)){
        storeRequests[storeMessageRecipientPhoneNumber] = true;
        websocketConnection.sendWebsocketMessage('/grabStoreConversation', {success: true, result: {storeMessageID: storeMessageID, storeMessageStoreName: storeMessageStoreName}});
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
        delete storeRequests[storeMessageRecipientPhoneNumber];
      } else {
        grabStoreConversationPromiseResolve(JSON.stringify({success: false, result: 'Duplicate'}));
      }
    });
  }

}