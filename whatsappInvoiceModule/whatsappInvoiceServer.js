// INTERNAL MODULES IMPORT
const websocketConnection = require('../websocketModule/websocketManagementFunctions.js');
const whatsappInvoiceManagementFunctions = require('./whatsappInvoiceManagementFunctions.js');

// HTTP REQUEST WHATSAPP SERVER SETUP
const express = require('express');
const backendWhatsappInvoiceHttpRequestServer = express.Router();
module.exports = backendWhatsappInvoiceHttpRequestServer;


backendWhatsappInvoiceHttpRequestServer.post('/insertWhatsappInvoice', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceWhatsappConversationID = httpRequestQuery.whatsappInvoiceWhatsappConversationID;
  const whatsappInvoiceLocalityID = httpRequestQuery.whatsappInvoiceLocalityID;
  const whatsappInvoiceAgentID = httpRequestQuery.whatsappInvoiceAgentID;
  const whatsappInvoiceState = httpRequestQuery.whatsappInvoiceState;
  const whatsappInvoiceCentralDateTime = new Date().toString();
  const whatsappInvoiceClientName = httpRequestQuery.whatsappInvoiceClientName;
  const whatsappInvoiceClientPhoneNumber = httpRequestQuery.whatsappInvoiceClientPhoneNumber;
  const whatsappInvoiceClientLocation = httpRequestQuery.whatsappInvoiceClientLocation;
  const whatsappInvoiceClientLocationURL = httpRequestQuery.whatsappInvoiceClientLocationURL;
  const whatsappInvoiceAmount = httpRequestQuery.whatsappInvoiceAmount;
  const whatsappInvoiceShippingMethod = httpRequestQuery.whatsappInvoiceShippingMethod;
  const whatsappInvoicePaymentMethod = httpRequestQuery.whatsappInvoicePaymentMethod;
  const whatsappInvoicePaymentState = httpRequestQuery.whatsappInvoicePaymentState;
  const whatsappInvoiceLocationNote = httpRequestQuery.whatsappInvoiceLocationNote;
  const whatsappInvoiceShippingNote = httpRequestQuery.whatsappInvoiceShippingNote;
  const whatsappInvoiceProducts = httpRequestQuery.whatsappInvoiceProducts;
  const insertWhatsappInvoiceResult = await whatsappInvoiceManagementFunctions.insertWhatsappInvoice(whatsappInvoiceWhatsappConversationID, whatsappInvoiceLocalityID, whatsappInvoiceAgentID, whatsappInvoiceState, whatsappInvoiceCentralDateTime, whatsappInvoiceClientName, whatsappInvoiceClientPhoneNumber, whatsappInvoiceClientLocation, whatsappInvoiceClientLocationURL, whatsappInvoiceAmount, whatsappInvoiceShippingMethod, whatsappInvoicePaymentMethod, whatsappInvoicePaymentState, whatsappInvoiceLocationNote, whatsappInvoiceShippingNote, whatsappInvoiceProducts);
  httpResponse.end(insertWhatsappInvoiceResult);
});


backendWhatsappInvoiceHttpRequestServer.post('/selectAllActiveWhatsappInvoice', async (httpRequest, httpResponse) => {
  const selectAllActiveWhatsappInvoiceResult = await whatsappInvoiceManagementFunctions.selectAllActiveWhatsappInvoice();
  httpResponse.end(selectAllActiveWhatsappInvoiceResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/selectAllActiveWhatsappInvoiceFromLocality', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const localityID = httpRequestQuery.localityID;
  const selectAllActiveWhatsappInvoiceFromLocalityResult = await whatsappInvoiceManagementFunctions.selectAllActiveWhatsappInvoiceFromLocality(localityID);
  httpResponse.end(selectAllActiveWhatsappInvoiceFromLocalityResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/selectAllActiveWhatsappInvoiceFromLocalityAgent', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const localityAgentID = httpRequestQuery.localityAgentID;
  const selectAllActiveWhatsappInvoiceFromLocalityAgentResult = await whatsappInvoiceManagementFunctions.selectAllActiveWhatsappInvoiceFromLocalityAgent(localityAgentID);
  httpResponse.end(selectAllActiveWhatsappInvoiceFromLocalityAgentResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/insertLocalityAgentLocation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const localityAgentLocationLocalityAgentID = httpRequestQuery.localityAgentLocationLocalityAgentID;
  const localityAgentLocationLatitude = httpRequestQuery.localityAgentLocationLatitude;
  const localityAgentLocationLongitude = httpRequestQuery.localityAgentLocationLongitude;
  const insertLocalityAgentLocationResult = await whatsappInvoiceManagementFunctions.insertLocalityAgentLocation(localityAgentLocationLocalityAgentID, localityAgentLocationLatitude, localityAgentLocationLongitude);
  httpResponse.end(insertLocalityAgentLocationResult);
});


backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceState', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceState = httpRequestQuery.whatsappInvoiceState;
  const whatsappInvoiceStateDateTime = new Date().toString();
  const whatsappInvoiceLocalityID = httpRequestQuery.whatsappInvoiceLocalityID;
  const whatsappInvoiceLocalityAgentID = httpRequestQuery.whatsappInvoiceLocalityAgentID;
  const returnedFromShippingToLocality = httpRequestQuery.returnedFromShippingToLocality;
  const whatsappInvoiceNotShippedReason = httpRequestQuery.whatsappInvoiceNotShippedReason;
  const updateWhatsappInvoiceStateResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceState(whatsappInvoiceID, whatsappInvoiceState, whatsappInvoiceStateDateTime, whatsappInvoiceLocalityID, whatsappInvoiceLocalityAgentID, returnedFromShippingToLocality, whatsappInvoiceNotShippedReason);
  httpResponse.end(updateWhatsappInvoiceStateResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceHasBeenBilled', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceHasBeenBilled = httpRequestQuery.whatsappInvoiceHasBeenBilled;
  const updateWhatsappInvoiceHasBeenBilledResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceHasBeenBilled(whatsappInvoiceID, whatsappInvoiceHasBeenBilled);
  httpResponse.end(updateWhatsappInvoiceHasBeenBilledResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceClientName', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceClientName = httpRequestQuery.whatsappInvoiceClientName;
  const updateWhatsappInvoiceClientNameResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceClientName(whatsappInvoiceID, whatsappInvoiceClientName);
  httpResponse.end(updateWhatsappInvoiceClientNameResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceClientPhoneNumber', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceClientPhoneNumber = httpRequestQuery.whatsappInvoiceClientPhoneNumber;
  const updateWhatsappInvoiceClientPhoneNumberResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceClientPhoneNumber(whatsappInvoiceID, whatsappInvoiceClientPhoneNumber);
  httpResponse.end(updateWhatsappInvoiceClientPhoneNumberResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceAmount', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceAmount = httpRequestQuery.whatsappInvoiceAmount;
  const updateWhatsappInvoiceAmountResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceAmount(whatsappInvoiceID, whatsappInvoiceAmount);
  httpResponse.end(updateWhatsappInvoiceAmountResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceAgentID', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceAgentID = httpRequestQuery.whatsappInvoiceAgentID;
  const updateWhatsappInvoiceAgentIDResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceAgentID(whatsappInvoiceID, whatsappInvoiceAgentID);
  httpResponse.end(updateWhatsappInvoiceAgentIDResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceLocalityAgentID', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceLocalityAgentID = httpRequestQuery.whatsappInvoiceLocalityAgentID;
  const whatsappInvoiceShippingDateTime = new Date().toString();
  const updateWhatsappInvoiceLocalityAgentIDResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceLocalityAgentID(whatsappInvoiceID, whatsappInvoiceLocalityAgentID, whatsappInvoiceShippingDateTime);
  httpResponse.end(updateWhatsappInvoiceLocalityAgentIDResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceLocalityID', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceLocalityID = httpRequestQuery.whatsappInvoiceLocalityID;
  const whatsappInvoiceLocalityAgentID = null;
  const updateWhatsappInvoiceLocalityIDResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceLocalityID(whatsappInvoiceID, whatsappInvoiceLocalityID, whatsappInvoiceLocalityAgentID);
  console.log(updateWhatsappInvoiceLocalityIDResult);
  httpResponse.end(updateWhatsappInvoiceLocalityIDResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceShippingMethod', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceShippingMethod = httpRequestQuery.whatsappInvoiceShippingMethod;
  const whatsappInvoiceLocalityAgentID = null;
  const updateWhatsappInvoiceShippingMethodResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceShippingMethod(whatsappInvoiceID, whatsappInvoiceShippingMethod, whatsappInvoiceLocalityAgentID);
  httpResponse.end(updateWhatsappInvoiceShippingMethodResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoicePaymentMethod', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoicePaymentMethod = httpRequestQuery.whatsappInvoicePaymentMethod;
  const updateWhatsappInvoicePaymentMethodResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoicePaymentMethod(whatsappInvoiceID, whatsappInvoicePaymentMethod);
  httpResponse.end(updateWhatsappInvoicePaymentMethodResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoicePaymentState', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoicePaymentState = httpRequestQuery.whatsappInvoicePaymentState;
  const updateWhatsappInvoicePaymentStateResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoicePaymentState(whatsappInvoiceID, whatsappInvoicePaymentState);
  httpResponse.end(updateWhatsappInvoicePaymentStateResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceClientLocation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceClientLocation = httpRequestQuery.whatsappInvoiceClientLocation;
  const whatsappInvoiceLocationID = httpRequestQuery.whatsappInvoiceLocationID;
  const updateWhatsappInvoiceClientLocationResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceClientLocation(whatsappInvoiceID, whatsappInvoiceClientLocation, whatsappInvoiceLocationID);
  httpResponse.end(updateWhatsappInvoiceClientLocationResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceClientLocationURL', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceClientLocationURL = httpRequestQuery.whatsappInvoiceClientLocationURL;
  const updateWhatsappInvoiceClientLocationURLResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceClientLocationURL(whatsappInvoiceID, whatsappInvoiceClientLocationURL);
  httpResponse.end(updateWhatsappInvoiceClientLocationURLResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceLocationNote', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceLocationNote = httpRequestQuery.whatsappInvoiceLocationNote;
  const updateWhatsappInvoiceLocationNoteResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceLocationNote(whatsappInvoiceID, whatsappInvoiceLocationNote);
  httpResponse.end(updateWhatsappInvoiceLocationNoteResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/updateWhatsappInvoiceShippingNote', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const whatsappInvoiceShippingNote = httpRequestQuery.whatsappInvoiceShippingNote;
  const updateWhatsappInvoiceShippingNoteResult = await whatsappInvoiceManagementFunctions.updateWhatsappInvoiceShippingNote(whatsappInvoiceID, whatsappInvoiceShippingNote);
  httpResponse.end(updateWhatsappInvoiceShippingNoteResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/selectWhatsappInvoiceLocations', async (httpRequest, httpResponse) => {
  const selectWhatsappInvoiceLocationsResult = await whatsappInvoiceManagementFunctions.selectWhatsappInvoiceLocations();
  httpResponse.end(selectWhatsappInvoiceLocationsResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/insertWhatsappInvoiceLocation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceLocationLocation = httpRequestQuery.whatsappInvoiceLocationLocation;
  const whatsappInvoiceLocationName = httpRequestQuery.whatsappInvoiceLocationName;
  const insertWhatsappInvoiceLocationResult = await whatsappInvoiceManagementFunctions.insertWhatsappInvoiceLocation(whatsappInvoiceLocationName, whatsappInvoiceLocationLocation);
  httpResponse.end(insertWhatsappInvoiceLocationResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/selectLocalityAgentNames', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const localityAgentLocalityID = httpRequestQuery.localityAgentLocalityID;
  const selectLocalityAgentNamesResult = await whatsappInvoiceManagementFunctions.selectLocalityAgentNames(localityAgentLocalityID);
  httpResponse.end(selectLocalityAgentNamesResult);
});





backendWhatsappInvoiceHttpRequestServer.post('/localityAgentLogin', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const localityAgentUsername = httpRequestQuery.localityAgentUsername;
  const localityAgentPassword = httpRequestQuery.localityAgentPassword;
  const localityAgentLoginResult = await whatsappInvoiceManagementFunctions.localityAgentLogin(localityAgentUsername, localityAgentPassword);
  httpResponse.end(localityAgentLoginResult);
});


backendWhatsappInvoiceHttpRequestServer.post('/selectTodayLocalityAgentShippedInvoices', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceLocalityAgentID = httpRequestQuery.whatsappInvoiceLocalityAgentID;
  const selectTodayLocalityAgentShippedInvoicesResult = await whatsappInvoiceManagementFunctions.selectTodayLocalityAgentShippedInvoices(whatsappInvoiceLocalityAgentID);
  httpResponse.end(selectTodayLocalityAgentShippedInvoicesResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/selectTodayDeliveredInvoicesByLocality', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceLocalityID = httpRequestQuery.whatsappInvoiceLocalityID;
  const selectTodayDeliveredInvoicesByLocalityResult = await whatsappInvoiceManagementFunctions.selectTodayDeliveredInvoicesByLocality(whatsappInvoiceLocalityID);
  httpResponse.end(selectTodayDeliveredInvoicesByLocalityResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/selectTodayCanceledInvoicesByLocality', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceLocalityID = httpRequestQuery.whatsappInvoiceLocalityID;
  const selectTodayCanceledInvoicesByLocalityResult = await whatsappInvoiceManagementFunctions.selectTodayCanceledInvoicesByLocality(whatsappInvoiceLocalityID);
  httpResponse.end(selectTodayCanceledInvoicesByLocalityResult);
});

backendWhatsappInvoiceHttpRequestServer.post('/selectTodayInvoicesByLocalityAgent', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappInvoiceLocalityID = httpRequestQuery.whatsappInvoiceLocalityID;
  const selectTodayInvoicesByLocalityAgentResult = await whatsappInvoiceManagementFunctions.selectTodayInvoicesByLocalityAgent(whatsappInvoiceLocalityID);
  httpResponse.end(selectTodayInvoicesByLocalityAgentResult);
});





backendWhatsappInvoiceHttpRequestServer.post('/returnWhatsappConversation', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationRecipientPhoneNumber = httpRequestQuery.whatsappConversationRecipientPhoneNumber;
  const whatsappConversationID = httpRequestQuery.whatsappConversationID;
  const whatsappInvoiceID = httpRequestQuery.whatsappInvoiceID;
  const returnWhatsappConversationResult = await whatsappInvoiceManagementFunctions.returnWhatsappConversation(whatsappConversationRecipientPhoneNumber, whatsappConversationID, whatsappInvoiceID);
  httpResponse.end(returnWhatsappConversationResult);
});