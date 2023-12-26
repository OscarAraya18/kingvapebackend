const constants = require('./constants.js');

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');


const backendHttpRequestServer = express();
backendHttpRequestServer.use(cors());
backendHttpRequestServer.use(function(httpRequest, httpResponse, next) {
  httpResponse.header('Access-Control-Allow-Origin', '*');
  httpResponse.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  httpResponse.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  httpResponse.header('Access-Control-Max-Age', '1728000');
  next();
});


backendHttpRequestServer.use(express.json({limit: '50mb'}));


const server = backendHttpRequestServer.listen(constants.backendHttpRequestServerConnectionPort);
module.exports = server;

const backendAgentHttpRequestServer = require('./agentModule/agentServer.js');
const backendContactHttpRequestServer = require('./contactModule/contactServer.js');
const backendWhatsappHttpRequestServer = require('./whatsappModule/whatsappServer.js');
const backendStoreHttpRequestServer = require('./storeModule/storeServer.js');
const backendDashboardHttpRequestServer = require('./dashboardModule/dashboardServer.js');


backendHttpRequestServer.use(backendAgentHttpRequestServer);
backendHttpRequestServer.use(backendContactHttpRequestServer);
backendHttpRequestServer.use(backendWhatsappHttpRequestServer);
backendHttpRequestServer.use(backendStoreHttpRequestServer);
backendHttpRequestServer.use(backendDashboardHttpRequestServer);