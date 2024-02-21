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
        const selectWhatsappConversationSQL = `SELECT whatsappConversationID FROM WhatsappConversations WHERE whatsappConversationRecipientPhoneNumber=(?) AND whatsappConversationIsActive=(?);`;
        const selectWhatsappConversationValues = [storeMessageRecipientPhoneNumber, true];
        const selectWhatsappConversationDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectWhatsappConversationSQL, selectWhatsappConversationValues);
        if (selectWhatsappConversationDatabaseResult.success){
          if (selectWhatsappConversationDatabaseResult.result.length == 0){
            const updateStoreMessageSQL = `UPDATE StoreMessages SET storeMessageAssignedAgentID=(?) WHERE storeMessageID=(?);`;
            const updateStoreMessageValues = [storeMessageAssignedAgentID, storeMessageID];
            const updateStoreMessageDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateStoreMessageSQL, updateStoreMessageValues);
            if (updateStoreMessageDatabaseResult.success){
              const sendWhatsappStoreMessageResult = await whatsappManagementFunctions.sendWhatsappStoreMessage(storeMessageStoreName, storeMessageStoreMessageID, 'LISTO');
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
        } else {
          grabStoreConversationPromiseResolve(JSON.stringify(selectWhatsappConversationDatabaseResult));
        }
      } else {
        grabStoreConversationPromiseResolve(JSON.stringify({success: false, result: 'Duplicate'}));
      }
    });
  },

  deleteStoreMessage: async function(websocketConnection, storeMessageID, storeMessageStoreMessageID, storeMessageStoreName, storeMessageAssignedAgentID, storeMessageDeleteReason){
    return new Promise(async (deleteStoreMessagePromiseResolve) => {
      websocketConnection.sendWebsocketMessage('/grabStoreConversation', {success: true, result: {storeMessageID: storeMessageID, storeMessageStoreName: storeMessageStoreName}});
      const sendWhatsappStoreMessageResult = await whatsappManagementFunctions.sendWhatsappStoreMessage(storeMessageStoreName, storeMessageStoreMessageID, 'LISTO. ELIMINADO EN EL CALL CENTER');
      if (sendWhatsappStoreMessageResult.success){
        const updateStoreMessageSQL = `UPDATE StoreMessages SET storeMessageAssignedAgentID=(?), storeMessageDeleteReason=(?) WHERE storeMessageID=(?);`;
        const updateStoreMessageValues = [storeMessageAssignedAgentID, storeMessageDeleteReason, storeMessageID];
        const updateStoreMessageDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateStoreMessageSQL, updateStoreMessageValues);
        deleteStoreMessagePromiseResolve(JSON.stringify(updateStoreMessageDatabaseResult));
      } else {
        deleteStoreMessagePromiseResolve(JSON.stringify(sendWhatsappStoreMessageResult));
      }
    });
  },



}