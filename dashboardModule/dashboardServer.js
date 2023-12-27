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