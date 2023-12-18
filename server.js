const constants = require('./constants.js');

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');


const backendHttpRequestServer = express();
backendHttpRequestServer.use(cors());
backendHttpRequestServer.use(function(httpRequest, httpResponse, next) {
  httpResponse.setHeader('Access-Control-Allow-Origin', '*');
  httpResponse.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  httpResponse.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  httpResponse.setHeader('Access-Control-Max-Age', '1728000');
  next();
});

backendHttpRequestServer.all('*', function(httpRequest, httpResponse, next) {
    var responseSettings = {
      "AccessControlAllowOrigin": httpRequest.headers.origin,
      "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
      "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
      "AccessControlAllowCredentials": true
  };

  httpResponse.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
  httpResponse.header("Access-Control-Allow-Origin",  responseSettings.AccessControlAllowOrigin);
  httpResponse.header("Access-Control-Allow-Headers", (httpRequest.headers['access-control-request-headers']) ? httpRequest.headers['access-control-request-headers'] : "x-requested-with");
  httpResponse.header("Access-Control-Allow-Methods", (httpRequest.headers['access-control-request-method']) ? httpRequest.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);

  console.log(httpRequest);
  console.log(httpResponse);
  if ('OPTIONS' == httpRequest.method) {
    httpResponse.send(200);
  }
  else {
      next();
  }
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