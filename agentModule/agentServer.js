// INTERNAL MODULES IMPORT
const websocketConnection = require('../websocketModule/websocketManagementFunctions.js');
const agentManagementFunctions = require('./agentManagementFunctions.js');

// HTTP REQUEST WHATSAPP SERVER SETUP
const express = require('express');
const backendAgentHttpRequestServer = express.Router();
module.exports = backendAgentHttpRequestServer;


/*
  EXECUTE ROUTES
*/
backendAgentHttpRequestServer.post('/agent/login', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentUsername = httpRequestQuery.agentUsername;
  const agentPassword = httpRequestQuery.agentPassword;
  const agentLoginResult = await agentManagementFunctions.agentLogin(agentUsername, agentPassword);
  httpResponse.end(agentLoginResult);
});

backendAgentHttpRequestServer.post('/agent/logout', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentID = httpRequestQuery.agentID;
  const agentLogoutResult = await agentManagementFunctions.agentLogout(agentID);
  httpResponse.end(agentLogoutResult);
});


/*
  UPDATE ROUTES
*/
backendAgentHttpRequestServer.post('/agent/update/loginCredentials', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentID = httpRequestQuery.agentID;
  const agentUsername = httpRequestQuery.agentUsername;
  const agentPassword = httpRequestQuery.agentPassword;
  const agentProfileImageAsBase64 = httpRequestQuery.agentProfileImageAsBase64;
  const updateAgentLoginCredentialsResult = await agentManagementFunctions.updateAgentLoginCredentials(agentID, agentUsername, agentPassword, agentProfileImageAsBase64);
  httpResponse.end(updateAgentLoginCredentialsResult);
});

backendAgentHttpRequestServer.post('/agent/update/agentStatus', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentID = httpRequestQuery.agentID;
  const agentName = httpRequestQuery.agentName;
  const agentStatus = httpRequestQuery.agentStatus;
  const updateAgentStatusResult = await agentManagementFunctions.updateAgentStatus(websocketConnection, agentID, agentName, agentStatus);
  httpResponse.end(updateAgentStatusResult);
});

backendAgentHttpRequestServer.post('/agent/update/agentIsWorking', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentID = httpRequestQuery.agentID;
  const agentIsWorking = httpRequestQuery.agentIsWorking;
  const updateAgentWorkingStatusResult = await agentManagementFunctions.updateAgentWorkingStatus(agentID, agentIsWorking);
  httpResponse.end(updateAgentWorkingStatusResult);
});

backendAgentHttpRequestServer.post('/agent/update/automaticMessages', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentID = httpRequestQuery.agentID;
  const agentStartMessage = httpRequestQuery.agentStartMessage;
  const agentEndMessage = httpRequestQuery.agentEndMessage;
  const updateAgentAutomaticMessagesResult = await agentManagementFunctions.updateAgentAutomaticMessages(agentID, agentStartMessage, agentEndMessage);
  httpResponse.end(updateAgentAutomaticMessagesResult);
});

backendAgentHttpRequestServer.post('/agent/update', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentID = httpRequestQuery.agentID;
  const agentUsername = httpRequestQuery.agentUsername;
  const agentPassword = httpRequestQuery.agentPassword;
  const agentName = httpRequestQuery.agentName;
  const updateAgentFromAdminPortalResult = await agentManagementFunctions.updateAgentFromAdminPortal(agentID, agentUsername, agentPassword, agentName);
  httpResponse.end(updateAgentFromAdminPortalResult);
});


/*
  SELECT ROUTES
*/
backendAgentHttpRequestServer.get('/agent/select', async (httpRequest, httpResponse) => {
  const selectAllAgentsResult = await agentManagementFunctions.selectAgents();
  httpResponse.end(selectAllAgentsResult);
});

backendAgentHttpRequestServer.get('/selectAllAgentStatus', async (httpRequest, httpResponse) => {
  const selectAllAgentStatusResult = await agentManagementFunctions.selectAllAgentStatus();
  httpResponse.end(selectAllAgentStatusResult);
});

backendAgentHttpRequestServer.post('/selectAgentStatus', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentID = httpRequestQuery.agentID;
  const selectAgentStatusResult = await agentManagementFunctions.selectAgentStatus(agentID);
  httpResponse.end(selectAgentStatusResult);
});

backendAgentHttpRequestServer.post('/selectAgentFavoriteMessages', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentID = httpRequestQuery.agentID;
  const selectAgentFavoriteMessagesResult = await agentManagementFunctions.selectAgentFavoriteMessages(agentID);
  httpResponse.end(selectAgentFavoriteMessagesResult);
});

backendAgentHttpRequestServer.post('/insertAgentFavoriteMessage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentFavoriteMessageAgentID = httpRequestQuery.agentFavoriteMessageAgentID;
  const agentFavoriteMessageName = httpRequestQuery.agentFavoriteMessageName;
  const agentFavoriteMessageTextMessageBody = httpRequestQuery.agentFavoriteMessageTextMessageBody;
  const insertAgentFavoriteMessageResult = await agentManagementFunctions.insertAgentFavoriteMessage(agentFavoriteMessageAgentID, agentFavoriteMessageName, agentFavoriteMessageTextMessageBody);
  httpResponse.end(insertAgentFavoriteMessageResult);
});

backendAgentHttpRequestServer.post('/updateAgentFavoriteMessage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentFavoriteMessageID = httpRequestQuery.agentFavoriteMessageID;
  const agentFavoriteMessageAgentID = httpRequestQuery.agentFavoriteMessageAgentID;
  const agentFavoriteMessageTextMessageBody = httpRequestQuery.agentFavoriteMessageTextMessageBody
  const updateAgentFavoriteMessageResult = await agentManagementFunctions.updateAgentFavoriteMessage(agentFavoriteMessageID, agentFavoriteMessageAgentID, agentFavoriteMessageTextMessageBody);
  httpResponse.end(updateAgentFavoriteMessageResult);
});

backendAgentHttpRequestServer.post('/deleteAgentFavoriteMessage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentFavoriteMessageID = httpRequestQuery.agentFavoriteMessageID;
  const deleteAgentFavoriteMessageResult = await agentManagementFunctions.deleteAgentFavoriteMessage(agentFavoriteMessageID);
  httpResponse.end(deleteAgentFavoriteMessageResult);
});

backendAgentHttpRequestServer.post('/selectAgentConversations', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationAssignedAgentID = httpRequestQuery.whatsappConversationAssignedAgentID;
  const whatsappConversationIsActive = httpRequestQuery.whatsappConversationIsActive;
  const selectAgentConversationsResult = await agentManagementFunctions.selectAgentConversations(whatsappConversationAssignedAgentID, whatsappConversationIsActive);
  httpResponse.end(selectAgentConversationsResult);
});

backendAgentHttpRequestServer.post('/selectAgentComments', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationAssignedAgentID = httpRequestQuery.whatsappConversationAssignedAgentID;
  const whatsappConversationIsActive = httpRequestQuery.whatsappConversationIsActive;
  const selectAgentCommentsResult = await agentManagementFunctions.selectAgentComments(whatsappConversationAssignedAgentID, whatsappConversationIsActive);
  httpResponse.end(selectAgentCommentsResult);
});



backendAgentHttpRequestServer.post('/selectAgentConversation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationID = httpRequestQuery.whatsappConversationID;
  const selectAgentConversationResult = await agentManagementFunctions.selectAgentConversation(whatsappConversationID);
  httpResponse.end(selectAgentConversationResult);
});

backendAgentHttpRequestServer.post('/insertAgent', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentID = httpRequestQuery.agentID;
  const agentName = httpRequestQuery.agentName;
  const agentUsername = httpRequestQuery.agentUsername;
  const agentPassword = httpRequestQuery.agentPassword;
  const agentType = httpRequestQuery.agentType;
  const insertAgentResult = await agentManagementFunctions.insertAgent(agentID, agentName, agentUsername, agentPassword, agentType);
  httpResponse.end(insertAgentResult);
});

backendAgentHttpRequestServer.post('/deleteAgent', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentID = httpRequestQuery.agentID;
  const deleteAgentResult = await agentManagementFunctions.deleteAgent(agentID);
  httpResponse.end(deleteAgentResult);
});

backendAgentHttpRequestServer.post('/selectApplicationStatus', async (httpRequest, httpResponse) => {
  const selectApplicationStatusResult = await agentManagementFunctions.selectApplicationStatus();
  httpResponse.end(selectApplicationStatusResult);
});

backendAgentHttpRequestServer.post('/updateApplicationStatus', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  var active = false;
  if (httpRequestQuery.active == 'OFF'){
    active = true;
  }
  const updateApplicationStatusResult = await agentManagementFunctions.updateApplicationStatus(websocketConnection, active);
  httpResponse.end(updateApplicationStatusResult);
});


backendAgentHttpRequestServer.post('/selectFavoriteImages', async (httpRequest, httpResponse) => {
  const selectFavoriteImagesResult = await agentManagementFunctions.selectFavoriteImages();
  httpResponse.end(selectFavoriteImagesResult);
});




backendAgentHttpRequestServer.post('/rankingLogin', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const username = httpRequestQuery.username;
  const password = httpRequestQuery.password;
  if ((username == 'kv') && (password == 'kv')){
    httpResponse.end(JSON.stringify({success: true}));
  } else {
    httpResponse.end(JSON.stringify({success: false}));
  }
});

backendAgentHttpRequestServer.get('/selectPieChartInformation', async (httpRequest, httpResponse) => {
  const selectPieChartInformationResult = await agentManagementFunctions.selectPieChartInformation();
  httpResponse.end(selectPieChartInformationResult);
});

backendAgentHttpRequestServer.post('/selectFilteredPieChartInformation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const initialDate = httpRequestQuery.initialDate;
  const endDate = httpRequestQuery.endDate;
  const selectFilteredPieChartInformationResult = await agentManagementFunctions.selectFilteredPieChartInformation(initialDate, endDate);
  httpResponse.end(selectFilteredPieChartInformationResult);
});

backendAgentHttpRequestServer.get('/selectBarChartInformation', async (httpRequest, httpResponse) => {
  const selectBarChartInformationResult = await agentManagementFunctions.selectBarChartInformation();
  httpResponse.end(selectBarChartInformationResult);
});

backendAgentHttpRequestServer.post('/selectFilteredBarChartInformation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const initialDate = httpRequestQuery.initialDate;
  const endDate = httpRequestQuery.endDate;
  const selectFilteredBarChartInformationResult = await agentManagementFunctions.selectFilteredBarChartInformationResult(initialDate, endDate);
  httpResponse.end(selectFilteredBarChartInformationResult);
});

backendAgentHttpRequestServer.post('/selectTodayInformation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const initialDate = httpRequestQuery.initialDate;
  const endDate = httpRequestQuery.endDate;
  const selectBarChartInformationResult = await agentManagementFunctions.selectTodayInformation(initialDate, endDate);
  httpResponse.end(selectBarChartInformationResult);
});

backendAgentHttpRequestServer.post('/selectFilteredTodayInformation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const initialDate = httpRequestQuery.initialDate;
  const endDate = httpRequestQuery.endDate;
  const selectFilteredTodayInformationResult = await agentManagementFunctions.selectFilteredTodayInformation(initialDate, endDate);
  httpResponse.end(selectFilteredTodayInformationResult);
});

backendAgentHttpRequestServer.get('/selectTodayTopSell', async (httpRequest, httpResponse) => {
  const selectTodayTopSellResult = await agentManagementFunctions.selectTodayTopSell();
  httpResponse.end(selectTodayTopSellResult);
});

backendAgentHttpRequestServer.post('/selectFilteredTodayTopSell', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const initialDate = httpRequestQuery.initialDate;
  const endDate = httpRequestQuery.endDate;
  const selectFilteredTodayTopSellResult = await agentManagementFunctions.selectFilteredTodayTopSell(initialDate, endDate);
  httpResponse.end(selectFilteredTodayTopSellResult);
});

backendAgentHttpRequestServer.get('/selectTodayFeedbackInformation', async (httpRequest, httpResponse) => {
  const selectTodayFeedbackInformationResult = await agentManagementFunctions.selectTodayFeedbackInformation();
  httpResponse.end(selectTodayFeedbackInformationResult);
});

backendAgentHttpRequestServer.post('/selectFilteredTodayFeedbackInformation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const initialDate = httpRequestQuery.initialDate;
  const endDate = httpRequestQuery.endDate;
  const selectFilteredTodayFeedbackInformationResult = await agentManagementFunctions.selectFilteredTodayFeedbackInformation(initialDate, endDate);
  httpResponse.end(selectFilteredTodayFeedbackInformationResult);
});





backendAgentHttpRequestServer.post('/insertSticker', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const stickerAgentID = httpRequestQuery.stickerAgentID;
  const stickerName = httpRequestQuery.stickerName;
  const stickerFile = httpRequestQuery.stickerFile;
  const insertStickerResult = await agentManagementFunctions.insertSticker(stickerAgentID, stickerName, stickerFile);
  httpResponse.end(insertStickerResult);
});

backendAgentHttpRequestServer.post('/selectMissingLocalStickers', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const stickerCurrentIDS = httpRequestQuery.stickerCurrentIDS;
  const selectMissingLocalStickersResult = await agentManagementFunctions.selectMissingLocalStickers(stickerCurrentIDS);
  httpResponse.end(selectMissingLocalStickersResult);
});







backendAgentHttpRequestServer.post('/insertNotification', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const notificationAgentID = httpRequestQuery.notificationAgentID;
  const notificationName = httpRequestQuery.notificationName;
  const notificationPhoneNumber = httpRequestQuery.notificationPhoneNumber;
  const notificationDate = httpRequestQuery.notificationDate;
  const notificationHour = httpRequestQuery.notificationHour;
  const notificationDateTimeString = `${notificationDate} ${notificationHour}`;
  const notificationDateTime = new Date(notificationDateTimeString).toString();
  const insertNotificationResult = await agentManagementFunctions.insertNotification(notificationAgentID, notificationName, notificationPhoneNumber, notificationDateTime);
  httpResponse.end(insertNotificationResult);
});

backendAgentHttpRequestServer.post('/selectAgentNotifications', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const notificationAgentID = httpRequestQuery.notificationAgentID;
  const selectAgentNotificationsResult = await agentManagementFunctions.selectAgentNotifications(notificationAgentID);
  httpResponse.end(selectAgentNotificationsResult);
});

backendAgentHttpRequestServer.post('/deleteNotification', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const notificationID = httpRequestQuery.notificationID;
  const deleteNotificationResult = await agentManagementFunctions.deleteNotification(notificationID);
  httpResponse.end(deleteNotificationResult);
});

backendAgentHttpRequestServer.post('/useNotification', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const notificationID = httpRequestQuery.notificationID;
  const useNotificationResult = await agentManagementFunctions.useNotification(notificationID);
  httpResponse.end(useNotificationResult);
});

backendAgentHttpRequestServer.post('/traduceText', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const textToTraduce = httpRequestQuery.textToTraduce;
  const languageToTraduce = httpRequestQuery.languageToTraduce;
  const traduceTextResult = await agentManagementFunctions.traduceText(textToTraduce, languageToTraduce);
  httpResponse.end(traduceTextResult);
});


backendAgentHttpRequestServer.post('/updateWhatsappFavoriteImage', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappFavoriteImageID = httpRequestQuery.whatsappFavoriteImageID;
  const whatsappFavoriteImageName = httpRequestQuery.whatsappFavoriteImageName;
  const whatsappFavoriteImageFileID = httpRequestQuery.whatsappFavoriteImageFileID;
  const whatsappFavoriteImageDriveURL = httpRequestQuery.whatsappFavoriteImageDriveURL;
  const whatsappFavoriteImageCatalog = httpRequestQuery.whatsappFavoriteImageCatalog;
  const updateWhatsappFavoriteImageResult = await agentManagementFunctions.updateWhatsappFavoriteImage(whatsappFavoriteImageID, whatsappFavoriteImageName, whatsappFavoriteImageFileID, whatsappFavoriteImageDriveURL, whatsappFavoriteImageCatalog);
  httpResponse.end(updateWhatsappFavoriteImageResult); 
});