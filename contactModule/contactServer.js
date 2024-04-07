// INTERNAL MODULES IMPORT
const websocketConnection = require('../websocketModule/websocketManagementFunctions.js');
const contactsManagementFunctions = require('./contactManagementFunctions.js');

// HTTP REQUEST WHATSAPP SERVER SETUP
const express = require('express');
const backendContactHttpRequestServer = express.Router();
module.exports = backendContactHttpRequestServer;

backendContactHttpRequestServer.post('/insertContact', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const contactPhoneNumber = httpRequestQuery.contactPhoneNumber;
  const contactID = httpRequestQuery.contactID;
  const contactName = httpRequestQuery.contactName;
  const contactEmail = httpRequestQuery.contactEmail;
  const contactLocationDetails = httpRequestQuery.contactLocationDetails;
  const contactNote = httpRequestQuery.contactNote;
  const insertContactResult = await contactsManagementFunctions.insertContact(contactPhoneNumber, contactID, contactName, contactEmail, contactLocationDetails, contactNote);
  httpResponse.end(insertContactResult);
});

backendContactHttpRequestServer.post('/insertOrUpdateContact', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const contactPhoneNumber = httpRequestQuery.contactPhoneNumber;
  const contactID = httpRequestQuery.contactID;
  const contactName = httpRequestQuery.contactName;
  const contactEmail = httpRequestQuery.contactEmail;
  const contactLocations = JSON.stringify(httpRequestQuery.contactLocations);
  const contactLocationDetails = httpRequestQuery.contactLocationDetails;
  const contactNote = httpRequestQuery.contactNote;
  const insertOrUpdateContactResult = await contactsManagementFunctions.insertOrUpdateContact(contactPhoneNumber, contactID, contactName, contactEmail, contactLocations, contactLocationDetails, contactNote);
  httpResponse.end(insertOrUpdateContactResult);
});

backendContactHttpRequestServer.post('/updateContact', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const originalContactPhoneNumber = httpRequestQuery.originalContactPhoneNumber;
  const editedContactPhoneNumber = httpRequestQuery.editedContactPhoneNumber;
  const contactID = httpRequestQuery.contactID;
  const contactName = httpRequestQuery.contactName;
  const contactEmail = httpRequestQuery.contactEmail;
  const contactLocationDetails = httpRequestQuery.contactLocationDetails;
  const contactNote = httpRequestQuery.contactNote;
  const updateContactResult = await contactsManagementFunctions.updateContact(originalContactPhoneNumber, editedContactPhoneNumber, contactID, contactName, contactEmail, contactLocationDetails, contactNote);
  httpResponse.end(updateContactResult);
});

backendContactHttpRequestServer.post('/deleteContact', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const contactPhoneNumber = httpRequestQuery.contactPhoneNumber;
  const deleteContactResult = await contactsManagementFunctions.deleteContact(contactPhoneNumber);
  httpResponse.end(deleteContactResult);
});

backendContactHttpRequestServer.post('/selectContactsFromStartingLetter', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const startingLetter = httpRequestQuery.startingLetter;
  const selectContactsFromStartingLetterResult = await contactsManagementFunctions.selectContactsFromStartingLetter(startingLetter);
  httpResponse.end(selectContactsFromStartingLetterResult);
});

backendContactHttpRequestServer.post('/selectContact', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const contactPhoneNumber = httpRequestQuery.contactPhoneNumber;
  const selectContactResult = await contactsManagementFunctions.selectContact(contactPhoneNumber);
  httpResponse.end(selectContactResult);
});

backendContactHttpRequestServer.post('/verifyClient', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const clientID = httpRequestQuery.clientID;
  //const verifyClientResult = await contactsManagementFunctions.verifyClient(clientID);
  httpResponse.end(JSON.stringify({success: false}));
});

backendContactHttpRequestServer.get('/loadContact', async (httpRequest, httpResponse) => {
  const loadContactResult = await contactsManagementFunctions.loadContact();
  httpResponse.end(loadContactResult);
});

backendContactHttpRequestServer.get('/selectContactAmount', async (httpRequest, httpResponse) => {
  const selectContactAmountResult = await contactsManagementFunctions.selectContactAmount();
  httpResponse.end(selectContactAmountResult);
});


/*FEEDBACK*/

backendContactHttpRequestServer.post('/insertFeedback', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappConversationID = httpRequestQuery.whatsappConversationID;
  const answerOne = httpRequestQuery.answerOne;
  const answerTwo = httpRequestQuery.answerTwo;
  const answerThree = httpRequestQuery.answerThree;
  const answerFour = httpRequestQuery.answerFour;
  const answerFive = httpRequestQuery.answerFive;
  const answerSix = httpRequestQuery.answerSix;
  const insertFeedbackResult = await contactsManagementFunctions.insertFeedback(whatsappConversationID, answerOne, answerTwo, answerThree, answerFour, answerFive, answerSix);
  httpResponse.end(insertFeedbackResult);
});

backendContactHttpRequestServer.post('/selectNotResolvedWhatsappFeedback', async (httpRequest, httpResponse) => {
  const selectNotResolvedWhatsappFeedbackResult = await contactsManagementFunctions.selectNotResolvedWhatsappFeedback();
  httpResponse.end(selectNotResolvedWhatsappFeedbackResult);
});

backendContactHttpRequestServer.post('/updateWhatsappFeedback', async (httpRequest, httpResponse) => {
  const httpRequestQuery = httpRequest.body;
  const whatsappFeedbackID = httpRequestQuery.whatsappFeedbackID;
  const selectNotResolvedWhatsappFeedbackResult = await contactsManagementFunctions.updateWhatsappFeedback(whatsappFeedbackID);
  httpResponse.end(selectNotResolvedWhatsappFeedbackResult);
});


backendContactHttpRequestServer.get('/compress', async (httpRequest, httpResponse) => {
  console.log('START');
  const compressResult = await contactsManagementFunctions.compress();
  httpResponse.end(compressResult);
});


