const WebSocket = require('ws');

module.exports = {
  updateAgentStatus: function(websocketConnection, agentID, agentStatus){
    websocketConnection.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const messageToSendByWebsocket = 
        {
          websocketMessageID: 'updateAgentStatus',
          agentID: agentID,
          agentStatus: agentStatus
        }
        client.send(JSON.stringify(messageToSendByWebsocket));
      }
    });
  },

  receiveWhatsappMessage: function (websocketConnection, messageInformation, conversationID, agentID, messageID){
    websocketConnection.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          const messageToSendByWebsocket = 
          {
            websocketMessageID: 'receiveWhatsappMessage',
            agentID: agentID,
            conversationID: conversationID,
            messageID: messageID,
            messageInformation: messageInformation
          }
          client.send(JSON.stringify(messageToSendByWebsocket));
        }
    });
  },

  receivePendingConversation: function (websocketConnection, pendingConversationID, recipientPhoneNumber, startDate, startHour){
    websocketConnection.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const messageToSendByWebsocket = 
        {
          websocketMessageID: 'receivePendingConversation',
          pendingConversationID: pendingConversationID,
          recipientPhoneNumber: recipientPhoneNumber,
          startDate: startDate,
          startHour: startHour
        }
        client.send(JSON.stringify(messageToSendByWebsocket));
      }
    });
  },

  transferConversation: function (websocketConnection, conversationInformation, conversationID, agentID, agentName){
    websocketConnection.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const messageToSendByWebsocket = 
        {
          websocketMessageID: 'transferConversation',
          agentID: agentID,
          agentName: agentName,
          conversationID: conversationID,
          conversationInformation: conversationInformation
        }
        client.send(JSON.stringify(messageToSendByWebsocket));
      }
    });
  },

  grabPendingConversation: function (websocketConnection, conversationInformation, conversationID, agentID, agentName){
    websocketConnection.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const messageToSendByWebsocket = 
        {
          websocketMessageID: 'grabPendingConversation',
          agentID: agentID,
          agentName: agentName,
          conversationID: conversationID,
          conversationInformation: conversationInformation
        }
        client.send(JSON.stringify(messageToSendByWebsocket));
      }
    });
  },

  grabStoreConversation: function (websocketConnection, conversationInformation, conversationID, agentID, agentName){
    websocketConnection.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const messageToSendByWebsocket = 
        {
          websocketMessageID: 'grabStoreConversation',
          agentID: agentID,
          agentName: agentName,
          conversationID: conversationID,
          conversationInformation: conversationInformation
        }
        client.send(JSON.stringify(messageToSendByWebsocket));
    }
    });
  },

  receiveStoreMessage: function (websocketConnection, information){
    websocketConnection.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const messageToSendByWebsocket = 
        {
          websocketMessageID: 'receiveStoreMessage',
          storeName: information.storeName,
          recipientPhoneNumber: information.recipientPhoneNumber,
          recipientProfileName: information.recipientProfileName,
          startHour: information.startHour,
          startDate: information.startDate,
          messageID: information.messageID,
          clientOrder: information.clientOrder,
          clientID: information.clientID
        }
        client.send(JSON.stringify(messageToSendByWebsocket));
      }
    });
  },

  requestTransfer: function (websocketConnection, newAgentID, previousAgentID, previousAgentName, activeConversationID, products){
    websocketConnection.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const messageToSendByWebsocket = 
        {
          websocketMessageID: 'requestTransfer',
          previousAgentName: previousAgentName, 
          newAgentID: newAgentID,
          previousAgentID: previousAgentID,
          activeConversationID: activeConversationID,
          products: products
        }
        client.send(JSON.stringify(messageToSendByWebsocket));
      }
    });
  },

  acceptTransfer: function (websocketConnection, agentToNotify){
    websocketConnection.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const messageToSendByWebsocket = 
        {
          websocketMessageID: 'acceptTransfer',
          agentToNotify: agentToNotify
        }
        client.send(JSON.stringify(messageToSendByWebsocket));
      }
    });
  },

  startNewConversation: function (websocketConnection, conversationInformation, conversationID, agentID){
    websocketConnection.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const messageToSendByWebsocket = 
        {
          websocketMessageID: 'startNewConversation',
          agentID: agentID,
          conversationID: conversationID,
          conversationInformation: conversationInformation
        }
        client.send(JSON.stringify(messageToSendByWebsocket));
      }
    });
  },


    addMessageToRanking: function(websocketConnection, agentID){
      websocketConnection.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
              const messageToSendByWebsocket = 
              {
                  ranking: true,
                  type: 'message',
                  agentID: agentID,
              }
              client.send(JSON.stringify(messageToSendByWebsocket));
          }
      });
    },

    addConversationToRanking: function(websocketConnection, agentID){
      websocketConnection.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
              const messageToSendByWebsocket = 
              {
                  ranking: true,
                  type: 'conversation',
                  agentID: agentID,
              }
              client.send(JSON.stringify(messageToSendByWebsocket));
          }
      });
    },

    addSaleToRanking: function(websocketConnection, agentID){
      websocketConnection.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
              const messageToSendByWebsocket = 
              {
                  ranking: true,
                  type: 'sale',
                  agentID: agentID,
              }
              client.send(JSON.stringify(messageToSendByWebsocket));
          }
      });
    },

    sendWhatsappMessage: function (websocketConnection, conversationID, messageInformation){
        websocketConnection.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                const messageToSendByWebsocket = 
                {
                    sendingMessage: true,
                    transfer: false,
                    conversationID: conversationID,
                    messageInformation: messageInformation
                }
                client.send(JSON.stringify(messageToSendByWebsocket));
            }
        });
    },

    
}