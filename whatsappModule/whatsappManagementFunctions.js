const constants = require('../constants.js');
const whatsappDatabaseFunctions = require('./whatsappDatabaseFunctions.js');

const axios = require('axios');
const uuidv4 = require('uuid');
const sharp = require('sharp');
sharp.cache({files : 0});
const fs = require('fs');
const FormData = require('form-data');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
  sendWhatsappMessage: async function(sendWhatsappMessageData){
    return new Promise((sendWhatsappMessagePromiseResolve) => {
      const sendWhatsappMessageURL = `https://graph.facebook.com/${constants.credentials.apiVersion}/${constants.credentials.phoneNumberID}/messages`;
      const sendWhatsappMessageHeaders = {'Content-Type': 'application/json', 'Authorization': `Bearer ${constants.credentials.apiKey}`};
      axios.post(sendWhatsappMessageURL, sendWhatsappMessageData, {headers: sendWhatsappMessageHeaders}).then((response) => {
        const whatsappMessageID = response.data.messages[0].id;
        sendWhatsappMessagePromiseResolve({success: true, result: whatsappMessageID});
      })
      .catch((error) => {
        sendWhatsappMessagePromiseResolve({success: false, result: error});
      });  
    });
  },

  sendWhatsappTextMessage: async function(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappGeneralMessageRepliedMessageID, whatsappTextMessageBody){
    return new Promise(async (sendWhatsappTextMessagePromiseResolve) => {
      try {
        var httpDataToSendWhatsappTextMessage =
        {
          'messaging_product': 'whatsapp', 
          'to': whatsappConversationRecipientPhoneNumber, 
          'type': 'text',
          'text': {'body': whatsappTextMessageBody}
        };
        if (whatsappGeneralMessageRepliedMessageID != ''){
          httpDataToSendWhatsappTextMessage['context'] = {'message_id': whatsappGeneralMessageRepliedMessageID};
        } else {
          whatsappGeneralMessageRepliedMessageID = null;
        }
        httpDataToSendWhatsappTextMessage = JSON.stringify(httpDataToSendWhatsappTextMessage);
        const sendWhatsappMessageResult = await this.sendWhatsappMessage(httpDataToSendWhatsappTextMessage);
        if (sendWhatsappMessageResult.success){
          const whatsappGeneralMessageID = sendWhatsappMessageResult.result;
          const whatsappTextMessageID = whatsappGeneralMessageID;
          const whatsappGeneralMessageOwnerPhoneNumber = null;
          const selectOrCreateActiveWhatsappConversationIDResult = await whatsappDatabaseFunctions.selectOrCreateActiveWhatsappConversationID(whatsappConversationRecipientPhoneNumber);
          if (selectOrCreateActiveWhatsappConversationIDResult.success){
            const whatsappConversationID = selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationID;
            const createWhatsappGeneralMessageResult = await whatsappDatabaseFunctions.createWhatsappGeneralMessage(whatsappConversationID, whatsappTextMessageID, whatsappGeneralMessageRepliedMessageID, whatsappGeneralMessageOwnerPhoneNumber);
            if (createWhatsappGeneralMessageResult.success){
              const whatsappGeneralMessageIndex = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageIndex;
              const whatsappGeneralMessageCreationDateTime = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageCreationDateTime;
              const createWhatsappTextMessageResult = await whatsappDatabaseFunctions.createWhatsappTextMessage(whatsappTextMessageID, whatsappTextMessageBody);
              if (createWhatsappTextMessageResult.success){
                const websocketMessageContent = 
                {
                  success: true,
                  result: 
                  {
                    whatsappConversationID: whatsappConversationID,
                    whatsappGeneralMessageID: whatsappGeneralMessageID,
                    whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                    whatsappGeneralMessageType: 'text',
                    whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                    whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                    whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                    whatsappTextMessageID: whatsappTextMessageID,
                    whatsappTextMessageBody: whatsappTextMessageBody
                  }
                };
                sendWhatsappTextMessagePromiseResolve(JSON.stringify(websocketMessageContent));
                websocketConnection.sendWebsocketMessage('/sendWhatsappMessage', websocketMessageContent);
              } else {
                sendWhatsappTextMessagePromiseResolve(JSON.stringify(createWhatsappTextMessageResult));
              }
            } else {
              sendWhatsappTextMessagePromiseResolve(JSON.stringify(createWhatsappGeneralMessageResult));
            }
          } else {
            sendWhatsappTextMessagePromiseResolve(JSON.stringify(selectOrCreateActiveWhatsappConversationIDResult));
          }
        } else {
          sendWhatsappTextMessagePromiseResolve(JSON.stringify(sendWhatsappMessageResult));
        }
      } catch (error) {
        sendWhatsappTextMessagePromiseResolve(JSON.stringify({success: false, result: error}));
      }
    });
  },

  sendWhatsappTextMessageFromContactList: async function(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName, whatsappConversationAssignedAgentID, whatsappTextMessageBody){
    return new Promise(async (sendWhatsappTextMessageFromContactListPromiseResolve) => {
      try {
        const selectActiveWhatsappConversationResult = await whatsappDatabaseFunctions.selectActiveWhatsappConversationID(whatsappConversationRecipientPhoneNumber);
        if (selectActiveWhatsappConversationResult.success){
          const whatsappGeneralMessageRepliedMessageID = null;
          var httpDataToSendWhatsappTextMessage =
          {
            'messaging_product': 'whatsapp',
            'to': whatsappConversationRecipientPhoneNumber, 
            'type': 'template', 'template': {'name': 'bienvenida', 'language': {'code': 'es'},
            'components': [{'type': 'body', 'parameters': [{'type': 'text', 'text': whatsappTextMessageBody}]}]     
            }
          };
          httpDataToSendWhatsappTextMessage = JSON.stringify(httpDataToSendWhatsappTextMessage);
          const sendWhatsappMessageResult = await this.sendWhatsappMessage(httpDataToSendWhatsappTextMessage);
          if (sendWhatsappMessageResult.success){
            const whatsappGeneralMessageID = sendWhatsappMessageResult.result;
            const whatsappTextMessageID = whatsappGeneralMessageID;
            const whatsappGeneralMessageOwnerPhoneNumber = null;
            const selectOrCreateActiveWhatsappConversationFromContactListResult = await whatsappDatabaseFunctions.selectOrCreateActiveWhatsappConversationFromContactList(whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName, whatsappConversationAssignedAgentID);
            if (selectOrCreateActiveWhatsappConversationFromContactListResult.success){
              const whatsappConversationID = selectOrCreateActiveWhatsappConversationFromContactListResult.result.whatsappConversationID;
              const createWhatsappGeneralMessageResult = await whatsappDatabaseFunctions.createWhatsappGeneralMessage(whatsappConversationID, whatsappTextMessageID, whatsappGeneralMessageRepliedMessageID, whatsappGeneralMessageOwnerPhoneNumber);
              if (createWhatsappGeneralMessageResult.success){
                const whatsappGeneralMessageIndex = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageIndex;
                const whatsappGeneralMessageCreationDateTime = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageCreationDateTime;
                const createWhatsappTextMessageResult = await whatsappDatabaseFunctions.createWhatsappTextMessage(whatsappTextMessageID, whatsappTextMessageBody);
                if (createWhatsappTextMessageResult.success){
                  const websocketMessageContent = 
                  {
                    success: true,
                    result: 
                    {
                      whatsappConversationID: whatsappConversationID,
                      whatsappGeneralMessageID: whatsappGeneralMessageID,
                      whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                      whatsappGeneralMessageType: 'text',
                      whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                      whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                      whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                      whatsappTextMessageID: whatsappTextMessageID,
                      whatsappTextMessageBody: whatsappTextMessageBody
                    }
                  };
                  sendWhatsappTextMessageFromContactListPromiseResolve(JSON.stringify(websocketMessageContent));
                  websocketConnection.sendWebsocketMessage('/sendWhatsappMessage', websocketMessageContent);
                } else {
                  sendWhatsappTextMessageFromContactListPromiseResolve(JSON.stringify(createWhatsappTextMessageResult));
                }
              } else {
                sendWhatsappTextMessageFromContactListPromiseResolve(JSON.stringify(createWhatsappGeneralMessageResult));
              }
            } else {
              sendWhatsappTextMessageFromContactListPromiseResolve(JSON.stringify(selectOrCreateActiveWhatsappConversationIDResult));
            }
          } else {
            sendWhatsappTextMessageFromContactListPromiseResolve(JSON.stringify(sendWhatsappMessageResult));
          }
        } else {
          sendWhatsappTextMessageFromContactListPromiseResolve(JSON.stringify(selectActiveWhatsappConversationResult));
        }
      } catch (error) {
        sendWhatsappTextMessageFromContactListPromiseResolve(JSON.stringify({success: false, result: error}));
      }
    });
  },

  sendWhatsappLocationMessage: async function(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappGeneralMessageRepliedMessageID, whatsappLocationMessageLatitude, whatsappLocationMessageLongitude){
    return new Promise(async (sendWhatsappLocationMessagePromiseResolve) => {
      try {
        var httpDataToSendWhatsappLocationMessage =
        {
          'messaging_product': 'whatsapp', 
          'to': whatsappConversationRecipientPhoneNumber, 
          'type': 'location',
          'location': {'latitude': whatsappLocationMessageLatitude, 'longitude': whatsappLocationMessageLongitude}
        };
        if (whatsappGeneralMessageRepliedMessageID != ''){
          httpDataToSendWhatsappLocationMessage['context'] = {'message_id': whatsappGeneralMessageRepliedMessageID};
        } else {
          whatsappGeneralMessageRepliedMessageID = null;
        }
        httpDataToSendWhatsappLocationMessage = JSON.stringify(httpDataToSendWhatsappLocationMessage);
        const sendWhatsappMessageResult = await this.sendWhatsappMessage(httpDataToSendWhatsappLocationMessage);
        if (sendWhatsappMessageResult.success){
          const whatsappGeneralMessageID = sendWhatsappMessageResult.result;
          const whatsappLocationMessageID = whatsappGeneralMessageID;
          const whatsappGeneralMessageOwnerPhoneNumber = null;
          const selectOrCreateActiveWhatsappConversationIDResult = await whatsappDatabaseFunctions.selectOrCreateActiveWhatsappConversationID(whatsappConversationRecipientPhoneNumber);
          if (selectOrCreateActiveWhatsappConversationIDResult.success){
            const whatsappConversationID = selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationID;
            const createWhatsappGeneralMessageResult = await whatsappDatabaseFunctions.createWhatsappGeneralMessage(whatsappConversationID, whatsappLocationMessageID, whatsappGeneralMessageRepliedMessageID, whatsappGeneralMessageOwnerPhoneNumber);
            if (createWhatsappGeneralMessageResult.success){
              const whatsappGeneralMessageIndex = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageIndex;
              const whatsappGeneralMessageCreationDateTime = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageCreationDateTime;
              const createWhatsappLocationMessageResult = await whatsappDatabaseFunctions.createWhatsappLocationMessage(whatsappLocationMessageID, whatsappLocationMessageLatitude, whatsappLocationMessageLongitude);
              if (createWhatsappLocationMessageResult.success){
                const websocketMessageContent = 
                {
                  success: true,
                  result: 
                  {
                    whatsappConversationID: whatsappConversationID,
                    whatsappGeneralMessageID: whatsappGeneralMessageID,
                    whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                    whatsappGeneralMessageType: 'location',
                    whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                    whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                    whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                    whatsappLocationMessageID: whatsappLocationMessageID,
                    whatsappLocationMessageLatitude: whatsappLocationMessageLatitude,
                    whatsappLocationMessageLongitude: whatsappLocationMessageLongitude
                  }
                };
                sendWhatsappLocationMessagePromiseResolve(JSON.stringify(websocketMessageContent));
                websocketConnection.sendWebsocketMessage('/sendWhatsappMessage', websocketMessageContent);
              } else {
                sendWhatsappLocationMessagePromiseResolve(JSON.stringify(createWhatsappLocationMessageResult));
              }
            } else {
              sendWhatsappLocationMessagePromiseResolve(JSON.stringify(createWhatsappGeneralMessageResult));
            }
          } else {
            sendWhatsappLocationMessagePromiseResolve(JSON.stringify(selectOrCreateActiveWhatsappConversationIDResult));
          }
        } else {
          sendWhatsappLocationMessagePromiseResolve(JSON.stringify(sendWhatsappMessageResult));
        }
      } catch (error) {
        sendWhatsappLocationMessagePromiseResolve(JSON.stringify({success: false, result: error}));
      }
    });
  },

  uploadWhatsappImageFile: async function(whatsappImageMessageFile){
    return new Promise(async (uploadWhatsappImageFilePromiseResolve) => {
      const uploadWhatsappImageMessageURL = `https://graph.facebook.com/${constants.credentials.apiVersion}/${constants.credentials.phoneNumberID}/media`;
      const temporaryImageName = `whatsappModule/${uuidv4.v4()}-${Date.now()}.png`;
      const temporaryImageBuffer = Buffer.from(whatsappImageMessageFile, 'base64');
      sharp(temporaryImageBuffer).toFormat('png').toBuffer().then((convertedImageBuffer) => {
        fs.writeFileSync(temporaryImageName, convertedImageBuffer);
        const temporaryImageStream = fs.createReadStream(temporaryImageName);
        const uploadWhatsappImageMessageParameters = new FormData();
        uploadWhatsappImageMessageParameters.append('messaging_product', 'whatsapp');
        uploadWhatsappImageMessageParameters.append('type', 'image/png');
        uploadWhatsappImageMessageParameters.append('file', temporaryImageStream);
        const uploadWhatsappImageMessageHeaders = uploadWhatsappImageMessageParameters.getHeaders();
        uploadWhatsappImageMessageHeaders['Authorization'] = `Bearer ${constants.credentials.apiKey}`;
        axios.post(uploadWhatsappImageMessageURL, uploadWhatsappImageMessageParameters, {headers: uploadWhatsappImageMessageHeaders}).then(async (httpResponse) => {
          fs.unlink(temporaryImageName, async (errorWhenDeletingTemporaryImage) => {
            if (!errorWhenDeletingTemporaryImage) {
              const whatsappImageMessageFileID = httpResponse.data.id;
              console.log(whatsappImageMessageFileID);
              uploadWhatsappImageFilePromiseResolve({success: true, result: {whatsappImageMessageFileID: whatsappImageMessageFileID, whatsappImageMessageFile: convertedImageBuffer}});
            } else {
              uploadWhatsappImageFilePromiseResolve({success: false, result: errorWhenDeletingTemporaryImage});
            }
          });
        })
        .catch((error) => {
          uploadWhatsappImageFilePromiseResolve({success: false, result: error});
        });
      })
      .catch((error) => {
        uploadWhatsappImageFilePromiseResolve({success: false, result: error});
      });
    });
  },

  sendWhatsappImageMessage: async function(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappGeneralMessageRepliedMessageID, whatsappImageMessageFile, whatsappImageMessageCaption){
    return new Promise(async (sendWhatsappImageMessagePromiseResolve) => {
      try {
        const uploadWhatsappImageFileResult = await this.uploadWhatsappImageFile(whatsappImageMessageFile);
        if (uploadWhatsappImageFileResult.success){
          const whatsappImageMessageFileID = uploadWhatsappImageFileResult.result.whatsappImageMessageFileID;
          const convertedWhatsappImageMessageFile = uploadWhatsappImageFileResult.result.whatsappImageMessageFile;
          var httpDataToSendWhatsappImageMessage =
          {
            'messaging_product': 'whatsapp', 
            'to': whatsappConversationRecipientPhoneNumber, 
            'type': 'image',
            'image': {'id': whatsappImageMessageFileID}
          };
          if (whatsappGeneralMessageRepliedMessageID != ''){
            httpDataToSendWhatsappImageMessage['context'] = {'message_id': whatsappGeneralMessageRepliedMessageID};
          } else {
            whatsappGeneralMessageRepliedMessageID = null;
          }
          httpDataToSendWhatsappImageMessage = JSON.stringify(httpDataToSendWhatsappImageMessage);
          const sendWhatsappMessageResult = await this.sendWhatsappMessage(httpDataToSendWhatsappImageMessage);
          if (sendWhatsappMessageResult.success){
            const whatsappGeneralMessageID = sendWhatsappMessageResult.result;
            const whatsappImageMessageID = whatsappGeneralMessageID;
            const whatsappGeneralMessageOwnerPhoneNumber = null;
            const selectOrCreateActiveWhatsappConversationIDResult = await whatsappDatabaseFunctions.selectOrCreateActiveWhatsappConversationID(whatsappConversationRecipientPhoneNumber);
            if (selectOrCreateActiveWhatsappConversationIDResult.success){
              const whatsappConversationID = selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationID;
              const createWhatsappGeneralMessageResult = await whatsappDatabaseFunctions.createWhatsappGeneralMessage(whatsappConversationID, whatsappImageMessageID, whatsappGeneralMessageRepliedMessageID, whatsappGeneralMessageOwnerPhoneNumber);
              if (createWhatsappGeneralMessageResult.success){
                const whatsappGeneralMessageIndex = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageIndex;
                const whatsappGeneralMessageCreationDateTime = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageCreationDateTime;
                const createWhatsappImageMessageResult = await whatsappDatabaseFunctions.createWhatsappImageMessage(whatsappImageMessageID, convertedWhatsappImageMessageFile, whatsappImageMessageCaption);
                if (createWhatsappImageMessageResult.success){
                  const websocketMessageContent = 
                  {
                    success: true,
                    result: 
                    {
                      whatsappConversationID: whatsappConversationID,
                      whatsappGeneralMessageID: whatsappGeneralMessageID,
                      whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                      whatsappGeneralMessageType: 'image',
                      whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                      whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                      whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                      whatsappImageMessageID: whatsappImageMessageID,
                      whatsappImageMessageFileID: whatsappImageMessageFileID,
                      whatsappImageMessageCaption: whatsappImageMessageCaption,
                      whatsappImageMessageFile: Buffer.from(convertedWhatsappImageMessageFile).toString('base64')
                    }
                  };
                  sendWhatsappImageMessagePromiseResolve(JSON.stringify(websocketMessageContent));
                  websocketConnection.sendWebsocketMessage('/sendWhatsappMessage', websocketMessageContent);
                } else {
                  sendWhatsappImageMessagePromiseResolve(JSON.stringify(createWhatsappImageMessageResult));
                }
              } else {
                sendWhatsappImageMessagePromiseResolve(JSON.stringify(createWhatsappGeneralMessageResult));
              }
            } else {
              sendWhatsappImageMessagePromiseResolve(JSON.stringify(selectOrCreateActiveWhatsappConversationIDResult));
            }
          } else {
            sendWhatsappImageMessagePromiseResolve(JSON.stringify(sendWhatsappMessageResult));
          }
        } else {
          sendWhatsappImageMessagePromiseResolve(JSON.stringify(uploadWhatsappImageFileResult));
        }
      } catch (error) {
        sendWhatsappImageMessagePromiseResolve(JSON.stringify({success: false, result: error}));
      }
    });
  },

  uploadWhatsappAudioFile: async function(whatsappAudioMessageFile){
    return new Promise(async (uploadWhatsappAudioFilePromiseResolve) => {
      const uploadWhatsappAudioMessageURL = `https://graph.facebook.com/${constants.credentials.apiVersion}/${constants.credentials.phoneNumberID}/media`;
      const originalAudioName = `whatsappModule/${uuidv4.v4()}-${Date.now()}.ogg`;
      const convertedAudioName = `whatsappModule/${uuidv4.v4()}-${Date.now()}.ogg`;
      whatsappAudioMessageFile = whatsappAudioMessageFile.split(',')[1];
      var whatsappAudioMessageFileBuffer = Buffer.from(whatsappAudioMessageFile, 'base64');
      fs.writeFileSync(originalAudioName, whatsappAudioMessageFileBuffer);
      ffmpeg().input(originalAudioName).audioCodec('libopus').format('ogg').on('end', () => {
        fs.unlink(originalAudioName, async (errorWhenDeletingOriginalAudioFile) => {
          if (!errorWhenDeletingOriginalAudioFile) {
            var whatsappAudioMessageFile = fs.readFileSync(convertedAudioName);
            const temporaryAudioStream = fs.createReadStream(convertedAudioName);
            const uploadWhatsappAudioMessageParameters = new FormData();
            uploadWhatsappAudioMessageParameters.append('messaging_product', 'whatsapp');
            uploadWhatsappAudioMessageParameters.append('type', 'audio/ogg; codecs=opus');
            uploadWhatsappAudioMessageParameters.append('file', temporaryAudioStream);
            const uploadWhatsappAudioMessageHeaders = uploadWhatsappAudioMessageParameters.getHeaders();
            uploadWhatsappAudioMessageHeaders['Authorization'] = `Bearer ${constants.credentials.apiKey}`;
            axios.post(uploadWhatsappAudioMessageURL, uploadWhatsappAudioMessageParameters, {headers: uploadWhatsappAudioMessageHeaders}).then(async (httpResponse) => {
              fs.unlink(convertedAudioName, async (errorWhenDeletingConvertedAudio) => {
                if (!errorWhenDeletingConvertedAudio) {
                  const whatsappAudioMessageFileID = httpResponse.data.id;
                  uploadWhatsappAudioFilePromiseResolve({success: true, result: {whatsappAudioMessageFileID: whatsappAudioMessageFileID, whatsappAudioMessageFile: whatsappAudioMessageFile}});
                } else {
                  uploadWhatsappAudioFilePromiseResolve({success: false, result: errorWhenDeletingConvertedAudio});
                }
              });
            })
            .catch((error) => {
              uploadWhatsappAudioFilePromiseResolve({success: false, result: error});
            });
          } else {
            uploadWhatsappAudioFilePromiseResolve({success: false, result: errorWhenDeletingOriginalAudioFile});
          }
        });
      })
      .on('error', (error) => {
        uploadWhatsappAudioFilePromiseResolve({success: false, result: error});
      })
      .save(convertedAudioName);
    });
  },

  sendWhatsappAudioMessage: async function(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappGeneralMessageRepliedMessageID, whatsappAudioMessageFile){
    return new Promise(async (sendWhatsappAudioMessagePromiseResolve) => {
      try {
        const uploadWhatsappAudioFileResult = await this.uploadWhatsappAudioFile(whatsappAudioMessageFile);
        if (uploadWhatsappAudioFileResult.success){
          const whatsappAudioMessageFileID = uploadWhatsappAudioFileResult.result.whatsappAudioMessageFileID;
          const convertedWhatsappAudioMessageFile = uploadWhatsappAudioFileResult.result.whatsappAudioMessageFile;
          var httpDataToSendWhatsappAudioMessage =
          {
            'messaging_product': 'whatsapp', 
            'to': whatsappConversationRecipientPhoneNumber, 
            'type': 'audio',
            'audio': {'id': whatsappAudioMessageFileID}
          };
          if (whatsappGeneralMessageRepliedMessageID != ''){
            httpDataToSendWhatsappAudioMessage['context'] = {'message_id': whatsappGeneralMessageRepliedMessageID};
          } else {
            whatsappGeneralMessageRepliedMessageID = null;
          }
          httpDataToSendWhatsappAudioMessage = JSON.stringify(httpDataToSendWhatsappAudioMessage);
          const sendWhatsappMessageResult = await this.sendWhatsappMessage(httpDataToSendWhatsappAudioMessage);
          if (sendWhatsappMessageResult.success){
            const whatsappGeneralMessageID = sendWhatsappMessageResult.result;
            const whatsappAudioMessageID = whatsappGeneralMessageID;
            const whatsappGeneralMessageOwnerPhoneNumber = null;
            const selectOrCreateActiveWhatsappConversationIDResult = await whatsappDatabaseFunctions.selectOrCreateActiveWhatsappConversationID(whatsappConversationRecipientPhoneNumber);
            if (selectOrCreateActiveWhatsappConversationIDResult.success){
              const whatsappConversationID = selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationID;
              const createWhatsappGeneralMessageResult = await whatsappDatabaseFunctions.createWhatsappGeneralMessage(whatsappConversationID, whatsappAudioMessageID, whatsappGeneralMessageRepliedMessageID, whatsappGeneralMessageOwnerPhoneNumber);
              if (createWhatsappGeneralMessageResult.success){
                const whatsappGeneralMessageIndex = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageIndex;
                const whatsappGeneralMessageCreationDateTime = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageCreationDateTime;
                const createWhatsappAudioMessageResult = await whatsappDatabaseFunctions.createWhatsappAudioMessage(whatsappAudioMessageID, convertedWhatsappAudioMessageFile);
                if (createWhatsappAudioMessageResult.success){
                  const websocketMessageContent = 
                  {
                    success: true,
                    result: 
                    {
                      whatsappConversationID: whatsappConversationID,
                      whatsappGeneralMessageID: whatsappGeneralMessageID,
                      whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                      whatsappGeneralMessageType: 'audio',
                      whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                      whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                      whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                      whatsappAudioMessageID: whatsappAudioMessageID,
                      whatsappAudioMessageFileID: whatsappAudioMessageFileID,
                      whatsappAudioMessageFile: Buffer.from(convertedWhatsappAudioMessageFile).toString('base64')
                    }
                  };
                  sendWhatsappAudioMessagePromiseResolve(JSON.stringify(websocketMessageContent));
                  websocketConnection.sendWebsocketMessage('/sendWhatsappMessage', websocketMessageContent);
                } else {
                  sendWhatsappAudioMessagePromiseResolve(JSON.stringify(createWhatsappAudioMessageResult));
                }
              } else {
                sendWhatsappAudioMessagePromiseResolve(JSON.stringify(createWhatsappGeneralMessageResult));
              }
            } else {
              sendWhatsappAudioMessagePromiseResolve(JSON.stringify(selectOrCreateActiveWhatsappConversationIDResult));
            }
          } else {
            sendWhatsappAudioMessagePromiseResolve(JSON.stringify(sendWhatsappMessageResult));
          }
        } else {
          sendWhatsappAudioMessagePromiseResolve(JSON.stringify(uploadWhatsappAudioFileResult));
        }
      } catch (error) {
        sendWhatsappAudioMessagePromiseResolve(JSON.stringify({success: false, result: error}));
      }
    });
    
  },

  sendWhatsappFavoriteImageMessage: async function(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappFavoriteImageMessageContent, whatsappFavoriteImageMessageCaption){
    return new Promise(async (sendWhatsappFavoriteImageMessagePromiseResolve) => {
      var httpDataToSendWhatsappFavoriteImageMessage =
      {
        'messaging_product': 'whatsapp', 
        'to': whatsappConversationRecipientPhoneNumber, 
        'type': 'image',
        'image': {'id': whatsappFavoriteImageMessageContent.whatsappFavoriteImageFileID}
      };
      if (whatsappFavoriteImageMessageCaption != null){
        httpDataToSendWhatsappFavoriteImageMessage['image']['caption'] = whatsappFavoriteImageMessageCaption;
      }
      httpDataToSendWhatsappFavoriteImageMessage = JSON.stringify(httpDataToSendWhatsappFavoriteImageMessage);
      const sendWhatsappMessageResult = await this.sendWhatsappMessage(httpDataToSendWhatsappFavoriteImageMessage);
      if (sendWhatsappMessageResult.success){
        const whatsappGeneralMessageID = sendWhatsappMessageResult.result;
        const whatsappFavoriteImageMessageID = whatsappGeneralMessageID;
        const whatsappGeneralMessageRepliedMessageID = null;
        const whatsappGeneralMessageOwnerPhoneNumber = null;
        const selectOrCreateActiveWhatsappConversationIDResult = await whatsappDatabaseFunctions.selectOrCreateActiveWhatsappConversationID(whatsappConversationRecipientPhoneNumber);
        if (selectOrCreateActiveWhatsappConversationIDResult.success){
          const whatsappConversationID = selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationID;
          const createWhatsappGeneralMessageResult = await whatsappDatabaseFunctions.createWhatsappGeneralMessage(whatsappConversationID, whatsappFavoriteImageMessageID, whatsappGeneralMessageRepliedMessageID, whatsappGeneralMessageOwnerPhoneNumber);
          if (createWhatsappGeneralMessageResult.success){
            const whatsappGeneralMessageIndex = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageIndex;
            const whatsappGeneralMessageCreationDateTime = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageCreationDateTime;
            const createWhatsappFavoriteImageMessageResult = await whatsappDatabaseFunctions.createWhatsappFavoriteImageMessage(whatsappFavoriteImageMessageID, whatsappFavoriteImageMessageContent.whatsappFavoriteImageDriveURL, whatsappFavoriteImageMessageCaption);
            if (createWhatsappFavoriteImageMessageResult.success){
              const websocketMessageContent = 
              {
                success: true,
                result: 
                {
                  whatsappConversationID: whatsappConversationID,
                  whatsappGeneralMessageID: whatsappGeneralMessageID,
                  whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                  whatsappGeneralMessageType: 'favoriteImage',
                  whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                  whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                  whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                  whatsappFavoriteImageMessageID: whatsappFavoriteImageMessageID,
                  whatsappFavoriteImageMessageDriveURL: whatsappFavoriteImageMessageContent.whatsappFavoriteImageDriveURL,
                  whatsappFavoriteImageMessageCaption: whatsappFavoriteImageMessageCaption
                }
              };
              sendWhatsappFavoriteImageMessagePromiseResolve(JSON.stringify(websocketMessageContent));
              websocketConnection.sendWebsocketMessage('/sendWhatsappMessage', websocketMessageContent);
            } else {
              sendWhatsappFavoriteImageMessagePromiseResolve(JSON.stringify(createWhatsappFavoriteImageMessageResult));
            }
          } else {
            sendWhatsappFavoriteImageMessagePromiseResolve(JSON.stringify(createWhatsappGeneralMessageResult));
          }
        } else {
          sendWhatsappFavoriteImageMessagePromiseResolve(JSON.stringify(selectOrCreateActiveWhatsappConversationIDResult));
        }
      } else {
        sendWhatsappFavoriteImageMessagePromiseResolve(JSON.stringify(sendWhatsappMessageResult));
      }
    });
    
  },

  downloadWhatsappImageFile: async function(whatsappProductImageMessageURL){
    return new Promise(async (downloadWhatsappImageFilePromiseResolve) => {
      axios.get(whatsappProductImageMessageURL, {responseType: 'arraybuffer'}).then(async (response) => {
        const downloadedWhatsappImageFile = (await sharp(response.data).png().toBuffer()).toString('base64');
        downloadWhatsappImageFilePromiseResolve({success: true, result: downloadedWhatsappImageFile});
      })
      .catch((error) => {
        downloadWhatsappImageFilePromiseResolve({success: false, result: error});
      });
    });
  },
  sendWhatsappProductImageMessage: async function(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappProductImageMessageURL, whatsappProductImageMessageCaption){
    return new Promise(async (sendWhatsappProductImageMessagePromiseResolve) => {
      const downloadWhatsappImageFileResult = await this.downloadWhatsappImageFile(whatsappProductImageMessageURL);
      if (downloadWhatsappImageFileResult.success){
        const downloadedWhatsappImageFile = downloadWhatsappImageFileResult.result;
        const uploadWhatsappImageFileResult = await this.uploadWhatsappImageFile(downloadedWhatsappImageFile);
        if (uploadWhatsappImageFileResult.success){
          const whatsappImageMessageFileID = uploadWhatsappImageFileResult.result.whatsappImageMessageFileID;
          const convertedWhatsappImageMessageFile = uploadWhatsappImageFileResult.result.whatsappImageMessageFile;
          var httpDataToSendWhatsappImageMessage =
          {
            'messaging_product': 'whatsapp', 
            'to': whatsappConversationRecipientPhoneNumber, 
            'type': 'image',
            'image': {'id': whatsappImageMessageFileID}
          };
          if (whatsappProductImageMessageCaption != null){
            httpDataToSendWhatsappImageMessage['image']['caption'] = whatsappProductImageMessageCaption;
          }
          httpDataToSendWhatsappImageMessage = JSON.stringify(httpDataToSendWhatsappImageMessage);
          const sendWhatsappMessageResult = await this.sendWhatsappMessage(httpDataToSendWhatsappImageMessage);
          if (sendWhatsappMessageResult.success){
            const whatsappGeneralMessageID = sendWhatsappMessageResult.result;
            const whatsappImageMessageID = whatsappGeneralMessageID;
            const whatsappGeneralMessageOwnerPhoneNumber = null;
            const whatsappGeneralMessageRepliedMessageID = null;
            const selectOrCreateActiveWhatsappConversationIDResult = await whatsappDatabaseFunctions.selectOrCreateActiveWhatsappConversationID(whatsappConversationRecipientPhoneNumber);
            if (selectOrCreateActiveWhatsappConversationIDResult.success){
              const whatsappConversationID = selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationID;
              const createWhatsappGeneralMessageResult = await whatsappDatabaseFunctions.createWhatsappGeneralMessage(whatsappConversationID, whatsappImageMessageID, whatsappGeneralMessageRepliedMessageID, whatsappGeneralMessageOwnerPhoneNumber);
              if (createWhatsappGeneralMessageResult.success){
                const whatsappGeneralMessageIndex = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageIndex;
                const whatsappGeneralMessageCreationDateTime = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageCreationDateTime;
                const createWhatsappImageMessageResult = await whatsappDatabaseFunctions.createWhatsappImageMessage(whatsappImageMessageID, convertedWhatsappImageMessageFile, whatsappProductImageMessageCaption);
                if (createWhatsappImageMessageResult.success){
                  const websocketMessageContent = 
                  {
                    success: true,
                    result: 
                    {
                      whatsappConversationID: whatsappConversationID,
                      whatsappGeneralMessageID: whatsappGeneralMessageID,
                      whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                      whatsappGeneralMessageType: 'image',
                      whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                      whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                      whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                      whatsappImageMessageID: whatsappImageMessageID,
                      whatsappImageMessageFileID: whatsappImageMessageFileID,
                      whatsappImageMessageCaption: whatsappProductImageMessageCaption,
                      whatsappImageMessageFile: Buffer.from(convertedWhatsappImageMessageFile).toString('base64')
                    }
                  };
                  sendWhatsappProductImageMessagePromiseResolve(JSON.stringify(websocketMessageContent));
                  websocketConnection.sendWebsocketMessage('/sendWhatsappMessage', websocketMessageContent);
                } else {
                  sendWhatsappProductImageMessagePromiseResolve(JSON.stringify(createWhatsappImageMessageResult));
                }
              } else {
                sendWhatsappProductImageMessagePromiseResolve(JSON.stringify(createWhatsappGeneralMessageResult));
              }
            } else {
              sendWhatsappProductImageMessagePromiseResolve(JSON.stringify(selectOrCreateActiveWhatsappConversationIDResult));
            }
          } else {
            sendWhatsappProductImageMessagePromiseResolve(JSON.stringify(sendWhatsappMessageResult));
          }
        } else {
          sendWhatsappProductImageMessagePromiseResolve(JSON.stringify(uploadWhatsappImageFileResult));
        }
      } else {
        sendWhatsappProductImageMessagePromiseResolve(JSON.stringify(downloadWhatsappImageFileResult));
      }
    });
    
  },

  receiveWhatsappMessage: async function(websocketConnection, httpRequest){
    try { 
      const whatsappConversationRecipientPhoneNumber = httpRequest['body']['entry'][0]['changes'][0]['value']['messages'][0]['from'];
      const whatsappGeneralMessageID = httpRequest['body']['entry'][0]['changes'][0]['value']['messages'][0]['id'];
      const whatsappMessageInformation = httpRequest['body']['entry'][0]['changes'][0]['value']['messages'][0];
      const receiveWhatsappStoreMessageResult = await this.receiveWhatsappStoreMessage(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappGeneralMessageID, whatsappMessageInformation);
      if (receiveWhatsappStoreMessageResult.success == false){
        const httpRequestQuery = httpRequest['body']['entry'][0]['changes'][0]['value']['messages'][0];
        const whatsappGeneralMessageOwnerPhoneNumber = httpRequestQuery.from;
        const whatsappGeneralMessageID = httpRequestQuery.id;
        const whatsappMessageType = httpRequestQuery.type;
        const whatsappMessageContent = httpRequestQuery[whatsappMessageType];
        var whatsappGeneralMessageRepliedMessageID = null;
        if (httpRequestQuery.context) {
          whatsappGeneralMessageRepliedMessageID = httpRequestQuery.context.id;
        }
        const selectOrCreateActiveWhatsappConversationIDResult = await whatsappDatabaseFunctions.selectOrCreateActiveWhatsappConversationID(whatsappGeneralMessageOwnerPhoneNumber);
        if (selectOrCreateActiveWhatsappConversationIDResult.success){
          const whatsappConversationID = selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationID;
          const createWhatsappGeneralMessageResult = await whatsappDatabaseFunctions.createWhatsappGeneralMessage(whatsappConversationID, whatsappGeneralMessageID, whatsappGeneralMessageRepliedMessageID, whatsappGeneralMessageOwnerPhoneNumber);
          if (createWhatsappGeneralMessageResult.success){
            const whatsappGeneralMessageIndex = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageIndex;
            const whatsappGeneralMessageCreationDateTime = createWhatsappGeneralMessageResult.result.whatsappGeneralMessageCreationDateTime;
          
            if (whatsappMessageType == 'text'){
              const whatsappTextMessageID = whatsappGeneralMessageID;
              const whatsappTextMessageBody = whatsappMessageContent.body;
              const createWhatsappTextMessageResult = await whatsappDatabaseFunctions.createWhatsappTextMessage(whatsappTextMessageID, whatsappTextMessageBody);
              if (createWhatsappTextMessageResult.success){
                const websocketMessageContent = selectOrCreateActiveWhatsappConversationIDResult.result;

                if (selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationIsActive){
                  websocketMessageContent['whatsappConversationMessages'] = 
                  [
                    {
                      whatsappConversationID: whatsappConversationID,
                      whatsappGeneralMessageID: whatsappGeneralMessageID,
                      whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                      whatsappGeneralMessageType: whatsappMessageType,
                      whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                      whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                      whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                      whatsappTextMessageID: whatsappTextMessageID,
                      whatsappTextMessageBody: whatsappTextMessageBody
                    }
                  ]
                  if (websocketMessageContent.whatsappConversationAssignedAgentID == null){
                    websocketConnection.sendWebsocketMessage('/receiveWhatsappPendingConversation', websocketMessageContent);
                  } else {
                    websocketConnection.sendWebsocketMessage('/receiveWhatsappConversation', websocketMessageContent);
                  }
                } else {
                  const websocketMessageContent = 
                  {
                    success: true,
                    result: 
                    {
                      whatsappConversationID: whatsappConversationID,
                      whatsappGeneralMessageID: whatsappGeneralMessageID,
                      whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                      whatsappGeneralMessageType: whatsappMessageType,
                      whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                      whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                      whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                      whatsappTextMessageID: whatsappTextMessageID,
                      whatsappTextMessageBody: whatsappTextMessageBody
                    }
                  };
                  websocketConnection.sendWebsocketMessage('/receiveWhatsappMessage', websocketMessageContent);
                }
              }

            } else if (whatsappMessageType == 'location') {
              const whatsappLocationMessageID = whatsappGeneralMessageID;
              const whatsappLocationMessageLatitude = whatsappMessageContent.latitude;
              const whatsappLocationMessageLongitude = whatsappMessageContent.longitude;
              const createWhatsappLocationMessageResult = await whatsappDatabaseFunctions.createWhatsappLocationMessage(whatsappLocationMessageID, whatsappLocationMessageLatitude, whatsappLocationMessageLongitude);
              if (createWhatsappLocationMessageResult.success){
                const websocketMessageContent = selectOrCreateActiveWhatsappConversationIDResult.result;

                if (selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationIsActive){
                  websocketMessageContent['whatsappConversationMessages'] = 
                  [
                    {
                      whatsappConversationID: whatsappConversationID,
                      whatsappGeneralMessageID: whatsappGeneralMessageID,
                      whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                      whatsappGeneralMessageType: whatsappMessageType,
                      whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                      whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                      whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                      whatsappLocationMessageID: whatsappLocationMessageID,
                      whatsappLocationMessageLatitude: whatsappLocationMessageLatitude,
                      whatsappLocationMessageLongitude: whatsappLocationMessageLongitude
                    }
                  ]
                  if (websocketMessageContent.whatsappConversationAssignedAgentID == null){
                    websocketConnection.sendWebsocketMessage('/receiveWhatsappPendingConversation', websocketMessageContent);
                  } else {
                    websocketConnection.sendWebsocketMessage('/receiveWhatsappConversation', websocketMessageContent);
                  }
                } else {
                  const websocketMessageContent = 
                  {
                    success: true,
                    result: 
                    {
                      whatsappConversationID: whatsappConversationID,
                      whatsappGeneralMessageID: whatsappGeneralMessageID,
                      whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                      whatsappGeneralMessageType: whatsappMessageType,
                      whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                      whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                      whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                      whatsappLocationMessageID: whatsappLocationMessageID,
                      whatsappLocationMessageLatitude: whatsappLocationMessageLatitude,
                      whatsappLocationMessageLongitude: whatsappLocationMessageLongitude
                    }
                  };
                  websocketConnection.sendWebsocketMessage('/receiveWhatsappMessage', websocketMessageContent);
                }
                
              }

            } else if (whatsappMessageType == 'contacts'){
              const whatsappContactMessageID = whatsappGeneralMessageID;
              const whatsappContactMessageName = whatsappMessageContent[0].name.formatted_name;
              const whatsappContactMessagePhoneNumber = whatsappMessageContent[0].phones[0].wa_id;
              const createWhatsappContactMessageResult = await whatsappDatabaseFunctions.createWhatsappContactMessage(whatsappContactMessageID, whatsappContactMessageName, whatsappContactMessagePhoneNumber);
              if (createWhatsappContactMessageResult.success){
                const websocketMessageContent = selectOrCreateActiveWhatsappConversationIDResult.result;

                if (selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationIsActive){
                  websocketMessageContent['whatsappConversationMessages'] = 
                  [
                    {
                      whatsappConversationID: whatsappConversationID,
                      whatsappGeneralMessageID: whatsappGeneralMessageID,
                      whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                      whatsappGeneralMessageType: 'contact',
                      whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                      whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                      whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                      whatsappContactMessageID: whatsappContactMessageID,
                      whatsappContactMessageName: whatsappContactMessageName,
                      whatsappContactMessagePhoneNumber: whatsappContactMessagePhoneNumber
                    }
                  ]
                  if (websocketMessageContent.whatsappConversationAssignedAgentID == null){
                    websocketConnection.sendWebsocketMessage('/receiveWhatsappPendingConversation', websocketMessageContent);
                  } else {
                    websocketConnection.sendWebsocketMessage('/receiveWhatsappConversation', websocketMessageContent);
                  }
                } else {
                  const websocketMessageContent = 
                  {
                    success: true,
                    result: 
                    {
                      whatsappConversationID: whatsappConversationID,
                      whatsappGeneralMessageID: whatsappGeneralMessageID,
                      whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                      whatsappGeneralMessageType: 'contact',
                      whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                      whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                      whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                      whatsappContactMessageID: whatsappContactMessageID,
                      whatsappContactMessageName: whatsappContactMessageName,
                      whatsappContactMessagePhoneNumber: whatsappContactMessagePhoneNumber
                    }
                  };
                  websocketConnection.sendWebsocketMessage('/receiveWhatsappMessage', websocketMessageContent);
                }
              }

            } else if ((whatsappMessageType == 'image') || (whatsappMessageType == 'sticker')){
              const whatsappImageMessageID = whatsappGeneralMessageID;
              const whatsappImageMessageFileID = whatsappMessageContent.id;
              var whatsappImageMessageCaption = whatsappMessageContent.caption;
              if (whatsappImageMessageCaption == undefined){
                whatsappImageMessageCaption = null;
              }
              const getWhatsappImageMessageFileFromWhatsappImageMessageFileIDResult = await this.getWhatsappImageMessageFileFromWhatsappImageMessageFileID(whatsappImageMessageFileID);
              if (getWhatsappImageMessageFileFromWhatsappImageMessageFileIDResult.success){
                const whatsappImageMessageFile = getWhatsappImageMessageFileFromWhatsappImageMessageFileIDResult.result;
                const createWhatsappImageMessageResult = await whatsappDatabaseFunctions.createWhatsappImageMessage(whatsappImageMessageID, whatsappImageMessageFile, whatsappImageMessageCaption);
                if (createWhatsappImageMessageResult.success){
                  const websocketMessageContent = selectOrCreateActiveWhatsappConversationIDResult.result;

                  if (selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationIsActive){
                    websocketMessageContent['whatsappConversationMessages'] = 
                    [
                      {
                        whatsappConversationID: whatsappConversationID,
                        whatsappGeneralMessageID: whatsappGeneralMessageID,
                        whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                        whatsappGeneralMessageType: 'image',
                        whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                        whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                        whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                        whatsappImageMessageID: whatsappImageMessageID,
                        whatsappImageMessageFileID: whatsappImageMessageFileID,
                        whatsappImageMessageCaption: whatsappImageMessageCaption,
                        whatsappImageMessageFile: Buffer.from(whatsappImageMessageFile).toString('base64')
                      }
                    ]
                    if (websocketMessageContent.whatsappConversationAssignedAgentID == null){
                      websocketConnection.sendWebsocketMessage('/receiveWhatsappPendingConversation', websocketMessageContent);
                    } else {
                      websocketConnection.sendWebsocketMessage('/receiveWhatsappConversation', websocketMessageContent);
                    }
                  } else {
                    const websocketMessageContent = 
                    {
                      success: true,
                      result: 
                      {
                        whatsappConversationID: whatsappConversationID,
                        whatsappGeneralMessageID: whatsappGeneralMessageID,
                        whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                        whatsappGeneralMessageType: 'image',
                        whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                        whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                        whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                        whatsappImageMessageID: whatsappImageMessageID,
                        whatsappImageMessageFileID: whatsappImageMessageFileID,
                        whatsappImageMessageCaption: whatsappImageMessageCaption,
                        whatsappImageMessageFile: Buffer.from(whatsappImageMessageFile).toString('base64')
                      }
                    };
                    websocketConnection.sendWebsocketMessage('/receiveWhatsappMessage', websocketMessageContent);
                  }
                }
              }
            } else if (whatsappMessageType == 'video'){
              const whatsappVideoMessageID = whatsappGeneralMessageID;
              const whatsappVideoMessageFileID = whatsappMessageContent.id;
              var whatsappVideoMessageCaption = whatsappMessageContent.caption;
              if (whatsappVideoMessageCaption == undefined){
                whatsappVideoMessageCaption = null;
              }
              const getWhatsappVideoMessageFileFromWhatsappVideoMessageFileIDResult = await this.getWhatsappVideoMessageFileFromWhatsappVideoMessageFileID(whatsappVideoMessageFileID);
              if (getWhatsappVideoMessageFileFromWhatsappVideoMessageFileIDResult.success){
                const whatsappVideoMessageFile = getWhatsappVideoMessageFileFromWhatsappVideoMessageFileIDResult.result;
                const createWhatsappVideoMessageResult = await whatsappDatabaseFunctions.createWhatsappVideoMessage(whatsappVideoMessageID, whatsappVideoMessageFile, whatsappVideoMessageCaption);
                if (createWhatsappVideoMessageResult.success){
                  const websocketMessageContent = selectOrCreateActiveWhatsappConversationIDResult.result;

                  if (selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationIsActive){
                    websocketMessageContent['whatsappConversationMessages'] = 
                    [
                      {
                        whatsappConversationID: whatsappConversationID,
                        whatsappGeneralMessageID: whatsappGeneralMessageID,
                        whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                        whatsappGeneralMessageType: whatsappMessageType,
                        whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                        whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                        whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                        whatsappVideoMessageID: whatsappVideoMessageID,
                        whatsappVideoMessageFileID: whatsappVideoMessageFileID,
                        whatsappVideoMessageCaption: whatsappVideoMessageCaption,
                        whatsappVideoMessageFile: Buffer.from(whatsappVideoMessageFile).toString('base64')
                      }
                    ]
                    if (websocketMessageContent.whatsappConversationAssignedAgentID == null){
                      websocketConnection.sendWebsocketMessage('/receiveWhatsappPendingConversation', websocketMessageContent);
                    } else {
                      websocketConnection.sendWebsocketMessage('/receiveWhatsappConversation', websocketMessageContent);
                    }
                  } else {
                    const websocketMessageContent = 
                    {
                      success: true,
                      result: 
                      {
                        whatsappConversationID: whatsappConversationID,
                        whatsappGeneralMessageID: whatsappGeneralMessageID,
                        whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                        whatsappGeneralMessageType: whatsappMessageType,
                        whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                        whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                        whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                        whatsappVideoMessageID: whatsappVideoMessageID,
                        whatsappVideoMessageFileID: whatsappVideoMessageFileID,
                        whatsappVideoMessageCaption: whatsappVideoMessageCaption,
                        whatsappVideoMessageFile: Buffer.from(whatsappVideoMessageFile).toString('base64')
                      }
                    };
                    websocketConnection.sendWebsocketMessage('/receiveWhatsappMessage', websocketMessageContent);
                  }
                } 
              }
            } else if (whatsappMessageType == 'audio'){
              const whatsappAudioMessageID = whatsappGeneralMessageID;
              const whatsappAudioMessageFileID = whatsappMessageContent.id;
              const getWhatsappAudioMessageFileFromWhatsappAudioMessageFileIDResult = await this.getWhatsappAudioMessageFileFromWhatsappAudioMessageFileID(whatsappAudioMessageFileID);
              if (getWhatsappAudioMessageFileFromWhatsappAudioMessageFileIDResult.success){
                const whatsappAudioMessageFile = getWhatsappAudioMessageFileFromWhatsappAudioMessageFileIDResult.result;
                const createWhatsappAudioMessageResult = await whatsappDatabaseFunctions.createWhatsappAudioMessage(whatsappAudioMessageID, whatsappAudioMessageFile);
                if (createWhatsappAudioMessageResult.success){
                  const websocketMessageContent = selectOrCreateActiveWhatsappConversationIDResult.result;

                  if (selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationIsActive){
                    websocketMessageContent['whatsappConversationMessages'] = 
                    [
                      {
                        whatsappConversationID: whatsappConversationID,
                        whatsappGeneralMessageID: whatsappGeneralMessageID,
                        whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                        whatsappGeneralMessageType: whatsappMessageType,
                        whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                        whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                        whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                        whatsappAudioMessageID: whatsappAudioMessageID,
                        whatsappAudioMessageFileID: whatsappAudioMessageFileID,
                        whatsappAudioMessageFile: Buffer.from(whatsappAudioMessageFile).toString('base64')
                      }
                    ]
                    if (websocketMessageContent.whatsappConversationAssignedAgentID == null){
                      websocketConnection.sendWebsocketMessage('/receiveWhatsappPendingConversation', websocketMessageContent);
                    } else {
                      websocketConnection.sendWebsocketMessage('/receiveWhatsappConversation', websocketMessageContent);
                    }
                  } else {
                    const websocketMessageContent = 
                    {
                      success: true,
                      result: 
                      {
                        whatsappConversationID: whatsappConversationID,
                        whatsappGeneralMessageID: whatsappGeneralMessageID,
                        whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                        whatsappGeneralMessageType: whatsappMessageType,
                        whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                        whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                        whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                        whatsappAudioMessageID: whatsappAudioMessageID,
                        whatsappAudioMessageFileID: whatsappAudioMessageFileID,
                        whatsappAudioMessageFile: Buffer.from(whatsappAudioMessageFile).toString('base64')
                      }
                    };
                    websocketConnection.sendWebsocketMessage('/receiveWhatsappMessage', websocketMessageContent);
                  }
                } 
              }  

            } else if (whatsappMessageType == 'document'){
              const whatsappDocumentMessageID = whatsappGeneralMessageID;
              const whatsappDocumentMessageFileID = whatsappMessageContent.id;
              const whatsappDocumentMessageFileName = whatsappMessageContent.filename;
              const whatsappDocumentMessageMimeType = whatsappMessageContent.mime_type;
              const getWhatsappDocumentessageFileFromWhatsappDocumentMessageFileIDResult = await this.getWhatsappDocumentessageFileFromWhatsappDocumentMessageFileID(whatsappDocumentMessageFileID);
              if (getWhatsappDocumentessageFileFromWhatsappDocumentMessageFileIDResult.success){
                const whatsappDocumentMessageFile = getWhatsappDocumentessageFileFromWhatsappDocumentMessageFileIDResult.result;
                const createWhatsappDocumentMessageResult = await whatsappDatabaseFunctions.createWhatsappDocumentMessage(whatsappDocumentMessageID, whatsappDocumentMessageFile, whatsappDocumentMessageMimeType, whatsappDocumentMessageFileName);
                if (createWhatsappDocumentMessageResult.success){
                  const websocketMessageContent = selectOrCreateActiveWhatsappConversationIDResult.result;

                  if (selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationIsActive){
                    websocketMessageContent['whatsappConversationMessages'] = 
                    [
                      {
                        whatsappConversationID: whatsappConversationID,
                        whatsappGeneralMessageID: whatsappGeneralMessageID,
                        whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                        whatsappGeneralMessageType: whatsappMessageType,
                        whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                        whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                        whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                        whatsappDocumentMessageID: whatsappDocumentMessageID,
                        whatsappDocumentMessageFileID: whatsappDocumentMessageFileID,
                        whatsappDocumentMessageMimeType: whatsappDocumentMessageMimeType,
                        whatsappDocumentMessageFileName: whatsappDocumentMessageFileName,
                        whatsappDocumentMessageFile: Buffer.from(whatsappDocumentMessageFile).toString('base64')
                      }
                    ]
                    if (websocketMessageContent.whatsappConversationAssignedAgentID == null){
                      websocketConnection.sendWebsocketMessage('/receiveWhatsappPendingConversation', websocketMessageContent);
                    } else {
                      websocketConnection.sendWebsocketMessage('/receiveWhatsappConversation', websocketMessageContent);
                    }
                  } else {
                    const websocketMessageContent = 
                    {
                      success: true,
                      result: 
                      {
                        whatsappConversationID: whatsappConversationID,
                        whatsappGeneralMessageID: whatsappGeneralMessageID,
                        whatsappGeneralMessageIndex: whatsappGeneralMessageIndex,
                        whatsappGeneralMessageType: whatsappMessageType,
                        whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessageRepliedMessageID,
                        whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime,
                        whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessageOwnerPhoneNumber,
                        whatsappDocumentMessageID: whatsappDocumentMessageID,
                        whatsappDocumentMessageFileID: whatsappDocumentMessageFileID,
                        whatsappDocumentMessageMimeType: whatsappDocumentMessageMimeType,
                        whatsappDocumentMessageFileName: whatsappDocumentMessageFileName,
                        whatsappDocumentMessageFile: Buffer.from(whatsappDocumentMessageFile).toString('base64')
                      }
                    };
                    websocketConnection.sendWebsocketMessage('/receiveWhatsappMessage', websocketMessageContent);
                  }
                } 
              }          
            }
          
            
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  },

  receiveWhatsappStoreMessage: async function(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappGeneralMessageID, whatsappMessageInformation){
    const storePhoneNumbers = {50670782096: 'Escazu', 50672527633: 'Zapote', 50670130555: 'Cartago'};
    if (whatsappConversationRecipientPhoneNumber in storePhoneNumbers){
      try {
        const whatsappMessageInformationToFormat = whatsappMessageInformation['text']['body'].split('\n');
        const storeMessageStoreMessageID = whatsappGeneralMessageID;
        const storeMessageStoreName = storePhoneNumbers[whatsappConversationRecipientPhoneNumber];
        const storeMessageRecipientPhoneNumber = whatsappMessageInformationToFormat[0].split('NUMERO: ')[1];
        const storeMessageRecipientProfileName = whatsappMessageInformationToFormat[1].split('NOMBRE: ')[1];
        const storeMessageRecipientOrder = whatsappMessageInformationToFormat[2].split('PEDIDO: ')[1];
        const storeMessageRecipientID = whatsappMessageInformationToFormat[3].split('CEDULA: ')[1];
        const insertStoreMessageResult = await whatsappDatabaseFunctions.insertStoreMessage(storeMessageStoreMessageID, storeMessageStoreName, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, storeMessageRecipientOrder, storeMessageRecipientID);
        if (insertStoreMessageResult.success){
          websocketConnection.sendWebsocketMessage('/receiveWhatsappStoreMessage', insertStoreMessageResult);
          return insertStoreMessageResult;
        } else {
          return {success: true};
        }
      } catch (error) {
        const sendWhatsappMessageData = 
        {
          'messaging_product': 'whatsapp',
          'to': whatsappConversationRecipientPhoneNumber,
          'type': 'text',
          'text': {'body': 'FORMATO INCORRECTO'},
          'context': {'message_id': whatsappGeneralMessageID}
        };
        await this.sendWhatsappMessage(sendWhatsappMessageData);
        return {success: true};
      }
    } else {
      return {success: false};
    }
    
  },

  sendWhatsappStoreMessage: async function(storeMessageStoreName, storeMessageStoreMessageID){
    const storePhoneNumbers = {'Escazu': 50670782096, 'Zapote': 50672527633, 'Cartago': 50670130555};
    const sendWhatsappMessageData = 
    {
      'messaging_product': 'whatsapp',
      'to': storePhoneNumbers[storeMessageStoreName],
      'type': 'text',
      'text': {'body': 'LISTO'},
      'context': {'message_id': storeMessageStoreMessageID}
    };
    const sendWhatsappMessageResult = await this.sendWhatsappMessage(sendWhatsappMessageData);
    return sendWhatsappMessageResult;
  },

  startWhatsappStoreConversation: async function(storeMessageAssignedAgentID, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, messageToClientContent){
    return new Promise(async (startWhatsappStoreConversationPromiseResolve) => {
      const sendWhatsappMessageData =
      {
        'messaging_product': 'whatsapp',
        'to': storeMessageRecipientPhoneNumber, 
        'type': 'template', 'template': {'name': 'bienvenida', 'language': {'code': 'es'},
        'components': [{'type': 'body', 'parameters': [{'type': 'text', 'text': messageToClientContent}]}]     
        }
      };
      const sendWhatsappMessageResult = await this.sendWhatsappMessage(sendWhatsappMessageData);
      if (sendWhatsappMessageResult.success){
        const createWhatsappConversationWithWhatsappConversationAssignedAgentIDResult = await whatsappDatabaseFunctions.createWhatsappConversationWithWhatsappConversationAssignedAgentID(storeMessageAssignedAgentID, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName);
        if (createWhatsappConversationWithWhatsappConversationAssignedAgentIDResult.success){
          const whatsappConversationID = createWhatsappConversationWithWhatsappConversationAssignedAgentIDResult.result;
          const whatsappGeneralMessageID = sendWhatsappMessageResult.result;
          const createWhatsappGeneralMessageResult = await whatsappDatabaseFunctions.createWhatsappGeneralMessage(whatsappConversationID, whatsappGeneralMessageID, null, null);
          if (createWhatsappGeneralMessageResult.success){
            const createWhatsappTextMessageResult = await whatsappDatabaseFunctions.createWhatsappTextMessage(whatsappGeneralMessageID, messageToClientContent);
            if (createWhatsappTextMessageResult.success){
              startWhatsappStoreConversationPromiseResolve(JSON.stringify({success: true, result: whatsappConversationID}));
            } else {
              startWhatsappStoreConversationPromiseResolve(JSON.stringify(createWhatsappTextMessageResult));
            }
          } else {
            startWhatsappStoreConversationPromiseResolve(JSON.stringify(createWhatsappGeneralMessageResult));
          }
        } else {
          startWhatsappStoreConversationPromiseResolve(JSON.stringify(createWhatsappConversationWithWhatsappConversationAssignedAgentIDResult));
        }
      } else {
        startWhatsappStoreConversationPromiseResolve(JSON.stringify(sendWhatsappMessageResult));
      }
    });
  },

  getWhatsappImageMessageFileFromWhatsappImageMessageFileID: async function(whatsappImageMessageFileID){
    return new Promise(async (getWhatsappImageMessageFileFromWhatsappImageMessageFileIDPromiseResolve) => {
      const getWhatsappDownloadImageURL = `https://graph.facebook.com/${constants.credentials.apiVersion}/${whatsappImageMessageFileID}`;
      const getWhatsappDownloadImageHeaders = {'Content-Type': 'application/json', 'Authorization': `Bearer ${constants.credentials.apiKey}`};
      axios.get(getWhatsappDownloadImageURL, {headers: getWhatsappDownloadImageHeaders}).then(async (response) => {
        const whatsappDownloadImageURL = response.data.url;
        axios.get(whatsappDownloadImageURL, {headers: getWhatsappDownloadImageHeaders, 'responseType': 'arraybuffer'}).then(async (response) => {
          const whatsappImageFile = new Uint8Array(response.data).buffer;
          getWhatsappImageMessageFileFromWhatsappImageMessageFileIDPromiseResolve({success: true, result: whatsappImageFile});
        })
        .catch((error) => {
          getWhatsappImageMessageFileFromWhatsappImageMessageFileIDPromiseResolve({success: false, result: 'An error ocurred when trying to download the Whatsapp message image.'});
        });
      })
      .catch((error) => {
        getWhatsappImageMessageFileFromWhatsappImageMessageFileIDPromiseResolve({success: false, result: 'An error ocurred when trying to get the Whatsapp message download image URL.'});
      });
    });
  },

  getWhatsappVideoMessageFileFromWhatsappVideoMessageFileID: async function(whatsappVideoMessageFileID){
    return new Promise(async (getWhatsappVideoMessageFileFromWhatsappVideoMessageFileIDPromiseResolve) => {
      const getWhatsappDownloadVideoURL = `https://graph.facebook.com/${constants.credentials.apiVersion}/${whatsappVideoMessageFileID}`;
      const getWhatsappDownloadVideoHeaders = {'Content-Type': 'application/json', 'Authorization': `Bearer ${constants.credentials.apiKey}`};
      axios.get(getWhatsappDownloadVideoURL, {headers: getWhatsappDownloadVideoHeaders}).then(async (response) => {
        const whatsappDownloadVideoURL = response.data.url;
        axios.get(whatsappDownloadVideoURL, {headers: getWhatsappDownloadVideoHeaders, 'responseType': 'arraybuffer'}).then(async (response) => {
          const whatsappVideoFile = new Uint8Array(response.data).buffer;  
          getWhatsappVideoMessageFileFromWhatsappVideoMessageFileIDPromiseResolve({success: true, result: whatsappVideoFile});
        })
        .catch((error) => {
          getWhatsappVideoMessageFileFromWhatsappVideoMessageFileIDPromiseResolve({success: false, result: 'An error ocurred when trying to download the Whatsapp message video.'});
        });
      })
      .catch((error) => {
        getWhatsappVideoMessageFileFromWhatsappVideoMessageFileIDPromiseResolve({success: false, result: 'An error ocurred when trying to get the Whatsapp message download video URL.'});
      });
    });
  },

  getWhatsappAudioMessageFileFromWhatsappAudioMessageFileID: async function(whatsappAudioMessageFileID){
    return new Promise(async (getWhatsappAudioMessageFileFromWhatsappAudioMessageFileIDPromiseResolve) => {
      const getWhatsappDownloadAudioURL = `https://graph.facebook.com/${constants.credentials.apiVersion}/${whatsappAudioMessageFileID}`;
      const getWhatsappDownloadAudioHeaders = {'Content-Type': 'application/json', 'Authorization': `Bearer ${constants.credentials.apiKey}`};
      axios.get(getWhatsappDownloadAudioURL, {headers: getWhatsappDownloadAudioHeaders}).then(async (response) => {
        const whatsappDownloadAudioURL = response.data.url;
        axios.get(whatsappDownloadAudioURL, {headers: getWhatsappDownloadAudioHeaders, 'responseType': 'arraybuffer'}).then(async (response) => {
          const whatsappAudioFile = new Uint8Array(response.data).buffer;  
          getWhatsappAudioMessageFileFromWhatsappAudioMessageFileIDPromiseResolve({success: true, result: whatsappAudioFile});
        })
        .catch((error) => {
          getWhatsappAudioMessageFileFromWhatsappAudioMessageFileIDPromiseResolve({success: false, result: 'An error ocurred when trying to download the Whatsapp message audio.'});
        });
      })
      .catch((error) => {
        getWhatsappAudioMessageFileFromWhatsappAudioMessageFileIDPromiseResolve({success: false, result: 'An error ocurred when trying to get the Whatsapp message download audio URL.'});
      });
    });
  },

  getWhatsappDocumentessageFileFromWhatsappDocumentMessageFileID: async function(whatsappDocumentMessageFileID){
    return new Promise(async (getWhatsappAudioMessageFileFromWhatsappAudioMessageFileIDPromiseResolve) => {
      const getWhatsappDownloadDocumentURL = `https://graph.facebook.com/${constants.credentials.apiVersion}/${whatsappDocumentMessageFileID}`;
      const getWhatsappDownloadDocumentHeaders = {'Content-Type': 'application/json', 'Authorization': `Bearer ${constants.credentials.apiKey}`};
      axios.get(getWhatsappDownloadDocumentURL, {headers: getWhatsappDownloadDocumentHeaders}).then(async (response) => {
        const whatsappDownloadDocumentURL = response.data.url;
        axios.get(whatsappDownloadDocumentURL, {headers: getWhatsappDownloadDocumentHeaders, 'responseType': 'arraybuffer'}).then(async (response) => {
          const whatsappDocumentFile = new Uint8Array(response.data).buffer;  
          getWhatsappAudioMessageFileFromWhatsappAudioMessageFileIDPromiseResolve({success: true, result: whatsappDocumentFile});
        })
        .catch(() => {
          getWhatsappAudioMessageFileFromWhatsappAudioMessageFileIDPromiseResolve({success: false, result: 'An error ocurred when trying to download the Whatsapp message document.'});
        });
      })
      .catch(() => {
        getWhatsappAudioMessageFileFromWhatsappAudioMessageFileIDPromiseResolve({success: false, result: 'An error ocurred when trying to get the Whatsapp message download document URL.'});
      });
    });
  },

  closeWhatsappConversation: async function(websocketConnection, whatsappConversationRecipientPhoneNumber, whatsappConversationCloseComment, whatsappConversationAmount, whatsappConversationProducts, whatsappTextMessageBody, sendAgentEndMessage){
    return new Promise(async (closeWhatsappConversationPromiseResolve) => {
      const selectOrCreateActiveWhatsappConversationIDResult = await whatsappDatabaseFunctions.selectOrCreateActiveWhatsappConversationID(whatsappConversationRecipientPhoneNumber);
      if (selectOrCreateActiveWhatsappConversationIDResult.success){
        const whatsappConversationID = selectOrCreateActiveWhatsappConversationIDResult.result.whatsappConversationID;
        const closeWhatsappConversationResult = await whatsappDatabaseFunctions.closeWhatsappConversation(whatsappConversationID, whatsappConversationCloseComment, whatsappConversationAmount, whatsappConversationProducts);
        if (sendAgentEndMessage){
          const sendWhatsappMessageData =
          {
            'messaging_product': 'whatsapp',
            'to': whatsappConversationRecipientPhoneNumber, 
            'type': 'template', 'template': {'name': 'despedida', 'language': {'code': 'es'},
            'components': [{'type': 'body', 'parameters': [{'type': 'text', 'text': whatsappTextMessageBody}]}]     
            }
          };
          const sendWhatsappMessageResult = await this.sendWhatsappMessage(sendWhatsappMessageData);
        }
        closeWhatsappConversationPromiseResolve(JSON.stringify({success: true, result: whatsappConversationID}));
      } else {
        closeWhatsappConversationPromiseResolve(JSON.stringify(selectOrCreateActiveWhatsappConversationIDResult));
      }
    });
  },
  
  selectAllWhatsappPendingConversation: async function(){
    return new Promise(async (selectAllWhatsappPendingConversationPromiseResolve) => {
      const selectWhatsappConversationWithNoAssignedAgentIDResult = await whatsappDatabaseFunctions.selectWhatsappConversationWithNoAssignedAgentID(true);
      selectAllWhatsappPendingConversationPromiseResolve(JSON.stringify(selectWhatsappConversationWithNoAssignedAgentIDResult));
    });
  },


  grabWhatsappPendingConversation: async function(websocketConnection, whatsappConversationID, whatsappConversationAssignedAgentID, whatsappConversationRecipientPhoneNumber, whatsappTextMessageBody){
    return new Promise(async (grabWhatsappPendingConversationPromiseResolve) => {
      const sendWhatsappMessageData =
      {
        'messaging_product': 'whatsapp',
        'to': whatsappConversationRecipientPhoneNumber, 
        'type': 'template', 'template': {'name': 'bienvenida', 'language': {'code': 'es'},
        'components': [{'type': 'body', 'parameters': [{'type': 'text', 'text': whatsappTextMessageBody}]}]     
        }
      };
      const sendWhatsappMessageResult = await this.sendWhatsappMessage(sendWhatsappMessageData);
      if (sendWhatsappMessageResult.success){
        const whatsappGeneralMessageID = sendWhatsappMessageResult.result;
        const createWhatsappGeneralMessageResult = await whatsappDatabaseFunctions.createWhatsappGeneralMessage(whatsappConversationID, whatsappGeneralMessageID, null, null);
        if (createWhatsappGeneralMessageResult.success){
          const createWhatsappTextMessageResult = await whatsappDatabaseFunctions.createWhatsappTextMessage(whatsappGeneralMessageID, whatsappTextMessageBody);
          if (createWhatsappTextMessageResult.success){
            const updateAssignedAgentToConversation = await whatsappDatabaseFunctions.updateAssignedAgentToConversation(whatsappConversationID, whatsappConversationAssignedAgentID);
            if (updateAssignedAgentToConversation.success){
              websocketConnection.sendWebsocketMessage('/grabPendingConversation', {success: true, result: whatsappConversationID});
              grabWhatsappPendingConversationPromiseResolve(JSON.stringify({success: true, result: whatsappConversationID}));
            } else {
              grabWhatsappPendingConversationPromiseResolve(JSON.stringify(updateAssignedAgentToConversation));
            }
          } else {
            grabWhatsappPendingConversationPromiseResolve(JSON.stringify(createWhatsappTextMessageResult));
          }
        } else {
          grabWhatsappPendingConversationPromiseResolve(JSON.stringify(createWhatsappGeneralMessageResult));
        }
        
      } else {
        grabWhatsappPendingConversationPromiseResolve(JSON.stringify(sendWhatsappMessageResult));
      }
    });
  },


  requestTransferWhatsappConversation: async function(websocketConnection, currentAgentID, currentAgentName, newAgentID, whatsappConversationID, whatsappConversationProducts){
    return new Promise(async (requestTransferWhatsappConversationPromiseResolve) => {
      websocketConnection.sendWebsocketMessage('/requestTransferWhatsappConversation', {success: true, result: {currentAgentID: currentAgentID, currentAgentName: currentAgentName, newAgentID: newAgentID, whatsappConversationID: whatsappConversationID, whatsappConversationProducts: whatsappConversationProducts}});    
      requestTransferWhatsappConversationPromiseResolve(JSON.stringify({success: true}));
    });
  },

  acceptTransferWhatsappConversation: async function(websocketConnection, currentAgentID, newAgentID, whatsappConversationID){
    return new Promise(async (acceptTransferWhatsappConversationPromiseResolve) => {
      const updateAssignedAgentToConversation = await whatsappDatabaseFunctions.updateAssignedAgentToConversation(whatsappConversationID, newAgentID);
      if (updateAssignedAgentToConversation.success){
        websocketConnection.sendWebsocketMessage('/acceptTransferWhatsappConversation', {success: true, result: {currentAgentID: currentAgentID, whatsappConversationID: whatsappConversationID}});
        acceptTransferWhatsappConversationPromiseResolve(JSON.stringify({success: true, result: {currentAgentID: currentAgentID, whatsappConversationID: whatsappConversationID}}));
      } else {
        acceptTransferWhatsappConversationPromiseResolve(JSON.stringify(updateAssignedAgentToConversation));
      }
    });
  },

  selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumber: async function(whatsappConversationRecipientPhoneNumber){
    return new Promise(async (selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberPromiseResolve) => {
      const selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberResult = await whatsappDatabaseFunctions.selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumber(whatsappConversationRecipientPhoneNumber);
      selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberPromiseResolve(JSON.stringify(selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberResult));
    });
  },

}