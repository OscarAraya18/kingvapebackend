const constants = require('./constants.js');

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const backendHttpRequestServer = express();
backendHttpRequestServer.use(cors());
backendHttpRequestServer.use(express.json({limit: '50mb'}));

const server = backendHttpRequestServer.listen(constants.backendHttpRequestServerConnectionPort);
module.exports = server;

const backendAgentHttpRequestServer = require('./agentModule/agentServer.js');
const backendContactHttpRequestServer = require('./contactModule/contactServer.js');
const backendWhatsappHttpRequestServer = require('./whatsappModule/whatsappServer.js');
const backendStoreHttpRequestServer = require('./storeModule/storeServer.js');

backendHttpRequestServer.use(backendAgentHttpRequestServer);
backendHttpRequestServer.use(backendContactHttpRequestServer);
backendHttpRequestServer.use(backendWhatsappHttpRequestServer);
backendHttpRequestServer.use(backendStoreHttpRequestServer);



/*







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
  response.end(JSON.stringify(historyConversation));
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




backendHttpRequestServer.post('/sendWhatsappMediaURL', (request, response) => {
    whatsappManagementFunctions.sendWhatsappMediaMessageURL(request.body, response, backendWebsocketServerConnection);
    agentsManagementFunctions.addMessageCount(request.body['agentID'], backendWebsocketServerConnection);
});

backendHttpRequestServer.get('/getAgentActiveConversations', (request, response) => {
    const requestQuery = url.parse(request.url,true).query;
    const agentActiveConversations = agentsManagementFunctions.getAgentActiveConversations(requestQuery['agentID']);
    response.end(JSON.stringify(agentActiveConversations));
});
backendHttpRequestServer.post('/deleteAgent', (request, response) => {
agentsManagementFunctions.deleteAgent(request.body.agentID);
response.end()
});
backendHttpRequestServer.get('/getAllClosedConversations', (request, response) => {
    const allClosedConversations = conversationsManagementFunctions.getAllClosedConversations();
    response.end(JSON.stringify(allClosedConversations));
});
backendHttpRequestServer.get('/getAllPendingConversations', (request, response) => {
    const allPendingConversations = conversationsManagementFunctions.getAllPendingConversations();
    response.end(JSON.stringify(allPendingConversations));
});

 
backendHttpRequestServer.get('/getTotalProfit', (request, response) => {
    const totalProfit = conversationsManagementFunctions.getTotalProfit();
    response.end(JSON.stringify({'totalProfit': totalProfit}));
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

*/