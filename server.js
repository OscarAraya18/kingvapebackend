const constants = require('./constants.js');
const whatsappManagementFunctions = require('./whatsappManagementFunctions.js');
const agentsManagementFunctions = require('./agentsManagementFunctions.js');
const conversationsManagementFunctions = require('./conversationsManagementFunctions.js');
const contactsManagementFunctions = require('./contactsManagementFunctions.js');
const databaseManagementFunctions = require('./databaseManagementFunctions.js');
const websocketManagementFunctions = require('./websocketManagementFunctions.js');
const generalFunctions = require('./generalFunctions.js');

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



backendHttpRequestServer.post('/clean', (request, response) => {

  var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
  for (var agentID in agentsDatabase){
    agentsDatabase[agentID]['agentActiveConversations'] = [];
    agentsDatabase[agentID]['agentFinishedConversations'] = [];
    agentsDatabase[agentID]['agentReceivedMessages'] = 0;
    agentsDatabase[agentID]['agentSendedMessages'] = 0;
    agentsDatabase[agentID]['agentReadedMessages'] = 0;
    agentsDatabase[agentID]['agentStatus'] = 'offline';
  }

  var storeConversations = databaseManagementFunctions.readDatabase(constants.routes.sucursalesDatabase);

  databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, {});
  databaseManagementFunctions.saveDatabase(constants.routes.sucursalesDatabase, {})
  databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase)

  response.end(JSON.stringify(favoriteImagesDatabase))
});


backendHttpRequestServer.post('/getFavoriteImages', (request, response) => {
  var favoriteImagesDatabase = databaseManagementFunctions.readDatabase(constants.routes.favoriteImagesDatabase);
  response.end(JSON.stringify(favoriteImagesDatabase))
});


backendHttpRequestServer.post('/getHistoryConversations', async (request, response) => {
  const historyConversations = conversationsManagementFunctions.getHistoryConversations(request.body.recipientPhoneNumber);
  response.end(JSON.stringify(historyConversations));
});

backendHttpRequestServer.post('/openHistoryConversation', async (request, response) => {
  const historyConversation = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase)[request.body.conversationID];
  console.log(historyConversation);
  response.end(JSON.stringify(historyConversation));
});



backendHttpRequestServer.post('/changeName', (request, response) => {
  whatsappManagementFunctions.changeName(request.body.newName);
});

backendHttpRequestServer.post('/agentLogin', (request, response) => {
  const agentInformation = agentsManagementFunctions.agentLogin(request.body.agentUsername, request.body.agentPassword);
  const applicationDatabase = databaseManagementFunctions.readDatabase(constants.routes.applicationDatabase);
  if (agentInformation.agentID != null){
    if (applicationDatabase['applicationStatus'] == 'on'){
      response.end(JSON.stringify({'success': true, 'agentID': agentInformation.agentID, 'agentName': agentInformation.agentName, 'agentUsername': agentInformation.agentUsername, 'agentPassword': agentInformation.agentPassword, 'agentType': agentInformation.agentType, 'agentProfilePicture': agentInformation.agentProfilePicture, 'agentWelcomeMessage': agentInformation.agentWelcomeMessage, 'agentEndMessage': agentInformation.agentEndMessage, 'agentFavoriteMessages': agentInformation.agentFavoriteMessages}));
    } else {
      if (agentInformation.agentType != 'admin'){
        response.end(JSON.stringify({'success': false, 'applicationStatus': applicationDatabase['applicationStatus']}));
      } else {
        response.end(JSON.stringify({'success': true, 'agentID': agentInformation.agentID, 'agentName': agentInformation.agentName, 'agentUsername': agentInformation.agentUsername, 'agentPassword': agentInformation.agentPassword, 'agentType': agentInformation.agentType, 'agentProfilePicture': agentInformation.agentProfilePicture, 'agentWelcomeMessage': agentInformation.agentWelcomeMessage, 'agentEndMessage': agentInformation.agentEndMessage, 'agentFavoriteMessages': agentInformation.agentFavoriteMessages}));
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
  agentsManagementFunctions.updateAgentAutomaticMessages(requestQuery.agentID, requestQuery.agentWelcomeMessage, requestQuery.agentEndMessage);
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
  websocketManagementFunctions.addActiveCount(backendWebsocketServerConnection, request.body.agentID);

  response.end('');
});
backendHttpRequestServer.post('/grabStoreConversation', (request, response) => {
  const recipientPhoneNumber = request.body.recipientPhoneNumber;
  const agentID = request.body.agentID;
  const messageID = request.body.messageID;
  const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
  const messageContent = agentsDatabase[request.body.agentID].agentWelcomeMessage;
  const mediaContent = agentsDatabase[request.body.agentID].agentWelcomeImage;
  const storeName = request.body.storeName;
  whatsappManagementFunctions.sendWhatsappStoreConversationMessage(storeName, recipientPhoneNumber, agentID, messageID, mediaContent, messageContent, backendWebsocketServerConnection);
  websocketManagementFunctions.addActiveCount(backendWebsocketServerConnection, request.body.agentID);

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
backendHttpRequestServer.post('/getContacts', (request, response) => {
  const allContacts = contactsManagementFunctions.getAllContacts();
  const contactLetter = request.body.contactLetter;
  if (contactLetter != 'Otro'){
    for (var contactPhoneNumber in allContacts){
      if (allContacts[contactPhoneNumber]['contactName'][0].toUpperCase() != contactLetter){
        delete allContacts[contactPhoneNumber];
      }
    }
  }
  response.end(JSON.stringify(allContacts));
});



backendHttpRequestServer.get('/getTodaysDashboardInformation', (request, response) => {
  const conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
  const currentDateAsString = generalFunctions.getCurrentDateAsStringWithFormat();
  
  var currentTodayConversation = 0;
  var currentTodayConverted = 0;
  var currentTodayNotConverted = 0;
  var currentTodayAmount = 0;

  var currentTodaySent = 0;
  var currentTodayReceived = 0;

  for (var conversationID in conversationsDatabase){
    if (conversationsDatabase[conversationID].startDate == currentDateAsString){
      
      currentTodayConversation = currentTodayConversation + 1;
      if (conversationsDatabase[conversationID].active == false){
        if (conversationsDatabase[conversationID].status == 'converted'){
          currentTodayConverted = currentTodayConverted + 1;
          currentTodayAmount = currentTodayAmount + parseInt(conversationsDatabase[conversationID].amount);
        } else {
          currentTodayNotConverted = currentTodayNotConverted + 1;
        }
      }

      for (var messageID in conversationsDatabase[conversationID].messages){
        if (conversationsDatabase[conversationID].messages[messageID].owner == 'agent'){
          currentTodaySent = currentTodaySent + 1;
        } else {
          currentTodayReceived = currentTodayReceived + 1;
        }
      }
    }
  }

  const result = 
  {
    currentTodayConversation: currentTodayConversation,
    currentTodayConverted: currentTodayConverted,
    currentTodayNotConverted: currentTodayNotConverted,
    currentTodayAmount: currentTodayAmount,
    currentTodaySent: currentTodaySent,
    currentTodayReceived: currentTodayReceived
  }
  response.end(JSON.stringify(result));

});


backendHttpRequestServer.get('/getTodayReport', (request, response) => {
  const conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
  const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
  const currentDateAsString = generalFunctions.getCurrentDateAsStringWithFormat();
  
  var result = {};

  for (var conversationID in conversationsDatabase){
    if (conversationsDatabase[conversationID].startDate == currentDateAsString){
      var agentName = agentsDatabase[conversationsDatabase[conversationID].assignedAgentID].agentName;
      if (!(agentName in result)){
        result[agentName] = 
        {
          agentName: agentName,
          todayConversations: 0,
          todayConvertedConversations: 0,
          todayNotConvertedConversations: 0,
          todayAmount: 0,
          todaySent: 0,
          todayReceived: 0
        };
      }
      result[agentName]['todayConversations'] = result[agentName]['todayConversations'] + 1;
      if (conversationsDatabase[conversationID].active == false){
        if (conversationsDatabase[conversationID].status == 'converted'){
          result[agentName]['todayConvertedConversations'] = result[agentName]['todayConvertedConversations'] + 1;
          result[agentName]['todayAmount'] = result[agentName]['todayAmount'] + parseInt(conversationsDatabase[conversationID].amount);;
        } else {
          result[agentName]['todayNotConvertedConversations'] = result[agentName]['todayNotConvertedConversations'] + 1;
        }
      }

      for (var messageID in conversationsDatabase[conversationID].messages){
        if (conversationsDatabase[conversationID].messages[messageID].owner == 'agent'){
          result[agentName]['todaySent'] = result[agentName]['todaySent'] + 1;
        } else {
          result[agentName]['todayReceived'] = result[agentName]['todayReceived'] + 1;
        }
      }
    }

  }

  for (var agentID in agentsDatabase){
    var agentName = agentsDatabase[agentID].agentName;
    if (!(agentName in result)){
      if (agentsDatabase[agentID].agentType == 'agent'){
        result[agentName] = 
        {
          agentName: agentName,
          todayConversations: 0,
          todayConvertedConversations: 0,
          todayNotConvertedConversations: 0,
          todayAmount: 0,
          todaySent: 0,
          todayReceived: 0
        };
      }
      
    }
  }

  response.end(JSON.stringify(result));

});


backendHttpRequestServer.get('/getAgentOptions', async (request, response) => {
  const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
  var result = {};
  for (var agentID in agentsDatabase){
    var agentName = agentsDatabase[agentID].agentName;
    result[agentName] = {value: agentID, text: agentName};
  } 
  response.end(JSON.stringify(result));
});


backendHttpRequestServer.post('/sendWhatsappAudio', async (request, response) => {
  const sendWhatsappAudioMessageResult = await whatsappManagementFunctions.sendWhatsappAudioMessage(request.body, backendWebsocketServerConnection);
  agentsManagementFunctions.addMessageCount(request.body['agentID'], backendWebsocketServerConnection);
  response.end(JSON.stringify(sendWhatsappAudioMessageResult));
});

backendHttpRequestServer.get('/sendWhatsappMessage', async (request, response) => {
  const requestQuery = url.parse(request.url,true).query;
  if (requestQuery['type'] == 'text'){
    var messageID = await whatsappManagementFunctions.sendWhatsappTextMessage(requestQuery, backendWebsocketServerConnection);
  } else {
    var messageID = await whatsappManagementFunctions.sendWhatsappMediaMessage(requestQuery, backendWebsocketServerConnection);
  }
  agentsManagementFunctions.addMessageCount(requestQuery['agentID'], backendWebsocketServerConnection);
  response.end(messageID);
});

backendHttpRequestServer.get('/sendWhatsappContactMessage', (request, response) => {
  const requestQuery = url.parse(request.url,true).query;
  whatsappManagementFunctions.sendWhatsappContactMessage(requestQuery, backendWebsocketServerConnection);
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
    agentsManagementFunctions.addMessageCount(request.body['agentID'], backendWebsocketServerConnection);
});

backendHttpRequestServer.post('/sendWhatsappMassMessage', (request, response) => {
    whatsappManagementFunctions.sendWhatsappMassMessage(request.body, response);
});
backendHttpRequestServer.post('/getAgentStatus', (request, response) => {
    agentsManagementFunctions.getAgentStatus(request.body, response);
});



backendHttpRequestServer.post('/sendWhatsappMedia', (request, response) => {
    whatsappManagementFunctions.sendWhatsappMediaMessage(request.body, response, backendWebsocketServerConnection);
    agentsManagementFunctions.addMessageCount(request.body['agentID'], backendWebsocketServerConnection);

});
backendHttpRequestServer.post('/sendWhatsappMediaURL', (request, response) => {
    whatsappManagementFunctions.sendWhatsappMediaMessageURL(request.body, response, backendWebsocketServerConnection);
    agentsManagementFunctions.addMessageCount(request.body['agentID'], backendWebsocketServerConnection);

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
backendHttpRequestServer.get('/closeConversation', (request, response) => {
    const conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
    const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    const requestQuery = url.parse(request.url,true).query;
    conversationsManagementFunctions.closeConversation(requestQuery['conversationID'], requestQuery['conversationStatus'], requestQuery['amount']);
    whatsappManagementFunctions.sendAutomaticWhatsappTextMessage(conversationsDatabase[requestQuery['conversationID']].recipientPhoneNumber, agentsDatabase[conversationsDatabase[requestQuery['conversationID']].assignedAgentID].agentEndMessage, backendWebsocketServerConnection);
    if (requestQuery['conversationStatus'] == 'converted'){
      websocketManagementFunctions.addClosedCount(backendWebsocketServerConnection, requestQuery['agentID']);
    }

    response.end('');
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