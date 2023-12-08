const constants = require('./constants.js');

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const backendHttpRequestServer = express();
backendHttpRequestServer.use(cors({origin: 'https://souqcr.com'}));
backendHttpRequestServer.options('*', cors());

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
