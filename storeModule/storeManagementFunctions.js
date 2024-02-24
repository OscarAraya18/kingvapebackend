const constants = require('../constants.js');
const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');
const whatsappDatabaseFunctions = require('../whatsappModule/whatsappDatabaseFunctions.js');
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

  selectStoreMessageByStoreMessageStoreName: async function(storeMessageStoreName){
    return new Promise(async (selectStoreMessageByStoreMessageStoreNamePromiseResolve) => {
      const selectStoreMessageByStoreMessageStoreNameSQL = `SELECT * FROM StoreMessages WHERE storeMessageStoreName=(?) ORDER BY storeMessageID DESC LIMIT 25;`;
      const selectStoreMessageByStoreMessageStoreNameValues = [storeMessageStoreName];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectStoreMessageByStoreMessageStoreNameSQL, selectStoreMessageByStoreMessageStoreNameValues);
      selectStoreMessageByStoreMessageStoreNamePromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  insertStoreMessage: async function(websocketConnection, storeMessageStoreName, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, storeMessageRecipientOrder, storeMessageRecipientID){
    return new Promise(async (insertStoreMessagePromiseResolve) => {
      const insertStoreMessageResult = await whatsappDatabaseFunctions.insertStoreMessage('', storeMessageStoreName, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, storeMessageRecipientOrder, storeMessageRecipientID);
      if (insertStoreMessageResult.success){
        websocketConnection.sendWebsocketMessage('/receiveWhatsappStoreMessage', insertStoreMessageResult);
        insertStoreMessagePromiseResolve(JSON.stringify(insertStoreMessageResult));
      } else {
        insertStoreMessagePromiseResolve(JSON.stringify(insertStoreMessageResult));
      }
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
              const startWhatsappStoreConversationResult = await whatsappManagementFunctions.startWhatsappStoreConversation(storeMessageAssignedAgentID, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, messageToClientContent);
              grabStoreConversationPromiseResolve(startWhatsappStoreConversationResult);
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
      const updateStoreMessageSQL = `UPDATE StoreMessages SET storeMessageAssignedAgentID=(?), storeMessageDeleteReason=(?) WHERE storeMessageID=(?);`;
      const updateStoreMessageValues = [storeMessageAssignedAgentID, storeMessageDeleteReason, storeMessageID];
      const updateStoreMessageDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateStoreMessageSQL, updateStoreMessageValues);
      deleteStoreMessagePromiseResolve(JSON.stringify(updateStoreMessageDatabaseResult));
    });
  },



}