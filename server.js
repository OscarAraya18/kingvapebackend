const constants = require('./constants.js');

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');


const backendHttpRequestServer = express();
const corsOptions = {
  origin: 'https://souqcr.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 204, // Respond with 204 (No Content) for preflight requests
};
backendHttpRequestServer.use(cors(corsOptions));
backendHttpRequestServer.options('*', cors());
backendHttpRequestServer.use(function(httpRequest, httpResponse, next) {
  httpResponse.header('Access-Control-Allow-Origin', '*');
  httpResponse.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  httpResponse.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  httpResponse.header("Access-Control-Allow-credentials", true);
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