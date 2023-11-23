const constants = require('./constants.js');
const generalFunctions = require('./generalFunctions.js');
const databaseManagementFunctions = require('./databaseManagementFunctions.js');
const agentsManagementFunctions = require('./agentsManagementFunctions.js');

module.exports = {
  deleteStoreConversation: function (recipientPhoneNumber){
    var storesDatabase = databaseManagementFunctions.readDatabase(constants.routes.sucursalesDatabase);
    delete storesDatabase[recipientPhoneNumber];
    databaseManagementFunctions.saveDatabase(constants.routes.sucursalesDatabase, storesDatabase);
  },

    createConversation: function (recipientPhoneNumber, recipientProfileName){
        var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        const currentDateAsString = generalFunctions.getCurrentDateAsString();
        var newConversationID = currentDateAsString;
        var currentDayConversationsAmount = 0;
        for (var conversationID in conversationsDatabase){
            if (conversationID.slice(0,8) == currentDateAsString){
                currentDayConversationsAmount = currentDayConversationsAmount + 1;
            }
        }
        if (currentDayConversationsAmount == 0){
            newConversationID = currentDateAsString + '1';
        } else {
            newConversationID = currentDateAsString + (currentDayConversationsAmount + 1).toString();
        }
        conversationsDatabase[newConversationID] = 
        {
            recipientPhoneNumber: recipientPhoneNumber,
            recipientProfileName: recipientProfileName,
            assignedAgentID: null,
            startDateObject: generalFunctions.getCurrentDateObject(),
            startDate: generalFunctions.getCurrentDateAsStringWithFormat(), 
            endDate: null, 
            startHour: generalFunctions.getCurrentHourAsStringWithFormat(), 
            endHour: null,
            active: true,
            messages: {},
            products: [],
            transferHistory: []
        };
        databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
        return newConversationID;
    },

    getActiveConversationID: function (recipientPhoneNumber){
        const conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        for (var conversationID in conversationsDatabase){
            if (conversationsDatabase[conversationID].recipientPhoneNumber == recipientPhoneNumber){
                if (conversationsDatabase[conversationID].active == true){
                    return conversationID;
                }
            }
        }
        return null;
    },

    addMessageToConversation: function (activeConversationID, messageInformation){
        var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        try {
            const newMessageID = Object.keys(conversationsDatabase[activeConversationID].messages).length + 1;
            conversationsDatabase[activeConversationID].messages[newMessageID] = messageInformation;
            databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
            return newMessageID;
        } catch {
            return null;
        }        
    },

    updateConversationMessageStatus: function (activeConversationID, messageID, messageStatus){
        if (messageStatus == 'sent'){
            var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
            const updatedMessageNumber = Object.keys(conversationsDatabase[activeConversationID].messages).length.toString();
            //conversationsDatabase[activeConversationID].messages[updatedMessageNumber].messageID = messageID;
            databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
        } else {
            var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
            var updatedMessageNumber = '';
            for (var messageNumber in conversationsDatabase[activeConversationID].messages){
                if (conversationsDatabase[activeConversationID].messages[messageNumber].messageID == messageID){
                    updatedMessageNumber = messageNumber;
                }
            }
            if (conversationsDatabase[activeConversationID].messages[updatedMessageNumber]){
                conversationsDatabase[activeConversationID].messages[updatedMessageNumber].messageStatus = messageStatus;
                if (messageStatus == 'delivered'){
                    conversationsDatabase[activeConversationID].messages[updatedMessageNumber].messageDeliveryDate = generalFunctions.getCurrentDateAsStringWithFormat();
                    conversationsDatabase[activeConversationID].messages[updatedMessageNumber].messageDeliveryHour = generalFunctions.getCurrentHourAsStringWithFormat();
                } else {
                    conversationsDatabase[activeConversationID].messages[updatedMessageNumber].messageReadDate = generalFunctions.getCurrentDateAsStringWithFormat();
                    conversationsDatabase[activeConversationID].messages[updatedMessageNumber].messageReadHour = generalFunctions.getCurrentHourAsStringWithFormat();
                }
            }
            databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
        }
    },

    updateConversationRecipientProfileName: function (activeConversationID, recipientProfileName){
        var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        conversationsDatabase[activeConversationID].recipientProfileName = recipientProfileName;
        databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
    },

    deleteAllConversations: function (){
        databaseManagementFunctions.clearDatabase(constants.routes.conversationsDatabase);
    },

    getAllActiveConversations: function(){
        const conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        var allActiveConversations = {};
        for (var conversationID in conversationsDatabase){
            if (conversationsDatabase[conversationID].active == true){
                allActiveConversations[conversationID] = conversationsDatabase[conversationID];
                if (allActiveConversations[conversationID]['assignedAgentID'] != null){
                    allActiveConversations[conversationID]['assignedAgentID'] = agentsDatabase[allActiveConversations[conversationID]['assignedAgentID']]['agentName'];
                } else {
                    allActiveConversations[conversationID]['assignedAgentID'] = 'Sin asignar';
                }
            }
        }
        return allActiveConversations;
    },

    getAllClosedConversations: function(){
        const conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        var allClosedConversations = {};
        for (var conversationID in conversationsDatabase){
            if (conversationsDatabase[conversationID].active == false){
                allClosedConversations[conversationID] = conversationsDatabase[conversationID];
                allClosedConversations[conversationID]['assignedAgentID'] = agentsDatabase[allClosedConversations[conversationID]['assignedAgentID']]['agentName'];
            }
        }
        return allClosedConversations;
    },

    getAllPendingConversations: function(){
        const conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        var allPendingConversations = {};
        for (var conversationID in conversationsDatabase){
            if (conversationsDatabase[conversationID].assignedAgentID == null){
                allPendingConversations[conversationID] = conversationsDatabase[conversationID];
            }
        }
        return allPendingConversations;
    },

    getAllStoreConversations: function(){
      const storesDatabase = databaseManagementFunctions.readDatabase(constants.routes.sucursalesDatabase);
      return storesDatabase;
    },

    closeConversation: function (conversationID, conversationStatus, amount){
        var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        conversationsDatabase[conversationID].active = false;
        conversationsDatabase[conversationID].endDate = generalFunctions.getCurrentDateAsStringWithFormat();
        conversationsDatabase[conversationID].endDate = generalFunctions.getCurrentDateAsStringWithFormat();
        conversationsDatabase[conversationID].endHour = generalFunctions.getCurrentHourAsStringWithFormat();
        conversationsDatabase[conversationID]['status'] = conversationStatus;
        conversationsDatabase[conversationID]['amount'] = amount;
        conversationsDatabase[conversationID]['endDateObject'] = generalFunctions.getCurrentDateObject();

        const index = agentsDatabase[conversationsDatabase[conversationID].assignedAgentID].agentActiveConversations.indexOf(conversationID);
        if (index > -1) { 
            agentsDatabase[conversationsDatabase[conversationID].assignedAgentID].agentActiveConversations.splice(index, 1);
        }
        agentsDatabase[conversationsDatabase[conversationID].assignedAgentID].agentFinishedConversations.push(conversationID);
        databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
        databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
    },
 
    getTotalProfit: function (){
        var totalProfit = 0;
        var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        for (var conversationID in conversationsDatabase){
            totalProfit = totalProfit + parseInt(conversationsDatabase[conversationID].amount);
        }
        return totalProfit;
    },

    
    getFilteredConversations: function (startDate, endDate, agent, status){
      var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
      var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);

      if ((startDate!=null) && (endDate!=null)){
        const startDateObject = new Date(startDate);
        const endDateObject = new Date(endDate);
        for (var conversationID in conversationsDatabase){
          if (status == 'Finalizadas'){
            const conversationEndDateObject = new Date(conversationsDatabase[conversationID]['endDateObject']);
            if (!((conversationEndDateObject > startDateObject) && (conversationEndDateObject < endDateObject))){
              delete conversationsDatabase[conversationID];
            }
          } else {
            const conversationStartDateObject = new Date(conversationsDatabase[conversationID]['startDateObject']);
            if (!((conversationStartDateObject > startDateObject) && (conversationStartDateObject < endDateObject))){
              delete conversationsDatabase[conversationID];
            }
          }
        }
      }

      if (agent!=null){
        var filteredAgentID = '';
        for (var agentID in agentsDatabase){
          if (agentsDatabase[agentID]['agentName'] == agent){
            filteredAgentID = agentID
          }
        }
        for (var conversationID in conversationsDatabase){
          if (conversationsDatabase[conversationID]['assignedAgentID'] != filteredAgentID){
            delete conversationsDatabase[conversationID];
          }
        }
      }
  },

}