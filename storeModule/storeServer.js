// INTERNAL MODULES IMPORT
const websocketConnection = require('../websocketModule/websocketManagementFunctions.js');
const storeManagementFunctions = require('./storeManagementFunctions.js');

// HTTP REQUEST WHATSAPP SERVER SETUP
const express = require('express');
const backendStoreHttpRequestServer = express.Router();
module.exports = backendStoreHttpRequestServer;


backendStoreHttpRequestServer.get('/selectAllStoreMessage', async (httpRequest, httpResponse) => {
  const selectAllStoreMessageResult = await storeManagementFunctions.selectAllStoreMessage();
  httpResponse.end(selectAllStoreMessageResult);
});

backendStoreHttpRequestServer.post('/selectStoreMessageByStoreMessageStoreName', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const storeMessageStoreName = httpRequestQuery.storeMessageStoreName;
  const selectStoreMessageByStoreMessageStoreNameResult = await storeManagementFunctions.selectStoreMessageByStoreMessageStoreName(storeMessageStoreName);
  httpResponse.end(selectStoreMessageByStoreMessageStoreNameResult);
});

backendStoreHttpRequestServer.post('/insertStoreMessage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const storeMessageStoreName = httpRequestQuery.storeMessageStoreName;
  const storeMessageRecipientPhoneNumber = httpRequestQuery.storeMessageRecipientPhoneNumber;
  const storeMessageRecipientProfileName = httpRequestQuery.storeMessageRecipientProfileName;
  const storeMessageRecipientOrder = httpRequestQuery.storeMessageRecipientOrder;
  const storeMessageRecipientID = httpRequestQuery.storeMessageRecipientID;
  const insertStoreMessageResult = await storeManagementFunctions.insertStoreMessage(websocketConnection, storeMessageStoreName, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, storeMessageRecipientOrder, storeMessageRecipientID);
  httpResponse.end(insertStoreMessageResult);
});


backendStoreHttpRequestServer.post('/grabStoreConversation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const storeMessageID = httpRequestQuery.storeMessageID;
  const storeMessageStoreMessageID = httpRequestQuery.storeMessageStoreMessageID;
  const storeMessageStoreName = httpRequestQuery.storeMessageStoreName;
  const storeMessageAssignedAgentID = httpRequestQuery.storeMessageAssignedAgentID;
  const storeMessageRecipientPhoneNumber = httpRequestQuery.storeMessageRecipientPhoneNumber;
  const storeMessageRecipientProfileName = httpRequestQuery.storeMessageRecipientProfileName;
  const messageToClientContent = httpRequestQuery.messageToClientContent;
  const grabStoreConversationResult = await storeManagementFunctions.grabStoreConversation(websocketConnection, storeMessageID, storeMessageStoreMessageID, storeMessageStoreName, storeMessageAssignedAgentID, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, messageToClientContent);
  httpResponse.end(grabStoreConversationResult);
});

backendStoreHttpRequestServer.post('/deleteStoreMessage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const storeMessageID = httpRequestQuery.storeMessageID;
  const storeMessageStoreMessageID = httpRequestQuery.storeMessageStoreMessageID;
  const storeMessageStoreName = httpRequestQuery.storeMessageStoreName;
  const storeMessageAssignedAgentID = httpRequestQuery.storeMessageAssignedAgentID;
  const storeMessageDeleteReason = httpRequestQuery.storeMessageDeleteReason;
  const deleteStoreMessageResult = await storeManagementFunctions.deleteStoreMessage(websocketConnection, storeMessageID, storeMessageStoreMessageID, storeMessageStoreName, storeMessageAssignedAgentID, storeMessageDeleteReason);
  httpResponse.end(deleteStoreMessageResult);
});
