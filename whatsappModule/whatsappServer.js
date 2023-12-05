// INTERNAL MODULES IMPORT
const websocketConnection = require('../websocketModule/websocketManagementFunctions.js');
const whatsappManagementFunctions = require('./whatsappManagementFunctions.js');

// EXTERNAL MODULES IMPORT
const url = require('url');

// HTTP REQUEST WHATSAPP SERVER SETUP
const express = require('express');
const backendWhatsappHttpRequestServer = express.Router();
module.exports = backendWhatsappHttpRequestServer;


backendWhatsappHttpRequestServer.get('/webhookConnection', async (httpRequest, httpResponse) => {
  httpResponse.end(url.parse(httpRequest.url,true).query['hub.challenge']);
});

backendWhatsappHttpRequestServer.post('/webhookConnection', async (httpRequest, httpResponse) => {
  try {
    if (httpRequest.body['entry'][0]['changes'][0]['value']['messages']){
      const receiveWhatsappMessageResponse = await whatsappManagementFunctions.receiveWhatsappMessage(websocketConnection, httpRequest);
      httpResponse.end(receiveWhatsappMessageResponse);
    }
  } catch (error) {
    console.log(error);
  }
});

backendWhatsappHttpRequestServer.post('/sendWhatsappTextMessage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationRecipientPhoneNumber = httpRequestQuery.whatsappConversationRecipientPhoneNumber;
  const whatsappGeneralMessageRepliedMessageID = httpRequestQuery.whatsappGeneralMessageRepliedMessageID;
  const whatsappTextMessageBody = httpRequestQuery.whatsappTextMessageBody;
  const sendWhatsappTextMessageResult = await whatsappManagementFunctions.sendWhatsappTextMessage(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappGeneralMessageRepliedMessageID, whatsappTextMessageBody);
  httpResponse.end(sendWhatsappTextMessageResult);
});

backendWhatsappHttpRequestServer.get('/sendWhatsappTextMessage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = url.parse(httpRequest.url,true).query;
  const whatsappConversationRecipientPhoneNumber = httpRequestQuery.whatsappConversationRecipientPhoneNumber;
  const whatsappGeneralMessageRepliedMessageID = httpRequestQuery.whatsappGeneralMessageRepliedMessageID;
  const whatsappTextMessageBody = httpRequestQuery.whatsappTextMessageBody;
  const sendWhatsappTextMessageResult = await whatsappManagementFunctions.sendWhatsappTextMessage(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappGeneralMessageRepliedMessageID, whatsappTextMessageBody);
  httpResponse.end(sendWhatsappTextMessageResult);
});


backendWhatsappHttpRequestServer.post('/sendWhatsappTextMessageFromContactList', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationRecipientPhoneNumber = httpRequestQuery.whatsappConversationRecipientPhoneNumber;
  const whatsappConversationRecipientProfileName = httpRequestQuery.whatsappConversationRecipientProfileName;
  const whatsappConversationAssignedAgentID = httpRequestQuery.whatsappConversationAssignedAgentID;
  const whatsappTextMessageBody = httpRequestQuery.whatsappTextMessageBody;
  const sendWhatsappTextMessageFromContactListResult = await whatsappManagementFunctions.sendWhatsappTextMessageFromContactList(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName, whatsappConversationAssignedAgentID, whatsappTextMessageBody);
  httpResponse.end(sendWhatsappTextMessageFromContactListResult);
});

backendWhatsappHttpRequestServer.post('/sendWhatsappLocationMessage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationRecipientPhoneNumber = httpRequestQuery.whatsappConversationRecipientPhoneNumber;
  const whatsappGeneralMessageRepliedMessageID = httpRequestQuery.whatsappGeneralMessageRepliedMessageID;
  const whatsappLocationMessageLatitude = httpRequestQuery.whatsappLocationMessageLatitude;
  const whatsappLocationMessageLongitude = httpRequestQuery.whatsappLocationMessageLongitude;
  const sendWhatsappLocationMessageResult = await whatsappManagementFunctions.sendWhatsappLocationMessage(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappGeneralMessageRepliedMessageID, whatsappLocationMessageLatitude, whatsappLocationMessageLongitude);
  httpResponse.end(sendWhatsappLocationMessageResult);
});

backendWhatsappHttpRequestServer.post('/sendWhatsappImageMessage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationRecipientPhoneNumber = httpRequestQuery.whatsappConversationRecipientPhoneNumber;
  const whatsappGeneralMessageRepliedMessageID = httpRequestQuery.whatsappGeneralMessageRepliedMessageID;
  const whatsappImageMessageFile = httpRequestQuery.whatsappImageMessageFile.split('base64,')[1];
  const whatsappImageMessageCaption = httpRequestQuery.whatsappImageMessageCaption;
  const sendWhatsappImageMessageResult = await whatsappManagementFunctions.sendWhatsappImageMessage(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappGeneralMessageRepliedMessageID, whatsappImageMessageFile, whatsappImageMessageCaption);
  httpResponse.end(sendWhatsappImageMessageResult);
});

backendWhatsappHttpRequestServer.post('/sendWhatsappAudioMessage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationRecipientPhoneNumber = httpRequestQuery.whatsappConversationRecipientPhoneNumber;
  const whatsappGeneralMessageRepliedMessageID = httpRequestQuery.whatsappGeneralMessageRepliedMessageID;
  const whatsappAudioMessageFile = httpRequestQuery.whatsappAudioMessageFile;
  const sendWhatsappAudioMessageResult = await whatsappManagementFunctions.sendWhatsappAudioMessage(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappGeneralMessageRepliedMessageID, whatsappAudioMessageFile);
  httpResponse.end(sendWhatsappAudioMessageResult);
});

backendWhatsappHttpRequestServer.post('/sendWhatsappFavoriteImageMessage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationRecipientPhoneNumber = httpRequestQuery.whatsappConversationRecipientPhoneNumber;
  const whatsappFavoriteImageMessageContent = httpRequestQuery.whatsappFavoriteImageMessageContent;
  const whatsappFavoriteImageMessageCaption = httpRequestQuery.whatsappFavoriteImageMessageCaption;
  const sendWhatsappFavoriteImageMessageResult = await whatsappManagementFunctions.sendWhatsappFavoriteImageMessage(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappFavoriteImageMessageContent, whatsappFavoriteImageMessageCaption);
  httpResponse.end(sendWhatsappFavoriteImageMessageResult);
});

backendWhatsappHttpRequestServer.post('/sendWhatsappProductImageMessage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationRecipientPhoneNumber = httpRequestQuery.whatsappConversationRecipientPhoneNumber;
  const whatsappProductImageMessageURL = httpRequestQuery.whatsappProductImageMessageURL;
  const whatsappProductImageMessageCaption = httpRequestQuery.whatsappProductImageMessageCaption;
  const sendWhatsappProductImageMessageResult = await whatsappManagementFunctions.sendWhatsappProductImageMessage(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappProductImageMessageURL, whatsappProductImageMessageCaption);
  httpResponse.end(sendWhatsappProductImageMessageResult);
});


backendWhatsappHttpRequestServer.get('/selectAllWhatsappPendingConversation', async (httpRequest, httpResponse) => {
  const selectAllPendingConversationResult = await whatsappManagementFunctions.selectAllWhatsappPendingConversation();
  httpResponse.end(selectAllPendingConversationResult)
});

backendWhatsappHttpRequestServer.post('/grabWhatsappPendingConversation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationID = httpRequestQuery.whatsappConversationID;
  const whatsappConversationAssignedAgentID = httpRequestQuery.whatsappConversationAssignedAgentID;
  const whatsappConversationRecipientPhoneNumber = httpRequestQuery.whatsappConversationRecipientPhoneNumber;
  const whatsappTextMessageBody = httpRequestQuery.whatsappTextMessageBody;
  const grabWhatsappPendingConversationResult = await whatsappManagementFunctions.grabWhatsappPendingConversation(websocketConnection, whatsappConversationID, whatsappConversationAssignedAgentID, whatsappConversationRecipientPhoneNumber, whatsappTextMessageBody);
  httpResponse.end(grabWhatsappPendingConversationResult);
});

backendWhatsappHttpRequestServer.post('/closeWhatsappConversation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationRecipientPhoneNumber = httpRequestQuery.whatsappConversationRecipientPhoneNumber;
  const whatsappConversationCloseComment = httpRequestQuery.whatsappConversationCloseComment;
  const whatsappConversationAmount = httpRequestQuery.whatsappConversationAmount;
  const whatsappConversationProducts = httpRequestQuery.whatsappConversationProducts;
  const whatsappTextMessageBody = httpRequestQuery.whatsappTextMessageBody;
  const closeWhatsappConversationResult = await whatsappManagementFunctions.closeWhatsappConversation(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappConversationCloseComment, whatsappConversationAmount, whatsappConversationProducts, whatsappTextMessageBody);
  httpResponse.end(closeWhatsappConversationResult);
});

backendWhatsappHttpRequestServer.post('/requestTransferWhatsappConversation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const currentAgentName = httpRequestQuery.currentAgentName;
  const currentAgentID = httpRequestQuery.currentAgentID;
  const newAgentID = httpRequestQuery.newAgentID;
  const whatsappConversationID = httpRequestQuery.whatsappConversationID;
  const whatsappConversationProducts = httpRequestQuery.whatsappConversationProducts;
  const requestTransferWhatsappConversationResult = await whatsappManagementFunctions.requestTransferWhatsappConversation(websocketConnection, currentAgentID, currentAgentName, newAgentID, whatsappConversationID, whatsappConversationProducts);
  httpResponse.end(requestTransferWhatsappConversationResult); 
});

backendWhatsappHttpRequestServer.post('/acceptTransferWhatsappConversation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const currentAgentID = httpRequestQuery.currentAgentID;
  const newAgentID = httpRequestQuery.newAgentID;
  const whatsappConversationID = httpRequestQuery.whatsappConversationID;
  const acceptTransferWhatsappConversationResult = await whatsappManagementFunctions.acceptTransferWhatsappConversation(websocketConnection, currentAgentID, newAgentID, whatsappConversationID);
  httpResponse.end(acceptTransferWhatsappConversationResult); 
});

backendWhatsappHttpRequestServer.post('/selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumber', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationRecipientPhoneNumber = httpRequestQuery.whatsappConversationRecipientPhoneNumber;
  const selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberResult = await whatsappManagementFunctions.selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumber(whatsappConversationRecipientPhoneNumber);
  console.log(selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberResult);
  httpResponse.end(selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberResult); 
});
