// INTERNAL MODULES IMPORT
const websocketConnection = require('../websocketModule/websocketManagementFunctions.js');
const paymentManagementFunctions = require('./paymentManagementFunctions.js');

// HTTP REQUEST WHATSAPP SERVER SETUP
const express = require('express');
const backendPaymentHttpRequestServer = express.Router();
module.exports = backendPaymentHttpRequestServer;

backendPaymentHttpRequestServer.post('/localityLogin', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const localityUsername = httpRequestQuery.localityUsername;
  const localityPassword = httpRequestQuery.localityPassword;
  const localityLoginResult = await paymentManagementFunctions.localityLogin(localityUsername, localityPassword);
  httpResponse.end(localityLoginResult);
});

backendPaymentHttpRequestServer.post('/selectNotUsedTransactions', async (httpRequest, httpResponse) => {
  const selectNotUsedTransactionsResult = await paymentManagementFunctions.selectNotUsedTransactions();
  httpResponse.end(selectNotUsedTransactionsResult);
});

backendPaymentHttpRequestServer.post('/selectLocalityAgents', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const localityAgentLocalityID = httpRequestQuery.localityAgentLocalityID;
  const selectLocalityAgentsResult = await paymentManagementFunctions.selectLocalityAgents(localityAgentLocalityID);
  httpResponse.end(selectLocalityAgentsResult);
});

backendPaymentHttpRequestServer.post('/syncTransaction', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const transactionID = httpRequestQuery.transactionID;
  const transactionStore = httpRequestQuery.transactionStore;
  const transactionApprover = httpRequestQuery.transactionApprover;
  const transactionRelatedMessageID = httpRequestQuery.transactionRelatedMessageID;
  const syncTransactionResult = await paymentManagementFunctions.syncTransaction(websocketConnection, transactionID, transactionStore, transactionApprover, transactionRelatedMessageID);
  httpResponse.end(syncTransactionResult);
});

backendPaymentHttpRequestServer.post('/selectLocalities', async (httpRequest, httpResponse) => {
  const selectLocalitiesResult = await paymentManagementFunctions.selectLocalities();
  httpResponse.end(selectLocalitiesResult);
});

