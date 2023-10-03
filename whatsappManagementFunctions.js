const constants = require('./constants.js');
const websocketManagementFunctions = require('./websocketManagementFunctions.js');
const generalFunctions = require('./generalFunctions.js');
const conversationsManagementFunctions = require('./conversationsManagementFunctions.js');
const agentsManagementFunctions = require('./agentsManagementFunctions.js');

const axios = require('axios');
const https = require('follow-redirects').https;

const fs = require('fs');
const { exec } = require("child_process");
const databaseManagementFunctions = require('./databaseManagementFunctions.js');

module.exports = {

    sendWhatsappTextMessage: function(requestQuery, frontendResponse, websocketConnection){
        var httpOptionsToSendWhatsappTextMessage = {'method': 'POST', 'hostname': 'graph.facebook.com', 'path': '/' + constants.credentials.apiVersion + '/' + constants.credentials.phoneNumberID + '/messages', 'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + constants.credentials.apiKey}};
        var httpDataToSendWhatsappTextMessage = JSON.stringify({'messaging_product': 'whatsapp', 'to': requestQuery['recipientPhoneNumber'], 'text': {'body': requestQuery['messageContent']}});
        var httpRequestToSendWhatsappTextMessage = https.request(httpOptionsToSendWhatsappTextMessage, function (httpResponseToSendWhatsappTextMessage) {
            var httpResponsePartsToSendWhatsappTextMessage = [];
            httpResponseToSendWhatsappTextMessage.on('data', function (httpResponsePartToSendWhatsappTextMessage) {httpResponsePartsToSendWhatsappTextMessage.push(httpResponsePartToSendWhatsappTextMessage);});
            httpResponseToSendWhatsappTextMessage.on('end', function (httpResponsePartToSendWhatsappTextMessage) {
                httpResponsePartsToSendWhatsappTextMessage.push(httpResponsePartToSendWhatsappTextMessage);
                var activeConversationID = conversationsManagementFunctions.getActiveConversationID(requestQuery['recipientPhoneNumber']);
                if (activeConversationID == null){
                    const newConversationID = conversationsManagementFunctions.createConversation(requestQuery['recipientPhoneNumber'], '');
                    agentsManagementFunctions.assignNewConversationToAgentWithLessActiveConversations(newConversationID, requestQuery['agentID']);
                }
                activeConversationID = conversationsManagementFunctions.getActiveConversationID(requestQuery['recipientPhoneNumber']);
                var textMessage = '';
                if (requestQuery['sendedProduct'] == '1'){
                    textMessage = requestQuery['messageContent'].split('*').join('');
                } else {
                    textMessage = requestQuery['messageContent']
                }
                const messageInformation = 
                {
                    messageID: '',
                    owner: 'agent',
                    messageSentDate: generalFunctions.getCurrentDateAsStringWithFormat(),
                    messageSentHour: generalFunctions.getCurrentHourAsStringWithFormat(),
                    messageDeliveryDate: null,
                    messageDeliveryHour: null,
                    messageReadDate: null,
                    messageReadHour: null,
                    messageStatus: 'sent',
                    messageType: 'text',
                    messageContent: textMessage,
                    dateObject: new Date().toString()
                }
                websocketManagementFunctions.sendWhatsappMessage(websocketConnection, activeConversationID, messageInformation);
                conversationsManagementFunctions.addMessageToConversation(activeConversationID, messageInformation);
                frontendResponse.end();
            });
            httpResponseToSendWhatsappTextMessage.on('error', function (error) {console.error(error);});
        });
        httpRequestToSendWhatsappTextMessage.write(httpDataToSendWhatsappTextMessage);
        httpRequestToSendWhatsappTextMessage.end();
    },

    sendWhatsappMassMessage: function(requestQuery, frontendResponse){
        for (var recipientPhoneNumberIndex in requestQuery.recipientPhoneNumbers){
            var httpOptionsToSendWhatsappTextMessage = {'method': 'POST', 'hostname': 'graph.facebook.com', 'path': '/' + constants.credentials.apiVersion + '/' + constants.credentials.phoneNumberID + '/messages', 'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + constants.credentials.apiKey}};
            var httpDataToSendWhatsappTextMessage = JSON.stringify({'messaging_product': 'whatsapp', 'to': requestQuery.recipientPhoneNumbers[recipientPhoneNumberIndex], 'text': {'body': requestQuery.messageContent}});
            var httpRequestToSendWhatsappTextMessage = https.request(httpOptionsToSendWhatsappTextMessage, function (httpResponseToSendWhatsappTextMessage) {
                var httpResponsePartsToSendWhatsappTextMessage = [];
                httpResponseToSendWhatsappTextMessage.on('data', function (httpResponsePartToSendWhatsappTextMessage) {httpResponsePartsToSendWhatsappTextMessage.push(httpResponsePartToSendWhatsappTextMessage);});
                httpResponseToSendWhatsappTextMessage.on('end', function (httpResponsePartToSendWhatsappTextMessage) {
                    httpResponsePartsToSendWhatsappTextMessage.push(httpResponsePartToSendWhatsappTextMessage);
                    frontendResponse.end();
                });
                httpResponseToSendWhatsappTextMessage.on('error', function (error) {console.error(error);});
            });
            httpRequestToSendWhatsappTextMessage.write(httpDataToSendWhatsappTextMessage);
            httpRequestToSendWhatsappTextMessage.end();
        }
        frontendResponse.end();
    },

    sendWhatsappMediaMessageURL: async function(requestQuery, frontendResponse, websocketConnection){
        var types = {
            'application/pdf': 'document',
            'image/png': 'image',
            'video/3gp': 'video',
            'image/webp': 'sticker'
        }
        exec(`curl -X  POST "https://graph.facebook.com/v17.0/` + constants.credentials.phoneNumberID + `/messages" -H "Authorization: Bearer `+constants.credentials.apiKey+`" -H "Content-Type: application/json" -d "{messaging_product: 'whatsapp', recipient_type: 'individual', to: '`+requestQuery['recipientPhoneNumber']+`', type: '` + types[requestQuery['mediaType']] + `', ` + types[requestQuery['mediaType']] + ` : {link: '` +requestQuery['mediaURL']+`'}}"`, (error, stdout, stderr) => {
            if (error) {
                //console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                //console.log(`stderr: ${stderr}`);
                //return;
            }
            console.log(`stdout: ${stdout}`);

            var activeConversationID = conversationsManagementFunctions.getActiveConversationID(requestQuery['recipientPhoneNumber']);
            if (activeConversationID == null){
                conversationsManagementFunctions.createConversation(requestQuery['recipientPhoneNumber'], '');
            }
            activeConversationID = conversationsManagementFunctions.getActiveConversationID(requestQuery['recipientPhoneNumber']);
            const messageInformation = 
            {
                messageID: '',
                owner: 'agent',
                messageSentDate: generalFunctions.getCurrentDateAsStringWithFormat(),
                messageSentHour: generalFunctions.getCurrentHourAsStringWithFormat(),
                messageDeliveryDate: null,
                messageDeliveryHour: null,
                messageReadDate: null,
                messageReadHour: null,
                messageStatus: 'sent',
                messageType: types[requestQuery['mediaType']],
                messageContent: 
                {
                    'isBase64': '0',
                    'mediaExtension': requestQuery['mediaType'],
                    'mediaContent': requestQuery['mediaURL']
                },
                dateObject: new Date().toString()

            }
            websocketManagementFunctions.sendWhatsappMessage(websocketConnection, activeConversationID, messageInformation);
            conversationsManagementFunctions.addMessageToConversation(activeConversationID, messageInformation);
            frontendResponse.end();
        });
    },

    sendWhatsappMediaMessageURL: async function(requestQuery, frontendResponse, websocketConnection){
        var types = {
            'application/pdf': 'document',
            'image/png': 'image',
            'video/3gp': 'video',
            'image/webp': 'sticker'
        }
        exec(`curl -X  POST "https://graph.facebook.com/v17.0/` + constants.credentials.phoneNumberID + `/messages" -H "Authorization: Bearer `+constants.credentials.apiKey+`" -H "Content-Type: application/json" -d "{messaging_product: 'whatsapp', recipient_type: 'individual', to: '`+requestQuery['recipientPhoneNumber']+`', type: '` + types[requestQuery['mediaType']] + `', ` + types[requestQuery['mediaType']] + ` : {link: '` +requestQuery['mediaURL']+`'}}"`, (error, stdout, stderr) => {
            if (error) {
                //console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                //console.log(`stderr: ${stderr}`);
                //return;
            }
            console.log(`stdout: ${stdout}`);

            var activeConversationID = conversationsManagementFunctions.getActiveConversationID(requestQuery['recipientPhoneNumber']);
            if (activeConversationID == null){
                conversationsManagementFunctions.createConversation(requestQuery['recipientPhoneNumber'], '');
            }
            activeConversationID = conversationsManagementFunctions.getActiveConversationID(requestQuery['recipientPhoneNumber']);
            const messageInformation = 
            {
                messageID: '',
                owner: 'agent',
                messageSentDate: generalFunctions.getCurrentDateAsStringWithFormat(),
                messageSentHour: generalFunctions.getCurrentHourAsStringWithFormat(),
                messageDeliveryDate: null,
                messageDeliveryHour: null,
                messageReadDate: null,
                messageReadHour: null,
                messageStatus: 'sent',
                messageType: types[requestQuery['mediaType']],
                messageContent: 
                {
                    'isBase64': '0',
                    'mediaExtension': requestQuery['mediaType'],
                    'mediaContent': requestQuery['mediaURL']
                },
                dateObject: new Date().toString()

            }
            websocketManagementFunctions.sendWhatsappMessage(websocketConnection, activeConversationID, messageInformation);
            conversationsManagementFunctions.addMessageToConversation(activeConversationID, messageInformation);
            frontendResponse.end();
        });
    },

    sendWhatsappMediaMessage: async function(requestQuery, frontendResponse, websocketConnection){
        var extensions = {
            'application/pdf': '.pdf',
            'image/png': '.png',
            'video/3gp': '.3gp',
        }

        var types = {
            'application/pdf': 'document',
            'image/png': 'image',
            'video/3gp': 'video'
        }

        fs.writeFileSync('a'+extensions[requestQuery['mediaType']], requestQuery['mediaContent'].split(',')[1],'base64');

        exec(`curl -X POST "https://graph.facebook.com/v17.0/` + constants.credentials.phoneNumberID + `/media" -H "Authorization: Bearer `+constants.credentials.apiKey+`" -F "file=@a` + extensions[requestQuery['mediaType']] + `" -F "type=` + requestQuery['mediaType'] + `" -F "messaging_product="whatsapp"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                //console.log(`stderr: ${stderr}`);
                //return;
            }
            console.log(JSON.parse(stdout));
            exec(`curl -X  POST "https://graph.facebook.com/v17.0/` + constants.credentials.phoneNumberID + `/messages" -H "Authorization: Bearer `+constants.credentials.apiKey+`" -H "Content-Type: application/json" -d "{messaging_product: 'whatsapp', recipient_type: 'individual', to: '`+requestQuery['recipientPhoneNumber']+`', type: '` + types[requestQuery['mediaType']] + `', ` + types[requestQuery['mediaType']] + ` : {id: ` +JSON.parse(stdout).id+`}}"`, (error, stdout, stderr) => {
                if (error) {
                    //console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    //console.log(`stderr: ${stderr}`);
                    //return;
                }
                console.log(`stdout: ${stdout}`);

                var activeConversationID = conversationsManagementFunctions.getActiveConversationID(requestQuery['recipientPhoneNumber']);
                if (activeConversationID == null){
                    conversationsManagementFunctions.createConversation(requestQuery['recipientPhoneNumber'], '');
                }
                activeConversationID = conversationsManagementFunctions.getActiveConversationID(requestQuery['recipientPhoneNumber']);
                const messageInformation = 
                {
                    messageID: '',
                    owner: 'agent',
                    messageSentDate: generalFunctions.getCurrentDateAsStringWithFormat(),
                    messageSentHour: generalFunctions.getCurrentHourAsStringWithFormat(),
                    messageDeliveryDate: null,
                    messageDeliveryHour: null,
                    messageReadDate: null,
                    messageReadHour: null,
                    messageStatus: 'sent',
                    messageType: types[requestQuery['mediaType']],
                    messageContent: 
                    {
                        'isBase64': '1',
                        'mediaExtension': requestQuery['mediaType'],
                        'mediaContent': requestQuery['mediaContent'].split(',')[1]
                    },
                    dateObject: new Date().toString()
                }
                websocketManagementFunctions.sendWhatsappMessage(websocketConnection, activeConversationID, messageInformation);
                conversationsManagementFunctions.addMessageToConversation(activeConversationID, messageInformation);
                frontendResponse.end();
            });

        });
       
        
    },

    updateWhatsappMessageStatus: function(requestToUpdateWhatsappMessageStatus, frontendResponse){
        /*
        const messageID = requestToUpdateWhatsappMessageStatus.body['entry'][0]['changes'][0]['value']['statuses'][0]['id'];
        const messageStatus = requestToUpdateWhatsappMessageStatus.body['entry'][0]['changes'][0]['value']['statuses'][0]['status'];
        const recipientPhoneNumber = requestToUpdateWhatsappMessageStatus.body['entry'][0]['changes'][0]['value']['statuses'][0]['recipient_id'];
        var activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
        if (activeConversationID == null){
            conversationsManagementFunctions.createConversation(recipientPhoneNumber, '');
        }
        activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
        if (messageStatus == 'sent'){
            conversationsManagementFunctions.updateConversationMessageStatus(activeConversationID, messageID, messageStatus);
            console.log('Message "' + messageID + '" sended to the conversation "' + activeConversationID + '"');
            frontendResponse.end('Message "' + messageID + '" sended to the conversation "' + activeConversationID + '"');
        } else if (messageStatus == 'delivered'){
            conversationsManagementFunctions.updateConversationMessageStatus(activeConversationID, messageID, messageStatus);
            console.log('Message "' + messageID + '" delivered to the conversation "' + activeConversationID + '"');
            frontendResponse.end('Message "' + messageID + '" delivered to the conversation "' + activeConversationID + '"');
        } else if (messageStatus == 'read'){
            conversationsManagementFunctions.updateConversationMessageStatus(activeConversationID, messageID, messageStatus);
            console.log('Message "' + messageID + '" readed to the conversation "' + activeConversationID + '"');
            frontendResponse.end('Message "' + messageID + '" readed to the conversation "' + activeConversationID + '"');
        }
        */
    },

    receiveWhatsappMessage: async function(requestToReceiveWhatsappMesage, frontendResponse, websocketConnection){
        const recipientPhoneNumber = requestToReceiveWhatsappMesage.body['entry'][0]['changes'][0]['value']['messages'][0]['from'];
        const recipientProfileName = requestToReceiveWhatsappMesage.body['entry'][0]['changes'][0]['value']['contacts'][0]['profile']['name'];
        var messageID = requestToReceiveWhatsappMesage.body['entry'][0]['changes'][0]['value']['messages'][0]['id'];
        const messageType = requestToReceiveWhatsappMesage.body['entry'][0]['changes'][0]['value']['messages'][0]['type'];
        const messageContentFromWhatsappAPI = requestToReceiveWhatsappMesage.body['entry'][0]['changes'][0]['value']['messages'][0];
        var messageInformationToSaveOnDatabase = 
        {
            messageID: messageID,
            owner: 'client',
            messageReceivedDate: generalFunctions.getCurrentDateAsStringWithFormat(),
            messageReceivedHour: generalFunctions.getCurrentHourAsStringWithFormat(),
            messageStatus: 'received',
            messageType: messageType
        };
        if (messageType == 'text'){
            this.addWhatsappTextMessageInformation(messageContentFromWhatsappAPI, messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection);
        } else if (messageType == 'location') {
            this.addWhatsappLocationMessageInformation(messageContentFromWhatsappAPI, messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection);
        } else if (messageType == 'contacts') {
            this.addWhatsappContactMessageInformation(messageContentFromWhatsappAPI, messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection);
        } else if (['image','audio','video','document','sticker'].includes(messageType)) {
            this.addWhatsappMediaMessageInformation(messageContentFromWhatsappAPI, messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection);
        } else {
            messageInformationToSaveOnDatabase['messageContent'] = null;
            this.sendReceivedWhatsappMessageToAgents(messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection);
        }
    },

    addWhatsappTextMessageInformation: function(messageContentFromWhatsappAPI, messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection){
        messageInformationToSaveOnDatabase['messageContent'] = messageContentFromWhatsappAPI[messageInformationToSaveOnDatabase.messageType]['body'];
        this.sendReceivedWhatsappMessageToAgents(messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection);
    },

    addWhatsappContactMessageInformation: function(messageContentFromWhatsappAPI, messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection){
        messageInformationToSaveOnDatabase['messageContent'] = 
        {
            contactName: messageContentFromWhatsappAPI[messageInformationToSaveOnDatabase.messageType][0]['name']['formatted_name'],
            contactPhoneNumber: messageContentFromWhatsappAPI[messageInformationToSaveOnDatabase.messageType][0]['phones'][0]['wa_id']
        };
        this.sendReceivedWhatsappMessageToAgents(messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection);
    },

    addWhatsappLocationMessageInformation: function(messageContentFromWhatsappAPI, messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection){
        messageInformationToSaveOnDatabase['messageContent'] = 
        {
            locationLatitude: messageContentFromWhatsappAPI[messageInformationToSaveOnDatabase.messageType]['latitude'],
            locationLongitude: messageContentFromWhatsappAPI[messageInformationToSaveOnDatabase.messageType]['longitude']
        };
        this.sendReceivedWhatsappMessageToAgents(messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection);
    },

    addWhatsappMediaMessageInformation: async function(messageContentFromWhatsappAPI, messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection){
        var httpRequesOptionsToGetMediaURL = {'method': 'GET', 'hostname': 'graph.facebook.com', 'path': '/' + constants.credentials.apiVersion + '/' + messageContentFromWhatsappAPI[messageInformationToSaveOnDatabase.messageType]['id'] + '/', 'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + constants.credentials.apiKey}};
        var httpRequestToGetMediaURL = https.request(httpRequesOptionsToGetMediaURL, function (httpResponseToGetMediaURL) {
            var responseParts = [];
            httpResponseToGetMediaURL.on('data', function (responsePart) {responseParts.push(responsePart);});
            httpResponseToGetMediaURL.on('end', function () {
                var mediaURL = JSON.parse(Buffer.concat(responseParts).toString())['url'];
                var httpRequestOptionsToDownloadMedia = {'method': 'get', 'url': mediaURL, 'headers': {'Authorization': 'Bearer ' + constants.credentials.apiKey}, 'responseType': 'arraybuffer'};
                axios(httpRequestOptionsToDownloadMedia).then((httpResponseToDownloadMedia) => {
                    const base64 = btoa(new Uint8Array(httpResponseToDownloadMedia.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                    messageInformationToSaveOnDatabase['messageContent'] = 
                    {
                        mediaID: messageContentFromWhatsappAPI[messageInformationToSaveOnDatabase.messageType]['id'],
                        mediaName: messageContentFromWhatsappAPI[messageInformationToSaveOnDatabase.messageType]['filename'],
                        mediaExtension: messageContentFromWhatsappAPI[messageInformationToSaveOnDatabase.messageType]['mime_type'],
                        mediaURL: mediaURL,
                        mediaContent: base64
                    };
                    messageInformationToSaveOnDatabase['dateObject'] = new Date().toString();
                    var activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
                    if (activeConversationID == null){
                        const newConversationID = conversationsManagementFunctions.createConversation(recipientPhoneNumber, recipientProfileName);
                        agentsManagementFunctions.assignNewConversationToAgentWithLessActiveConversations(newConversationID, null);
                    }
                    activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
                    const assignedAgentID = agentsManagementFunctions.getAssignedAgentToConversationID(activeConversationID);
                    conversationsManagementFunctions.updateConversationRecipientProfileName(activeConversationID, recipientProfileName);
                    messageID = conversationsManagementFunctions.addMessageToConversation(activeConversationID, messageInformationToSaveOnDatabase);
                    console.log('Message "' + messageID + '" received to the conversation "' + activeConversationID + '"');
                    frontendResponse.end('Message "' + messageID + '" received to the conversation "' + activeConversationID + '"');
                    websocketManagementFunctions.receiveWhatsappMessage(websocketConnection, messageInformationToSaveOnDatabase, activeConversationID, assignedAgentID, messageID);
                })
                .catch(function (error) {
                    console.log(error);
                });
            });
            httpResponseToGetMediaURL.on('error', function (error) {console.log(error);});
        });
        httpRequestToGetMediaURL.end();
    },

    sendReceivedWhatsappMessageToAgents: function(messageInformationToSaveOnDatabase, recipientPhoneNumber, recipientProfileName, frontendResponse, websocketConnection){
        var activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
        var newConversation = false;
        if (activeConversationID == null){
            const newConversationID = conversationsManagementFunctions.createConversation(recipientPhoneNumber, recipientProfileName);
            agentsManagementFunctions.assignNewConversationToAgentWithLessActiveConversations(newConversationID, null);
            newConversation = true;
        }
        messageInformationToSaveOnDatabase['dateObject'] = new Date().toString();
        activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
        const assignedAgentID = agentsManagementFunctions.getAssignedAgentToConversationID(activeConversationID);
        conversationsManagementFunctions.updateConversationRecipientProfileName(activeConversationID, recipientProfileName);
        messageID = conversationsManagementFunctions.addMessageToConversation(activeConversationID, messageInformationToSaveOnDatabase);
        console.log('Message "' + messageID + '" received to the conversation "' + activeConversationID + '"');
        frontendResponse.end('Message "' + messageID + '" received to the conversation "' + activeConversationID + '"');
        if (newConversation == true){
            if (assignedAgentID){
                this.sendAutomaticWhatsappMediaMessage(recipientPhoneNumber, databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase)[assignedAgentID].welcomeImage, databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase)[assignedAgentID].welcomeMessage, assignedAgentID,  websocketConnection)
            } else {
                this.sendAutomaticWhatsappTextMessage(recipientPhoneNumber, 'Gracias por escribir a KingVape. De momento, todos nuestros agentes se encuentran fuera de servicio. Estimado cliente, lo atenderemos lo más pronto posible, muchas gracias por la espera!', websocketConnection);
                websocketManagementFunctions.receivePendingConversation(websocketConnection, activeConversationID, recipientPhoneNumber, generalFunctions.getCurrentDateAsStringWithFormat(), generalFunctions.getCurrentHourAsStringWithFormat());
            }
        } else {
            websocketManagementFunctions.receiveWhatsappMessage(websocketConnection, messageInformationToSaveOnDatabase, activeConversationID, assignedAgentID, messageID);
        }
    },

    sendAutomaticWhatsappMediaMessage: function(recipientPhoneNumber, mediaContent, messageContent, assignedAgentID, websocketConnection){
        fs.writeFileSync('a.png', mediaContent.split(',')[1],'base64');

        exec(`curl -X POST "https://graph.facebook.com/v17.0/` + constants.credentials.phoneNumberID + `/media" -H "Authorization: Bearer `+constants.credentials.apiKey+`" -F "file=@a.png" -F "type=image" -F "messaging_product="whatsapp"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                //console.log(`stderr: ${stderr}`);
                //return;
            }
            console.log(JSON.parse(stdout));
            exec(`curl -X  POST "https://graph.facebook.com/v17.0/` + constants.credentials.phoneNumberID + `/messages" -H "Authorization: Bearer `+constants.credentials.apiKey+`" -H "Content-Type: application/json" -d "{messaging_product: 'whatsapp', recipient_type: 'individual', to: '`+recipientPhoneNumber+`', type: 'image', image : {id: ` +JSON.parse(stdout).id+`}}"`, (error, stdout, stderr) => {
                if (error) {
                    //console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    //console.log(`stderr: ${stderr}`);
                    //return;
                }
                console.log(`stdout: ${stdout}`);

                var activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
                if (activeConversationID == null){
                    conversationsManagementFunctions.createConversation(recipientPhoneNumber, '');
                }
                activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
                const messageInformation = 
                {
                    messageID: '',
                    owner: 'agent',
                    messageSentDate: generalFunctions.getCurrentDateAsStringWithFormat(),
                    messageSentHour: generalFunctions.getCurrentHourAsStringWithFormat(),
                    messageDeliveryDate: null,
                    messageDeliveryHour: null,
                    messageReadDate: null,
                    messageReadHour: null,
                    messageStatus: 'sent',
                    messageType: 'image',
                    messageContent: 
                    {
                        'isBase64': '1',
                        'mediaExtension': '.png',
                        'mediaContent': mediaContent.split(',')[1]
                    },
                    dateObject: new Date().toString()
                }
                var httpOptionsToSendWhatsappTextMessage = {'method': 'POST', 'hostname': 'graph.facebook.com', 'path': '/' + constants.credentials.apiVersion + '/' + constants.credentials.phoneNumberID + '/messages', 'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + constants.credentials.apiKey}};
                var httpDataToSendWhatsappTextMessage = JSON.stringify({'messaging_product': 'whatsapp', 'to': recipientPhoneNumber, 'text': {'body': messageContent}});
                var httpRequestToSendWhatsappTextMessage = https.request(httpOptionsToSendWhatsappTextMessage, function (httpResponseToSendWhatsappTextMessage) {
                    var httpResponsePartsToSendWhatsappTextMessage = [];
                    httpResponseToSendWhatsappTextMessage.on('data', function (httpResponsePartToSendWhatsappTextMessage) {httpResponsePartsToSendWhatsappTextMessage.push(httpResponsePartToSendWhatsappTextMessage);});
                    httpResponseToSendWhatsappTextMessage.on('end', function (httpResponsePartToSendWhatsappTextMessage) {
                        httpResponsePartsToSendWhatsappTextMessage.push(httpResponsePartToSendWhatsappTextMessage);
                        var activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
                        const messageInformation = 
                        {
                            messageID: '',
                            owner: 'agent',
                            messageSentDate: generalFunctions.getCurrentDateAsStringWithFormat(),
                            messageSentHour: generalFunctions.getCurrentHourAsStringWithFormat(),
                            messageDeliveryDate: null,
                            messageDeliveryHour: null,
                            messageReadDate: null,
                            messageReadHour: null,
                            messageStatus: 'sent',
                            messageType: 'text',
                            messageContent: messageContent,
                            dateObject: new Date().toString()
                        }
                        websocketManagementFunctions.sendWhatsappMessage(websocketConnection, activeConversationID, messageInformation);
                        conversationsManagementFunctions.addMessageToConversation(activeConversationID, messageInformation);
                        websocketManagementFunctions.startNewConversation(websocketConnection, databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase)[activeConversationID], activeConversationID, assignedAgentID);
                    });
                    httpResponseToSendWhatsappTextMessage.on('error', function (error) {console.error(error);});
                });
                httpRequestToSendWhatsappTextMessage.write(httpDataToSendWhatsappTextMessage);
                httpRequestToSendWhatsappTextMessage.end();

                websocketManagementFunctions.sendWhatsappMessage(websocketConnection, activeConversationID, messageInformation);
                conversationsManagementFunctions.addMessageToConversation(activeConversationID, messageInformation);
            });

        });
    },

    sendAutomaticWhatsappTextMessage: function(recipientPhoneNumber, messageContent, websocketConnection){
        var httpOptionsToSendWhatsappTextMessage = {'method': 'POST', 'hostname': 'graph.facebook.com', 'path': '/' + constants.credentials.apiVersion + '/' + constants.credentials.phoneNumberID + '/messages', 'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + constants.credentials.apiKey}};
        var httpDataToSendWhatsappTextMessage = JSON.stringify({'messaging_product': 'whatsapp', 'to': recipientPhoneNumber, 'text': {'body': messageContent}});
        var httpRequestToSendWhatsappTextMessage = https.request(httpOptionsToSendWhatsappTextMessage, function (httpResponseToSendWhatsappTextMessage) {
            var httpResponsePartsToSendWhatsappTextMessage = [];
            httpResponseToSendWhatsappTextMessage.on('data', function (httpResponsePartToSendWhatsappTextMessage) {httpResponsePartsToSendWhatsappTextMessage.push(httpResponsePartToSendWhatsappTextMessage);});
            httpResponseToSendWhatsappTextMessage.on('end', function (httpResponsePartToSendWhatsappTextMessage) {
                httpResponsePartsToSendWhatsappTextMessage.push(httpResponsePartToSendWhatsappTextMessage);
                var activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
                const messageInformation = 
                {
                    messageID: '',
                    owner: 'agent',
                    messageSentDate: generalFunctions.getCurrentDateAsStringWithFormat(),
                    messageSentHour: generalFunctions.getCurrentHourAsStringWithFormat(),
                    messageDeliveryDate: null,
                    messageDeliveryHour: null,
                    messageReadDate: null,
                    messageReadHour: null,
                    messageStatus: 'sent',
                    messageType: 'text',
                    messageContent: messageContent,
                    dateObject: new Date().toString()
                }
                websocketManagementFunctions.sendWhatsappMessage(websocketConnection, activeConversationID, messageInformation);
                conversationsManagementFunctions.addMessageToConversation(activeConversationID, messageInformation);
            });
            httpResponseToSendWhatsappTextMessage.on('error', function (error) {console.error(error);});
        });
        httpRequestToSendWhatsappTextMessage.write(httpDataToSendWhatsappTextMessage);
        httpRequestToSendWhatsappTextMessage.end();
    },

    sendWhatsappPendingConversationMessage: function(recipientPhoneNumber, mediaContent, messageContent, requestQuery, websocketConnection){
        fs.writeFileSync('a.png', mediaContent.split(',')[1],'base64');
        exec(`curl -X POST "https://graph.facebook.com/v17.0/` + constants.credentials.phoneNumberID + `/media" -H "Authorization: Bearer `+constants.credentials.apiKey+`" -F "file=@a.png" -F "type=image" -F "messaging_product="whatsapp"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
            }
            console.log(JSON.parse(stdout));
            exec(`curl -X  POST "https://graph.facebook.com/v17.0/` + constants.credentials.phoneNumberID + `/messages" -H "Authorization: Bearer `+constants.credentials.apiKey+`" -H "Content-Type: application/json" -d "{messaging_product: 'whatsapp', recipient_type: 'individual', to: '`+recipientPhoneNumber+`', type: 'image', image : {id: ` +JSON.parse(stdout).id+`}}"`, (error, stdout, stderr) => {
                if (error) {
                    return;
                }
                if (stderr) {
                }
                console.log(`stdout: ${stdout}`);
                var activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
                if (activeConversationID == null){
                    conversationsManagementFunctions.createConversation(recipientPhoneNumber, '');
                }
                activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
                const messageInformation = 
                {
                    messageID: '',
                    owner: 'agent',
                    messageSentDate: generalFunctions.getCurrentDateAsStringWithFormat(),
                    messageSentHour: generalFunctions.getCurrentHourAsStringWithFormat(),
                    messageDeliveryDate: null,
                    messageDeliveryHour: null,
                    messageReadDate: null,
                    messageReadHour: null,
                    messageStatus: 'sent',
                    messageType: 'image',
                    messageContent: 
                    {
                        'isBase64': '1',
                        'mediaExtension': '.png',
                        'mediaContent': mediaContent.split(',')[1]
                    },
                    dateObject: new Date().toString()
                }
                conversationsManagementFunctions.addMessageToConversation(activeConversationID, messageInformation);
                var httpOptionsToSendWhatsappTextMessage = {'method': 'POST', 'hostname': 'graph.facebook.com', 'path': '/' + constants.credentials.apiVersion + '/' + constants.credentials.phoneNumberID + '/messages', 'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + constants.credentials.apiKey}};
                var httpDataToSendWhatsappTextMessage = JSON.stringify({'messaging_product': 'whatsapp', 'to': recipientPhoneNumber, 'text': {'body': messageContent}});
                var httpRequestToSendWhatsappTextMessage = https.request(httpOptionsToSendWhatsappTextMessage, function (httpResponseToSendWhatsappTextMessage) {
                    var httpResponsePartsToSendWhatsappTextMessage = [];
                    httpResponseToSendWhatsappTextMessage.on('data', function (httpResponsePartToSendWhatsappTextMessage) {httpResponsePartsToSendWhatsappTextMessage.push(httpResponsePartToSendWhatsappTextMessage);});
                    httpResponseToSendWhatsappTextMessage.on('end', function (httpResponsePartToSendWhatsappTextMessage) {
                        httpResponsePartsToSendWhatsappTextMessage.push(httpResponsePartToSendWhatsappTextMessage);
                        var activeConversationID = conversationsManagementFunctions.getActiveConversationID(recipientPhoneNumber);
                        const messageInformation = 
                        {
                            messageID: '',
                            owner: 'agent',
                            messageSentDate: generalFunctions.getCurrentDateAsStringWithFormat(),
                            messageSentHour: generalFunctions.getCurrentHourAsStringWithFormat(),
                            messageDeliveryDate: null,
                            messageDeliveryHour: null,
                            messageReadDate: null,
                            messageReadHour: null,
                            messageStatus: 'sent',
                            messageType: 'text',
                            messageContent: messageContent,
                            dateObject: new Date().toString()
                        }
                        conversationsManagementFunctions.addMessageToConversation(activeConversationID, messageInformation);
                        agentsManagementFunctions.grabPendingConversation(requestQuery, websocketConnection)
                    });
                    httpResponseToSendWhatsappTextMessage.on('error', function (error) {console.error(error);});
                });
                httpRequestToSendWhatsappTextMessage.write(httpDataToSendWhatsappTextMessage);
                httpRequestToSendWhatsappTextMessage.end();
                });

        });
    },

    sendWhatsappLocationMessage: function(requestQuery, frontendResponse, websocketConnection){
        var httpOptionsToSendWhatsappTextMessage = {'method': 'POST', 'hostname': 'graph.facebook.com', 'path': '/' + constants.credentials.apiVersion + '/' + constants.credentials.phoneNumberID + '/messages', 'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + constants.credentials.apiKey}};
        var httpDataToSendWhatsappTextMessage = JSON.stringify({'messaging_product': 'whatsapp', 'to': requestQuery['recipientPhoneNumber'], 'type':'location', 'location': {'longitude': requestQuery['longitude'], 'latitude': requestQuery['latitude']}});
        var httpRequestToSendWhatsappTextMessage = https.request(httpOptionsToSendWhatsappTextMessage, function (httpResponseToSendWhatsappTextMessage) {
            var httpResponsePartsToSendWhatsappTextMessage = [];
            httpResponseToSendWhatsappTextMessage.on('data', function (httpResponsePartToSendWhatsappTextMessage) {httpResponsePartsToSendWhatsappTextMessage.push(httpResponsePartToSendWhatsappTextMessage);});
            httpResponseToSendWhatsappTextMessage.on('end', function (httpResponsePartToSendWhatsappTextMessage) {
                httpResponsePartsToSendWhatsappTextMessage.push(httpResponsePartToSendWhatsappTextMessage);
                var activeConversationID = conversationsManagementFunctions.getActiveConversationID(requestQuery['recipientPhoneNumber']);
                if (activeConversationID == null){
                    const newConversationID = conversationsManagementFunctions.createConversation(requestQuery['recipientPhoneNumber'], '');
                    agentsManagementFunctions.assignNewConversationToAgentWithLessActiveConversations(newConversationID, requestQuery['agentID']);
                }
                activeConversationID = conversationsManagementFunctions.getActiveConversationID(requestQuery['recipientPhoneNumber']);
                const messageInformation = 
                {
                    messageID: '',
                    owner: 'agent',
                    messageSentDate: generalFunctions.getCurrentDateAsStringWithFormat(),
                    messageSentHour: generalFunctions.getCurrentHourAsStringWithFormat(),
                    messageDeliveryDate: null,
                    messageDeliveryHour: null,
                    messageReadDate: null,
                    messageReadHour: null,
                    messageStatus: 'sent',
                    messageType: 'location',
                    messageContent: {locationLatitude: requestQuery['latitude'], locationLongitude: requestQuery['longitude']},
                    dateObject: new Date().toString()
                }
                websocketManagementFunctions.sendWhatsappMessage(websocketConnection, activeConversationID, messageInformation);
                conversationsManagementFunctions.addMessageToConversation(activeConversationID, messageInformation);
                frontendResponse.end();
            });
            httpResponseToSendWhatsappTextMessage.on('error', function (error) {console.error(error);});
        });
        httpRequestToSendWhatsappTextMessage.write(httpDataToSendWhatsappTextMessage);
        httpRequestToSendWhatsappTextMessage.end();
    }
}