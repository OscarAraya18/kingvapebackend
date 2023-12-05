// INTERNAL MODULES IMPORT
const constants = require('../constants.js');
const server = require('../server.js');

// WEBSOCKET SERVER SETUP
const WebSocket = require('ws');
const backendWebsocketServer = new WebSocket.Server({server});

module.exports = {
  sendWebsocketMessage: function(websocketMessageID, websocketMessageContent){
    backendWebsocketServer.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const backendWebsocketMessage = {websocketMessageID: websocketMessageID, websocketMessageContent: websocketMessageContent};
        client.send(JSON.stringify(backendWebsocketMessage));
      }
    });
  }
}