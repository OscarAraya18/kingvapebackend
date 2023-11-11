const constants = require('./constants.js');
const whatsappManagementFunctions = require('./whatsappManagementFunctions.js');
const agentsManagementFunctions = require('./agentsManagementFunctions.js');
const conversationsManagementFunctions = require('./conversationsManagementFunctions.js');
const contactsManagementFunctions = require('./contactsManagementFunctions.js');
const databaseManagementFunctions = require('./databaseManagementFunctions.js');
const websocketManagementFunctions = require('./websocketManagementFunctions.js');

const url = require('url');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const express = require('express');

const backendHttpRequestServer = express();
backendHttpRequestServer.use(cors());
backendHttpRequestServer.use(bodyParser.json({limit: '50mb'}));
backendHttpRequestServer.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const server = backendHttpRequestServer.listen(constants.backendHttpRequestServerConnectionPort);

const backendWebsocketServerConnection = new WebSocket.Server({server});


backendHttpRequestServer.post('/agentLogin', (request, response) => {
  const agentInformation = agentsManagementFunctions.agentLogin(request.body.agentUsername, request.body.agentPassword);
  const applicationDatabase = databaseManagementFunctions.readDatabase(constants.routes.applicationDatabase);
  if (agentInformation.agentID != null){
    if (applicationDatabase['applicationStatus'] == 'on'){
      response.end(JSON.stringify({'success': true, 'agentID': agentInformation.agentID, 'agentName': agentInformation.agentName, 'agentUsername': agentInformation.agentUsername, 'agentPassword': agentInformation.agentPassword, 'agentType': agentInformation.agentType, 'agentProfilePicture': agentInformation.agentProfilePicture, 'agentWelcomeMessage': agentInformation.agentWelcomeMessage, 'agentWelcomeImage': agentInformation.agentWelcomeImage, 'agentEndMessage': agentInformation.agentEndMessage, 'agentFavoriteMessages': agentInformation.agentFavoriteMessages, 'agentFavoriteImages': agentInformation.agentFavoriteImages}));
    } else {
      if (agentInformation.agentType != 'admin'){
        response.end(JSON.stringify({'success': false, 'applicationStatus': applicationDatabase['applicationStatus']}));
      } else {
        response.end(JSON.stringify({'success': true, 'agentID': agentInformation.agentID, 'agentName': agentInformation.agentName, 'agentUsername': agentInformation.agentUsername, 'agentPassword': agentInformation.agentPassword, 'agentType': agentInformation.agentType, 'agentProfilePicture': agentInformation.agentProfilePicture, 'agentWelcomeMessage': agentInformation.agentWelcomeMessage, 'agentWelcomeImage': agentInformation.agentWelcomeImage, 'agentEndMessage': agentInformation.agentEndMessage, 'agentFavoriteMessages': agentInformation.agentFavoriteMessages, 'agentFavoriteImages': agentInformation.agentFavoriteImages}));
      }
    }
  } else {
    response.end(JSON.stringify({'success': false, 'applicationStatus': applicationDatabase['applicationStatus']}));
  }
});
backendHttpRequestServer.post('/updateAgentLoginCredentials', (request, response) => {
  const requestQuery = request.body;
  agentsManagementFunctions.updateAgentLoginCredentials(requestQuery.agentID, requestQuery.agentProfilePicture, requestQuery.agentUsername, requestQuery.agentPassword);
  response.end('');
});
backendHttpRequestServer.post('/updateAgentAutomaticMessages', (request, response) => {
  const requestQuery = request.body;
  agentsManagementFunctions.updateAgentAutomaticMessages(requestQuery.agentID, requestQuery.agentWelcomeImage, requestQuery.agentWelcomeMessage, requestQuery.agentEndMessage);
  response.end('');
});
backendHttpRequestServer.post('/updateAgentFavoriteMessage', (request, response) => {
  const requestQuery = request.body;
  agentsManagementFunctions.updateAgentFavoriteMessage(requestQuery.agentID, requestQuery.agentFavoriteMessageTitle, requestQuery.agentFavoriteMessageContent);
  response.end('');
});
backendHttpRequestServer.post('/deleteAgentFavoriteMessage', (request, response) => {
  const requestQuery = request.body;
  agentsManagementFunctions.deleteAgentFavoriteMessage(requestQuery.agentID, requestQuery.agentFavoriteMessageTitle);
  response.end('');
});
backendHttpRequestServer.post('/createAgentFavoriteMessage', (request, response) => {
  const requestQuery = request.body;
  agentsManagementFunctions.createAgentFavoriteMessage(requestQuery.agentID, requestQuery.agentFavoriteMessageTitle, requestQuery.agentFavoriteMessageContent);
  response.end('');
});
backendHttpRequestServer.post('/deleteAgentFavoriteImage', (request, response) => {
  const requestQuery = request.body;
  agentsManagementFunctions.deleteAgentFavoriteImage(requestQuery.agentID, requestQuery.agentFavoriteImageTitle);
  response.end('');
});
backendHttpRequestServer.post('/createAgentFavoriteImage', (request, response) => {
  const requestQuery = request.body;
  agentsManagementFunctions.createAgentFavoriteImage(requestQuery.agentID, requestQuery.agentFavoriteImageTitle, requestQuery.agentFavoriteImageContent);
  response.end('');
});
backendHttpRequestServer.post('/createAgent', (request, response) => {
  agentsManagementFunctions.createAgent(request.body);
  response.end('')
});
backendHttpRequestServer.get('/getAllAgents', (request, response) => {
  const allAgentsInformation = agentsManagementFunctions.getAllAgents();
  response.end(JSON.stringify(allAgentsInformation));
});
backendHttpRequestServer.post('/updateAgentFromAdminPortal', (request, response) => {
  agentsManagementFunctions.updateAgentFromAdminPortal(request.body);
  response.end()
});
backendHttpRequestServer.post('/updateAgentStatus', (request, response) => {
  const requestQuery = request.body;
  agentsManagementFunctions.updateAgentStatus(requestQuery.agentID, requestQuery.agentStatus, backendWebsocketServerConnection);
  response.end('');
});
backendHttpRequestServer.post('/grabPendingConversation', (request, response) => {
  const conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
  const recipientPhoneNumber = conversationsDatabase[request.body.conversationID].recipientPhoneNumber;
  const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
  const messageContent = agentsDatabase[request.body.agentID].agentWelcomeMessage;
  const mediaContent = agentsDatabase[request.body.agentID].agentWelcomeImage;
  whatsappManagementFunctions.sendWhatsappPendingConversationMessage(recipientPhoneNumber, mediaContent, messageContent, request.body, backendWebsocketServerConnection);
  response.end('');
});
backendHttpRequestServer.post('/grabStoreConversation', (request, response) => {
  console.log(request.body);
  const recipientPhoneNumber = request.body.recipientPhoneNumber;
  const agentID = request.body.agentID;
  const messageID = request.body.messageID;
  const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
  const messageContent = agentsDatabase[request.body.agentID].agentWelcomeMessage;
  const mediaContent = agentsDatabase[request.body.agentID].agentWelcomeImage;
  whatsappManagementFunctions.sendWhatsappStoreConversationMessage(recipientPhoneNumber, agentID, messageID, mediaContent, messageContent, backendWebsocketServerConnection);
  response.end('');
});
backendHttpRequestServer.post('/requestTransfer', (request, response) => {
  const requestQuery = request.body;
  const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
  const previousAgentName = agentsDatabase[requestQuery.previousAgentID].agentName;
  websocketManagementFunctions.requestTransfer(backendWebsocketServerConnection, requestQuery.newAgentID, requestQuery.previousAgentID, previousAgentName, requestQuery.activeConversationID, requestQuery.products);
  response.end()
});
backendHttpRequestServer.post('/updateAssignedAgentToConversation', (request, response) => {
  agentsManagementFunctions.updateAssignedAgentToConversation(request.body.previousAgentID,request.body.activeConversationID,request.body.newAgentID,request.body.products,backendWebsocketServerConnection);
  response.end();
});
backendHttpRequestServer.post('/acceptTransfer', (request, response) => {
  const requestQuery = request.body;
  websocketManagementFunctions.acceptTransfer(backendWebsocketServerConnection, requestQuery.agentToNotify);
  response.end()
});
backendHttpRequestServer.get('/getTodaysDashboardInformation', (request, response) => {
  const allClosedConversationsAmount = Object.keys(conversationsManagementFunctions.getConversations()).length;

  const allConversationsAmount = allClosedConversationsAmount + allActiveConversationsAmount;
  response.end(JSON.stringify({'amount': Object.keys(allClosedConversations).length + Object.keys(allActiveConversations).length}));
});


backendHttpRequestServer.post('/sendWhatsappAudio', (request, response) => {
  whatsappManagementFunctions.sendWhatsappAudioMessage(request.body, backendWebsocketServerConnection);
  response.end('');
});

backendHttpRequestServer.get('/sendWhatsappMessage', (request, response) => {
  const requestQuery = url.parse(request.url,true).query;
  if (requestQuery['type'] == 'text'){
    whatsappManagementFunctions.sendWhatsappTextMessage(requestQuery, backendWebsocketServerConnection);
  } else {
    whatsappManagementFunctions.sendWhatsappMediaMessage(requestQuery, backendWebsocketServerConnection);
  }
  response.end('');
});


backendHttpRequestServer.post('/webhook', (request, response) => {
  if (request.body['entry'][0]['changes'][0]['value']['messages']){
      whatsappManagementFunctions.receiveWhatsappMessage(request, response, backendWebsocketServerConnection);
  } else {
      whatsappManagementFunctions.updateWhatsappMessageStatus(request, response);
  }
});
backendHttpRequestServer.get('/webhook', (request, response) => {
  console.log(url.parse(request.url,true).query['hub.challenge']);
  response.end(url.parse(request.url,true).query['hub.challenge']);
});

backendHttpRequestServer.post('/sendWhatsappLocation', (request, response) => {
    whatsappManagementFunctions.sendWhatsappLocationMessage(request.body, response, backendWebsocketServerConnection);
});

backendHttpRequestServer.post('/sendWhatsappMassMessage', (request, response) => {
    whatsappManagementFunctions.sendWhatsappMassMessage(request.body, response);
});
backendHttpRequestServer.post('/getAgentStatus', (request, response) => {
    agentsManagementFunctions.getAgentStatus(request.body, response);
});



backendHttpRequestServer.post('/sendWhatsappMedia', (request, response) => {
    whatsappManagementFunctions.sendWhatsappMediaMessage(request.body, response, backendWebsocketServerConnection);
});
backendHttpRequestServer.post('/sendWhatsappMediaURL', (request, response) => {
    whatsappManagementFunctions.sendWhatsappMediaMessageURL(request.body, response, backendWebsocketServerConnection);
});
backendHttpRequestServer.get('/getAgentActiveConversations', (request, response) => {
    const requestQuery = url.parse(request.url,true).query;
    const agentActiveConversations = agentsManagementFunctions.getAgentActiveConversations(requestQuery['agentID']);
    response.end(JSON.stringify(agentActiveConversations));
});
backendHttpRequestServer.get('/getAllFavoriteImages', (request, response) => {
  const allFavoriteImages = agentsManagementFunctions.getAllFavoriteImages();
  response.end(JSON.stringify(allFavoriteImages));
});
backendHttpRequestServer.post('/deleteAgent', (request, response) => {
agentsManagementFunctions.deleteAgent(request.body.agentID);
response.end()
});
backendHttpRequestServer.get('/getAllActiveConversations', (request, response) => {
    const allActiveConversations = conversationsManagementFunctions.getAllActiveConversations();
    response.end(JSON.stringify(allActiveConversations));
});
backendHttpRequestServer.get('/getAllClosedConversations', (request, response) => {
    const allClosedConversations = conversationsManagementFunctions.getAllClosedConversations();
    response.end(JSON.stringify(allClosedConversations));
});
backendHttpRequestServer.get('/getAllPendingConversations', (request, response) => {
    const allPendingConversations = conversationsManagementFunctions.getAllPendingConversations();
    response.end(JSON.stringify(allPendingConversations));
});
backendHttpRequestServer.get('/getAllStoreConversations', (request, response) => {
  const allStoreConversations = conversationsManagementFunctions.getAllStoreConversations();
  response.end(JSON.stringify(allStoreConversations));
});
backendHttpRequestServer.get('/getAllClosedConversationsAmount', (request, response) => {
    const allClosedConversations = conversationsManagementFunctions.getAllClosedConversations();
    response.end(JSON.stringify({'amount': Object.keys(allClosedConversations).length}));
});
backendHttpRequestServer.post('/updateAssignedAgentToConversation', (request, response) => {
    agentsManagementFunctions.updateAssignedAgentToConversation(request.body.previousAgentID,request.body.activeConversationID,request.body.newAgentID,request.body.products,backendWebsocketServerConnection);
    response.end();
});
backendHttpRequestServer.get('/closeConversation', (request, response) => {
    const conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
    const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    const requestQuery = url.parse(request.url,true).query;
    conversationsManagementFunctions.closeConversation(requestQuery['conversationID'], requestQuery['conversationStatus'], requestQuery['amount']);
    whatsappManagementFunctions.sendAutomaticWhatsappTextMessage(conversationsDatabase[requestQuery['conversationID']].recipientPhoneNumber, agentsDatabase[conversationsDatabase[requestQuery['conversationID']].assignedAgentID].endMessage, backendWebsocketServerConnection);
    whatsappManagementFunctions.sendAutomaticWhatsappTextMessage(conversationsDatabase[requestQuery['conversationID']].recipientPhoneNumber, 'Lo más importante para nosotros es la atención del cliente. Puede calificarnos accediendo al siguiente enlace: https://kingvapecr.com/pages/feedback', backendWebsocketServerConnection);
    response.end('');
});
backendHttpRequestServer.get('/getAllContacts', (request, response) => {
    const allContacts = contactsManagementFunctions.getAllContacts();
    response.end(JSON.stringify(allContacts));
});
backendHttpRequestServer.get('/getTotalProfit', (request, response) => {
    const totalProfit = conversationsManagementFunctions.getTotalProfit();
    response.end(JSON.stringify({'totalProfit': totalProfit}));
});
backendHttpRequestServer.get('/getContact', (request, response) => {
  const requestQuery = url.parse(request.url,true).query;
  const contactInformation = contactsManagementFunctions.getContact(requestQuery['contactPhoneNumber']);
  response.end(JSON.stringify({'contactInformation': contactInformation}));
});
backendHttpRequestServer.post('/createContact', (request, response) => {
  contactsManagementFunctions.createContact(request.body, response);
});
backendHttpRequestServer.post('/updateContact', (request, response) => {
  contactsManagementFunctions.updateContact(request.body);
  response.end()
});
backendHttpRequestServer.post('/deleteContact', (request, response) => {
  contactsManagementFunctions.deleteContact(request.body.contactID);
  response.end()
});
backendHttpRequestServer.post('/createContactFromContactList', (request, response) => {
  contactsManagementFunctions.createContactFromContactsPage(request.body);
  response.end()
});

backendHttpRequestServer.post('/rankingLogin', (request, response) => {
  if ((request.body.username == 'rankingvape') && (request.body.password == 'password')){
    response.end(JSON.stringify({'success': true}));
  } else {
    response.end(JSON.stringify({'success': false}));
  }
});





backendHttpRequestServer.post('/getApplicationStatus', (request, response) => {
  const applicationDatabase = databaseManagementFunctions.readDatabase(constants.routes.applicationDatabase);
  response.end(JSON.stringify({'applicationStatus': applicationDatabase['applicationStatus']}));
});

backendHttpRequestServer.post('/updateApplicationStatus', (request, response) => {
  const applicationDatabase = databaseManagementFunctions.readDatabase(constants.routes.applicationDatabase);
  applicationDatabase['applicationStatus'] = request.body.applicationStatus;
  databaseManagementFunctions.saveDatabase(constants.routes.applicationDatabase, applicationDatabase);
  if (request.body.applicationStatus == 'off'){
    websocketManagementFunctions.turnOffApplication(backendWebsocketServerConnection);
  }
  response.end('');
});