const constants = require('./constants.js');
const whatsappManagementFunctions = require('./whatsappManagementFunctions.js');
const agentsManagementFunctions = require('./agentsManagementFunctions.js');
const conversationsManagementFunctions = require('./conversationsManagementFunctions.js');
const contactsManagementFunctions = require('./contactsManagementFunctions.js');

const url = require('url');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');

const express = require('express');
const backendHttpRequestServer = express();
backendHttpRequestServer.use(cors());
backendHttpRequestServer.use(bodyParser.json({limit: '50mb'}));
backendHttpRequestServer.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
backendHttpRequestServer.listen(constants.backendHttpRequestServerConnectionPort);

const WebSocket = require('ws');
const databaseManagementFunctions = require('./databaseManagementFunctions.js');
const server = http.createServer(express);
const backendWebsocketServerConnection = new WebSocket.Server({server});
server.listen(constants.backendWebsocketServerConnectionPort);

backendHttpRequestServer.get('/sendWhatsappMessage', (request, response) => {
    const requestQuery = url.parse(request.url,true).query;
    if (requestQuery['type'] == 'text'){
        whatsappManagementFunctions.sendWhatsappTextMessage(requestQuery, response, backendWebsocketServerConnection);
    } else {
        whatsappManagementFunctions.sendWhatsappMediaMessage(requestQuery, response, backendWebsocketServerConnection);
    }
});

backendHttpRequestServer.post('/sendWhatsappLocation', (request, response) => {
    whatsappManagementFunctions.sendWhatsappLocationMessage(request.body, response, backendWebsocketServerConnection);
});

backendHttpRequestServer.post('/sendWhatsappMassMessage', (request, response) => {
    whatsappManagementFunctions.sendWhatsappMassMessage(request.body, response);
});

backendHttpRequestServer.post('/updateAgentStatus', (request, response) => {
    agentsManagementFunctions.updateAgentStatus(request.body, response, backendWebsocketServerConnection);
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

backendHttpRequestServer.post('/agentLogin', (request, response) => {
    const agentInformation = agentsManagementFunctions.agentLogin(request.body.agentUsername, request.body.agentPassword);
    if (agentInformation.agentID != null){
        response.end(JSON.stringify({'success': true, 'agentID': agentInformation.agentID, 'agentName': agentInformation.agentName, 'agentType': agentInformation.agentType}));
    } else {
        response.end(JSON.stringify({'success': false, 'agentID': null, 'agentName': null, 'agentType': null}));
    }
});

backendHttpRequestServer.get('/getAgentActiveConversations', (request, response) => {
    const requestQuery = url.parse(request.url,true).query;
    const agentActiveConversations = agentsManagementFunctions.getAgentActiveConversations(requestQuery['agentID']);
    response.end(JSON.stringify(agentActiveConversations));
});

backendHttpRequestServer.get('/getAllAgents', (request, response) => {
    const allAgents = agentsManagementFunctions.getAllAgents();
    response.end(JSON.stringify(allAgents));
});

backendHttpRequestServer.get('/getAllFavoriteImages', (request, response) => {
  const allFavoriteImages = agentsManagementFunctions.getAllFavoriteImages();
  response.end(JSON.stringify(allFavoriteImages));
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

backendHttpRequestServer.post('/grabPendingConversation', (request, response) => {
    const conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
    const recipientPhoneNumber = conversationsDatabase[request.body.conversationID].recipientPhoneNumber;
    const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    const messageContent = agentsDatabase[request.body.agentID].welcomeMessage;
    const mediaContent = agentsDatabase[request.body.agentID].welcomeImage;
    whatsappManagementFunctions.sendWhatsappPendingConversationMessage(recipientPhoneNumber, mediaContent, messageContent, request.body, backendWebsocketServerConnection);
    response.end();
});

backendHttpRequestServer.get('/getAllClosedConversationsAmount', (request, response) => {
    const allClosedConversations = conversationsManagementFunctions.getAllClosedConversations();
    response.end(JSON.stringify({'amount': Object.keys(allClosedConversations).length}));
});

backendHttpRequestServer.get('/getAllConversationsAmount', (request, response) => {
    const allClosedConversations = conversationsManagementFunctions.getAllClosedConversations();
    const allActiveConversations = conversationsManagementFunctions.getAllActiveConversations();
    response.end(JSON.stringify({'amount': Object.keys(allClosedConversations).length + Object.keys(allActiveConversations).length}));
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

    response.end();
});

backendHttpRequestServer.get('/getContact', (request, response) => {
    const requestQuery = url.parse(request.url,true).query;
    const contactInformation = contactsManagementFunctions.getContact(requestQuery['contactPhoneNumber']);
    response.end(JSON.stringify({'contactInformation': contactInformation}));
});

backendHttpRequestServer.get('/getAllContacts', (request, response) => {
    const allContacts = contactsManagementFunctions.getAllContacts();
    response.end(JSON.stringify(allContacts));
});

backendHttpRequestServer.get('/getTotalProfit', (request, response) => {
    const totalProfit = conversationsManagementFunctions.getTotalProfit();
    response.end(JSON.stringify({'totalProfit': totalProfit}));
});

backendHttpRequestServer.post('/createContact', (request, response) => {
    contactsManagementFunctions.createContact(request.body, response);
});

backendHttpRequestServer.post('/updateAgentInformation', (request, response) => {
    agentsManagementFunctions.updateAgentInformation(request.body, response);
});

backendHttpRequestServer.post('/createAgent', (request, response) => {
    agentsManagementFunctions.createAgent(request.body);
    response.end()
});

backendHttpRequestServer.post('/deleteAgent', (request, response) => {
  agentsManagementFunctions.deleteAgent(request.body.agentID);
  response.end()
});

backendHttpRequestServer.post('/updateAgent', (request, response) => {
  agentsManagementFunctions.updateAgent(request.body);
  response.end()
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