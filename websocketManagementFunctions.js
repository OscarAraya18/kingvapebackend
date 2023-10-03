const WebSocket = require('ws');

module.exports = {
    updateAgentStatus: function(websocketConnection, agentID, agentStatus){
        websocketConnection.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                const messageToSendByWebsocket = 
                {
                    agentStatusChanged: true,
                    agentID: agentID,
                    agentStatus: agentStatus
                }
                client.send(JSON.stringify(messageToSendByWebsocket));
            }
        });
    },
    receiveWhatsappMessage: function (websocketConnection, messageInformation, conversationID, agentID, messageID){
        websocketConnection.clients.forEach(function each(client) {
          console.log(client);
            if (client.readyState === WebSocket.OPEN) {
                const messageToSendByWebsocket = 
                {
                    transfer: false,
                    agentID: agentID,
                    conversationID: conversationID,
                    messageID: messageID,
                    messageInformation: messageInformation
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

    startNewConversation: function (websocketConnection, conversationInformation, conversationID, agentID){
        websocketConnection.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                const messageToSendByWebsocket = 
                {
                    transfer: false,
                    agentID: agentID,
                    conversationID: conversationID,
                    conversationInformation: conversationInformation
                }
                client.send(JSON.stringify(messageToSendByWebsocket));
            }
        });
    },

    transferConversation: function (websocketConnection, conversationInformation, conversationID, agentID, agentName, pendingConversation){
        websocketConnection.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                const messageToSendByWebsocket = 
                {
                    pendingConversation: true,
                    transfer: true,
                    agentID: agentID,
                    agentName: agentName,
                    conversationID: conversationID,
                    conversationInformation: conversationInformation
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
                    pendingConversation: true,
                    pendingConversationID: pendingConversationID,
                    recipientPhoneNumber: recipientPhoneNumber,
                    startDate: startDate,
                    startHour: startHour
                }
                client.send(JSON.stringify(messageToSendByWebsocket));
            }
        });
    }
}