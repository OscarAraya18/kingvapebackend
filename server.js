const constants = require('./constants.js');

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const backendHttpRequestServer = express();
backendHttpRequestServer.use(cors({origin: '*'}));
backendHttpRequestServer.options('*', cors());

backendHttpRequestServer.use(function(httpRequest, httpResponse, next) {
  httpResponse.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  httpResponse.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  httpResponse.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  httpResponse.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

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
