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