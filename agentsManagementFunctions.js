const constants = require('./constants.js');
const generalFunctions = require('./generalFunctions.js');
const databaseManagementFunctions = require('./databaseManagementFunctions.js');
const websocketManagementFunctions = require('./websocketManagementFunctions.js');

module.exports = {
  agentLogin: function(agentUsername, agentPassword){
    const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    for (var agentID in agentsDatabase){
      if (agentsDatabase[agentID].agentUsername == agentUsername){
        if (agentsDatabase[agentID].agentPassword == agentPassword){
          const agentInformation = agentsDatabase[agentID];
          agentInformation['agentID'] = agentID;
          return agentInformation;
        }
      }
    }
    return {'agentID': null, 'agentName': null, 'agentType': null};
  },
  updateAgentLoginCredentials: function(agentID, agentProfilePicture, agentUsername, agentPassword){
    const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    agentsDatabase[agentID]['agentUsername'] = agentUsername;
    agentsDatabase[agentID]['agentPassword'] = agentPassword;
    agentsDatabase[agentID]['agentProfilePicture'] = agentProfilePicture;
    databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
  },
  updateAgentAutomaticMessages: function(agentID, agentWelcomeMessage, agentEndMessage){
    const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    agentsDatabase[agentID]['agentWelcomeMessage'] = agentWelcomeMessage;
    agentsDatabase[agentID]['agentEndMessage'] = agentEndMessage;
    databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
  },
  updateAgentFavoriteMessage: function(agentID, agentFavoriteMessageTitle, agentFavoriteMessageContent){
    const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    for (var agentFavoriteMessageIndex in agentsDatabase[agentID]['agentFavoriteMessages']){
      if (agentsDatabase[agentID]['agentFavoriteMessages'][agentFavoriteMessageIndex]['title'] == agentFavoriteMessageTitle){
        agentsDatabase[agentID]['agentFavoriteMessages'][agentFavoriteMessageIndex]['content'] = agentFavoriteMessageContent;
      }
    }
    databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
  },
  deleteAgentFavoriteMessage: function(agentID, agentFavoriteMessageTitle){
    const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    agentsDatabase[agentID]['agentFavoriteMessages'] = agentsDatabase[agentID]['agentFavoriteMessages'].filter(agentFavoriteMessage => agentFavoriteMessage.title != agentFavoriteMessageTitle);
    databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
  },
  createAgentFavoriteMessage: function(agentID, agentFavoriteMessageTitle, agentFavoriteMessageContent){
    const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    agentsDatabase[agentID]['agentFavoriteMessages'].push({'title': agentFavoriteMessageTitle, 'content': agentFavoriteMessageContent});
    databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
  },
  deleteAgentFavoriteImage: function(agentID, agentFavoriteImageTitle){
    const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    agentsDatabase[agentID]['agentFavoriteImages'] = agentsDatabase[agentID]['agentFavoriteImages'].filter(agentFavoriteImage => agentFavoriteImage.title != agentFavoriteImageTitle);
    databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
  },
  createAgentFavoriteImage: function(agentID, agentFavoriteImageTitle, agentFavoriteImageContent){
    const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    agentsDatabase[agentID]['agentFavoriteImages'].push({'title': agentFavoriteImageTitle, 'content': agentFavoriteImageContent});
    databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
  },
  createAgent: function(request){
    var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    agentsDatabase[request.agentID] = 
    {
      "agentName": request.agentName,
      "agentUsername": request.agentUsername,
      "agentPassword": request.agentPassword,
      "agentProfilePicture": "",
      "agentActiveConversations": [],
      "agentFinishedConversations": [],
      "agentReceivedMessages": 0,
      "agentReadedMessages": 0,
      "agentSendedMessages": 0,
      "agentStatus": "offline",
      "agentType": request.agentType,
      "agentFavoriteMessages": [],
      "agentWelcomeImage": "",
      "agentWelcomeMessage": "Mensaje de bienvenida",
      "agentEndMessage": "Mensaje de despedida",
      "agentFavoriteImages": []
    }
    databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
  },
  getAllAgents: function (){
    const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    for (var agentID in agentsDatabase){
      delete agentsDatabase[agentID]['agentFavoriteMessages'];
      delete agentsDatabase[agentID]['agentWelcomeImage'];
      delete agentsDatabase[agentID]['agentWelcomeMessage'];
      delete agentsDatabase[agentID]['agentEndMessage'];
      delete agentsDatabase[agentID]['agentFavoriteImages'];
    }
    return agentsDatabase;
  },
  updateAgentFromAdminPortal: function(request){
    var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    agentsDatabase[request.agentID]['agentName'] = request.agentName;
    agentsDatabase[request.agentID]['agentUsername'] = request.agentUsername;
    agentsDatabase[request.agentID]['agentPassword'] = request.agentPassword;
    databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
  },
  updateAgentStatus: function (agentID, agentStatus, websocketConnection){
    var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
    agentsDatabase[agentID]['agentStatus'] = agentStatus;
    databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
    websocketManagementFunctions.updateAgentStatus(websocketConnection, agentID, agentStatus);
  },


    addMessageCount: function(agentID, websocketConnection){
      const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
      agentsDatabase[agentID]['agentSendedMessages'] = agentsDatabase[agentID]['agentSendedMessages'] + 1;
      databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
      websocketManagementFunctions.addMessageCount(websocketConnection, agentID);
    },

    deleteAgent: function(agentID){
      var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
      delete agentsDatabase[agentID];
      databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
    },

    deleteAllAgentsActiveConversations: function (){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        for (var agentID in agentsDatabase){
            agentsDatabase[agentID].agentActiveConversations = [];
        }
        databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
    },

    getAgentActiveConversations: function (agentID){
        const conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        const agentActiveConversationsIDS = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase)[agentID].agentActiveConversations;
        var agentActiveConversations = {};
        for (var conversationID in conversationsDatabase){
            if (agentActiveConversationsIDS.includes(conversationID)){
                agentActiveConversations[conversationID] = conversationsDatabase[conversationID];
            }
        }
        return agentActiveConversations;
    },

    getAssignedAgentToConversationID: function (searchedConversationID){
        const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        for (var agentID in agentsDatabase){
            for (var conversationIndex in agentsDatabase[agentID].agentActiveConversations){
                if (searchedConversationID == agentsDatabase[agentID].agentActiveConversations[conversationIndex]){
                    return agentID;
                }
            }
        }
        return null;
    },

    

    getAllFavoriteImages: function (){
      const favoriteImagesDatabase = databaseManagementFunctions.readDatabase(constants.routes.favoriteImagesDatabase);
      return favoriteImagesDatabase;
  },

    updateAssignedAgentToConversation: function(previousAgentID, activeConversationID, newAgentID, products, websocketConnection){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        const activeConversationIndex = agentsDatabase[previousAgentID].agentActiveConversations.indexOf(activeConversationID);
        if (activeConversationIndex != -1) {
            agentsDatabase[previousAgentID].agentActiveConversations.splice(activeConversationIndex, 1);
        }
        agentsDatabase[newAgentID].agentActiveConversations.push(activeConversationID);
        conversationsDatabase[activeConversationID].assignedAgentID = newAgentID;
        conversationsDatabase[activeConversationID].products = products;
        conversationsDatabase[activeConversationID].transferHistory.push({previousAgentName: agentsDatabase[previousAgentID].agentName, newAgentName: agentsDatabase[newAgentID].agentName, transferDate: generalFunctions.getCurrentDateAsStringWithFormat(), transferHour: generalFunctions.getCurrentHourAsStringWithFormat()});
        databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
        databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
        websocketManagementFunctions.transferConversation(websocketConnection, conversationsDatabase[activeConversationID], activeConversationID, newAgentID, agentsDatabase[newAgentID].agentName, false);
    },

    assignNewConversationToAgentWithLessActiveConversations: function (newConversationID, agentID, websocketConnection){
        var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        var agentsWithLessActiveConversations = [];
        if (agentID == null){
            for (var agentID in agentsDatabase){
                if (agentsDatabase[agentID].agentStatus != 'offline'){
                    if (agentsWithLessActiveConversations.length == 0){
                        agentsWithLessActiveConversations.push(agentID);
                    } else {
                        if (agentsDatabase[agentID].agentActiveConversations.length < agentsDatabase[agentsWithLessActiveConversations[0]].agentActiveConversations.length){
                            agentsWithLessActiveConversations = [agentID];
                        } else if (agentsDatabase[agentID].agentActiveConversations.length == agentsDatabase[agentsWithLessActiveConversations[0]].agentActiveConversations.length) {
                            agentsWithLessActiveConversations.push(agentID);
                        }
                    }
                }
            }
            websocketManagementFunctions.addClosedCount(websocketConnection, agentsWithLessActiveConversations);
            if (agentsWithLessActiveConversations.length != 0){
                const agentWithLessActiveConversations = agentsWithLessActiveConversations[Math.floor(Math.random()*agentsWithLessActiveConversations.length)]; 
                conversationsDatabase[newConversationID].assignedAgentID = agentWithLessActiveConversations;
                agentsDatabase[agentWithLessActiveConversations].agentActiveConversations.push(newConversationID);
                databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
                databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
            }
        } else {
            conversationsDatabase[newConversationID].assignedAgentID = agentID;
            agentsDatabase[agentID].agentActiveConversations.push(newConversationID);
            databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
            databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
        }
        websocketManagementFunctions.addActiveCount(websocketConnection, agentID);

    },

    assignConversationToAgent: function (conversationID, agentID){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        agentsDatabase[agentID].agentActiveConversations.push(conversationID);
        databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
    },

    getAgentStatus: function (requestQuery, frontedResponse){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        frontedResponse.end(JSON.stringify({'agentStatus':agentsDatabase[requestQuery.agentID].agentStatus}));
    },

    grabPendingConversation: function (requestQuery, websocketConnection){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        agentsDatabase[requestQuery.agentID].agentActiveConversations.push(requestQuery.conversationID);
        conversationsDatabase[requestQuery.conversationID].assignedAgentID = requestQuery.agentID;
        databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
        databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
        websocketManagementFunctions.grabPendingConversation(websocketConnection, conversationsDatabase[requestQuery.conversationID], requestQuery.conversationID, requestQuery.agentID, agentsDatabase[requestQuery.agentID].agentName);
    },

    grabStoreConversation: function (recipientPhoneNumber, activeConversationID, agentID, websocketConnection){
      var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
      var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
      var storesDatabase = databaseManagementFunctions.readDatabase(constants.routes.sucursalesDatabase);
      delete storesDatabase[recipientPhoneNumber]; 
      agentsDatabase[agentID].agentActiveConversations.push(activeConversationID);
      conversationsDatabase[activeConversationID].assignedAgentID = agentID;
      databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
      databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
      databaseManagementFunctions.saveDatabase(constants.routes.sucursalesDatabase, storesDatabase);    
      websocketManagementFunctions.grabStoreConversation(websocketConnection, conversationsDatabase[activeConversationID], activeConversationID, agentID, agentsDatabase[agentID].agentName);
  }
}