// INTERNAL MODULES IMPORT
const websocketConnection = require('../websocketModule/websocketManagementFunctions.js');
const dashboardManagementFunctions = require('./dashboardManagementFunctions.js');

// HTTP REQUEST WHATSAPP SERVER SETUP
const express = require('express');
const backendDashboardHttpRequestServer = express.Router();
module.exports = backendDashboardHttpRequestServer;

backendDashboardHttpRequestServer.get('/selectAllActiveConversationBasicInformation', async (httpRequest, httpResponse) => {
  const selectAllActiveConversationBasicInformationResult = await dashboardManagementFunctions.selectAllActiveConversationBasicInformation();
  httpResponse.end(selectAllActiveConversationBasicInformationResult);
});


backendDashboardHttpRequestServer.get('/selectTodayDashboardInformation', async (httpRequest, httpResponse) => {
  const selectTodayDashboardInformationResult = await dashboardManagementFunctions.selectTodayDashboardInformation();
  httpResponse.end(selectTodayDashboardInformationResult);
});


backendDashboardHttpRequestServer.get('/selectAgentNames', async (httpRequest, httpResponse) => {
  const selectAgentNamesResult = await dashboardManagementFunctions.selectAgentNames();
  httpResponse.end(selectAgentNamesResult);
});

backendDashboardHttpRequestServer.get('/selectTransferableAgents', async (httpRequest, httpResponse) => {
  const selectTransferableAgentNamesResult = await dashboardManagementFunctions.selectTransferableAgentNames();
  httpResponse.end(selectTransferableAgentNamesResult);
});

backendDashboardHttpRequestServer.post('/selectFilteredConversations', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const initialDate = httpRequestQuery.initialDateFiltered;
  const endDate = httpRequestQuery.endDateFiltered;
  const recipientPhoneNumber = httpRequestQuery.numberFiltered;
  const agentName = httpRequestQuery.agentFiltered;
  const store = httpRequestQuery.storeFiltered;
  const conversation = httpRequestQuery.conversionFiltered;
  const selectAgentNamesResult = await dashboardManagementFunctions.selectFilteredConversations(initialDate, endDate, recipientPhoneNumber, agentName, store, conversation);
  httpResponse.end(selectAgentNamesResult);
});

backendDashboardHttpRequestServer.post('/selectRankingFilteredConversations', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const agentID = httpRequestQuery.agentID;
  const initialDate = httpRequestQuery.initialDate;
  const endDate = httpRequestQuery.endDate;
  const selectRankingFilteredConversationsResult = await dashboardManagementFunctions.selectRankingFilteredConversations(agentID, initialDate, endDate);
  httpResponse.end(selectRankingFilteredConversationsResult);
});

backendDashboardHttpRequestServer.post('/selectPlotInformation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const plotType = httpRequestQuery.plotType;
  const initialDate = httpRequestQuery.initialDate;
  const endDate = httpRequestQuery.endDate;
  const agents = httpRequestQuery.agents;
  const stores = httpRequestQuery.stores;
  if (plotType == 4){
    const selectPlotConnectionInformationResult = await dashboardManagementFunctions.selectPlotConnectionInformation(initialDate, endDate, agents);
    httpResponse.end(selectPlotConnectionInformationResult);
  } else {
    const selectPlotInformationResult = await dashboardManagementFunctions.selectPlotInformation(plotType, initialDate, endDate, agents, stores);
    httpResponse.end(selectPlotInformationResult);
  }
});

backendDashboardHttpRequestServer.post('/selectAllWhatsappFavoriteImages', async (httpRequest, httpResponse) => {
  const selectAllWhatsappFavoriteImagesResult = await dashboardManagementFunctions.selectAllWhatsappFavoriteImages();
  httpResponse.end(selectAllWhatsappFavoriteImagesResult);
});



backendDashboardHttpRequestServer.post('/selectTodayConversationsByLocalityNameAndType', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationLocalityName = httpRequestQuery.whatsappConversationLocalityName;
  const whatsappConversationType = httpRequestQuery.whatsappConversationType;
  const selectTodayConversationsByLocalityNameAndCloseCommentResult = await dashboardManagementFunctions.selectTodayConversationsByLocalityNameAndType(whatsappConversationLocalityName, whatsappConversationType);
  httpResponse.end(selectTodayConversationsByLocalityNameAndCloseCommentResult);
});





backendDashboardHttpRequestServer.post('/insertWhatsappConversationTextComment', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationTextCommentWhatsappConversationID = httpRequestQuery.whatsappConversationTextCommentWhatsappConversationID;
  const whatsappConversationTextCommentBody = httpRequestQuery.whatsappConversationTextCommentBody;
  const insertWhatsappConversationTextCommentResult = await dashboardManagementFunctions.insertWhatsappConversationTextComment(websocketConnection, whatsappConversationTextCommentWhatsappConversationID, whatsappConversationTextCommentBody);
  httpResponse.end(insertWhatsappConversationTextCommentResult);
});

backendDashboardHttpRequestServer.post('/insertWhatsappConversationAudioComment', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationAudioCommentWhatsappConversationID = httpRequestQuery.whatsappConversationAudioCommentWhatsappConversationID;
  const whatsappConversationAudioCommentFile = httpRequestQuery.whatsappConversationAudioCommentFile.split(',')[1];
  const insertWhatsappConversationAudioCommentResult = await dashboardManagementFunctions.insertWhatsappConversationAudioComment(websocketConnection, whatsappConversationAudioCommentWhatsappConversationID, whatsappConversationAudioCommentFile);
  httpResponse.end(insertWhatsappConversationAudioCommentResult);
});

backendDashboardHttpRequestServer.post('/insertWhatsappConversationProductComment', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationProductCommentWhatsappConversationID = httpRequestQuery.whatsappConversationProductCommentWhatsappConversationID;
  const whatsappConversationProductCommentName = httpRequestQuery.whatsappConversationProductCommentName;
  const whatsappConversationProductCommentSKU = httpRequestQuery.whatsappConversationProductCommentSKU;
  const whatsappConversationProductCommentImageURL = httpRequestQuery.whatsappConversationProductCommentImageURL;
  const insertWhatsappConversationProductCommentResult = await dashboardManagementFunctions.insertWhatsappConversationProductComment(websocketConnection, whatsappConversationProductCommentWhatsappConversationID, whatsappConversationProductCommentName, whatsappConversationProductCommentSKU, whatsappConversationProductCommentImageURL);
  httpResponse.end(insertWhatsappConversationProductCommentResult);
});

backendDashboardHttpRequestServer.post('/updateWhatsappConversationCommentSeenDateTime', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationCommentID = httpRequestQuery.whatsappConversationCommentID;
  const updateWhatsappConversationCommentSeenDateTimeResult = await dashboardManagementFunctions.updateWhatsappConversationCommentSeenDateTime(whatsappConversationCommentID);
  httpResponse.end(updateWhatsappConversationCommentSeenDateTimeResult);
});




backendDashboardHttpRequestServer.post('/selectWhatsappConversationComments', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationID = httpRequestQuery.whatsappConversationID;
  const selectWhatsappConversationCommentsResult = await dashboardManagementFunctions.selectWhatsappConversationComments(whatsappConversationID);
  httpResponse.end(selectWhatsappConversationCommentsResult);
});