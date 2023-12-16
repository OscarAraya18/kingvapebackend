const constants = require('../constants.js');
const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');


module.exports = {
  insertStoreMessage: async function(storeMessageStoreMessageID, storeMessageStoreName, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, storeMessageRecipientOrder, storeMessageRecipientID){
    return new Promise(async (insertStoreMessagesPromiseResolve) => {
      const insertStoreMessageSQL = `INSERT INTO StoreMessages (storeMessageStoreMessageID, storeMessageStoreName, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, storeMessageRecipientOrder, storeMessageRecipientID, storeMessageStartDateTime) VALUES (?, ?, ?, ?, ?, ?, ?);`;
      const storeMessageStartDateTime = new Date().toString();
      const insertStoreMessageValues = [storeMessageStoreMessageID, storeMessageStoreName, storeMessageRecipientPhoneNumber, storeMessageRecipientProfileName, storeMessageRecipientOrder, storeMessageRecipientID, storeMessageStartDateTime];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(insertStoreMessageSQL, insertStoreMessageValues);
      if (databaseResult.success){
        const storeMessageID = databaseResult.result.insertId;
        const insertStoreMessageContent = 
        {
          success: true, 
          result: 
          {
            storeMessageID: storeMessageID, 
            storeMessageStoreMessageID: storeMessageStoreMessageID,
            storeMessageStoreName: storeMessageStoreName, 
            storeMessageRecipientPhoneNumber: storeMessageRecipientPhoneNumber, 
            storeMessageRecipientProfileName: storeMessageRecipientProfileName,
            storeMessageRecipientOrder: storeMessageRecipientOrder,
            storeMessageRecipientID: storeMessageRecipientID,
            storeMessageStartDateTime: storeMessageStartDateTime
          }
        };
        insertStoreMessagesPromiseResolve(insertStoreMessageContent);
      } else {
        insertStoreMessagesPromiseResolve(databaseResult);
      }
    });
  },

  selectWhatsappConversationAssignedAgentID: async function(){
    return new Promise (async (selectWhatsappConversationAssignedAgentIDPromiseResolve) => {
      const agentStatus = 'online';
      const whatsappConversationIsActive = true;
      const selectWhatsappConversationAssignedAgentIDSQL = 
      `
        SELECT agentID
        FROM Agents
        WHERE agentStatus=(?)
        ORDER BY (
          SELECT COUNT(*)
          FROM WhatsappConversations
          WHERE 
            WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
            AND
            WhatsappConversations.whatsappConversationIsActive = (?)
        ) ASC, RAND()
        LIMIT 1;
      `;
      const selectWhatsappConversationAssignedAgentIDValues = [agentStatus, whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectWhatsappConversationAssignedAgentIDSQL, selectWhatsappConversationAssignedAgentIDValues);
      if (databaseResult.success){
        if (databaseResult.result[0]){
          var whatsappConversationAgentID = databaseResult.result[0].agentID;
        } else {
          var whatsappConversationAgentID = null;
        }
        selectWhatsappConversationAssignedAgentIDPromiseResolve({success: true, result: whatsappConversationAgentID});
      } else {
        selectWhatsappConversationAssignedAgentIDPromiseResolve(databaseResult);
      }
    });
  },

  selectActiveWhatsappConversationID: async function(whatsappConversationRecipientPhoneNumber){
    return new Promise(async (selectActiveWhatsappConversationResultPromiseResolve) => {
      const whatsappConversationIsActive = true;
      const selectActiveWhatsappConversationIDSQL = `SELECT whatsappConversationID from WhatsappConversations WHERE whatsappConversationRecipientPhoneNumber=(?) AND whatsappConversationIsActive=(?);`;
      const selectActiveWhatsappConversationIDValues = [whatsappConversationRecipientPhoneNumber, whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectActiveWhatsappConversationIDSQL, selectActiveWhatsappConversationIDValues);
      if (databaseResult.success){
        if (databaseResult.result.length == 0){
          selectActiveWhatsappConversationResultPromiseResolve({success: true, result: databaseResult.result});
        } else {
          selectActiveWhatsappConversationResultPromiseResolve({success: false, result: databaseResult.result});
        }
      } else {
        selectActiveWhatsappConversationResultPromiseResolve(databaseResult);
      }
    });
  },

  selectWhatsappConversationWithNoAssignedAgentID: async function(whatsappConversationIsActive){
    return new Promise(async (selectWhatsappConversationWithNoAssignedAgentIDPromiseResolve) => {
      const selectWhatsappConversationWithNoAssignedAgentIDSQL = `SELECT * from WhatsappConversations WHERE whatsappConversationAssignedAgentID IS NULL AND whatsappConversationIsActive=(?);`;
      const selectWhatsappConversationWithNoAssignedAgentIDValues = [whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectWhatsappConversationWithNoAssignedAgentIDSQL, selectWhatsappConversationWithNoAssignedAgentIDValues);
      selectWhatsappConversationWithNoAssignedAgentIDPromiseResolve(databaseResult);
    });
  },

  
  selectWhatsappContactInformation: async function(whatsappConversationRecipientPhoneNumber){
    return new Promise(async (selectWhatsappContactInformationPromiseResolve) => {
      const selectWhatsappContactInformationSQL = `SELECT * FROM Contacts WHERE contactPhoneNumber=(?);`;
      const selectWhatsappContactInformationValues = [whatsappConversationRecipientPhoneNumber];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectWhatsappContactInformationSQL, selectWhatsappContactInformationValues);
      if (databaseResult.success){
        if (databaseResult.result.length == 0){
          selectWhatsappContactInformationPromiseResolve
          ({
            success: true, 
            result: 
            {
              contactID: '', 
              contactName: 'No registrado', 
              contactEmail: 'NA', 
              contactLocations:
              JSON.stringify({
                'CASA': {
                  'latitude': 0,
                  'longitude': 0
                },
                'TRABAJO': {
                  'latitude': 0,
                  'longitude': 0
                },
                'OTRO': {
                  'latitude': 0,
                  'longitude': 0
                }
              }),
              contactLocationDetails: 'NA',
              contactNote: 'NA' 
            }
          });
        } else {
          selectWhatsappContactInformationPromiseResolve
          ({
            success: true, 
            result: 
            {
              contactID: databaseResult.result[0].contactID, 
              contactName: databaseResult.result[0].contactName, 
              contactEmail: databaseResult.result[0].contactEmail, 
              contactLocations: databaseResult.result[0].contactLocations,
              contactLocationDetails: databaseResult.result[0].contactLocationDetails,
              contactNote: databaseResult.result[0].contactNote
            }
          });
        }
      } else {
        selectWhatsappContactInformationPromiseResolve(databaseResult);
      }
    });
  },

  selectOrCreateActiveWhatsappConversationID: async function(whatsappConversationRecipientPhoneNumber){
    return new Promise(async (selectOrCreateActiveWhatsappConversationIDPromiseResolve) => {
      const whatsappConversationIsActive = true;
      const selectActiveWhatsappConversationSQL = `SELECT whatsappConversationID from WhatsappConversations WHERE whatsappConversationRecipientPhoneNumber=(?) AND whatsappConversationIsActive=(?);`;
      const selectActiveWhatsappConversationValues = [whatsappConversationRecipientPhoneNumber, whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectActiveWhatsappConversationSQL, selectActiveWhatsappConversationValues);
      if (databaseResult.success){
        if (databaseResult.result.length == 0){
          const createWhatsappConversationResult = await this.createWhatsappConversation(whatsappConversationRecipientPhoneNumber);
          if (createWhatsappConversationResult.success){
            selectOrCreateActiveWhatsappConversationIDPromiseResolve({success: true, result: createWhatsappConversationResult.result});
          } else {
            selectOrCreateActiveWhatsappConversationIDPromiseResolve(createWhatsappConversationResult);
          }
        } else if (databaseResult.result.length == 1){
          const whatsappConversationID = databaseResult.result[0].whatsappConversationID;
          selectOrCreateActiveWhatsappConversationIDPromiseResolve({success: true, result: {whatsappConversationID: whatsappConversationID}});
        } else {
          selectOrCreateActiveWhatsappConversationIDPromiseResolve(databaseResult);
        }
      } else {
        selectOrCreateActiveWhatsappConversationIDPromiseResolve(databaseResult);
      }
    });
  },

  selectOrCreateActiveWhatsappConversationFromContactList: async function(whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName, whatsappConversationAssignedAgentID){
    return new Promise(async (selectOrCreateActiveWhatsappConversationFromContactListPromiseResolve) => {
      const whatsappConversationIsActive = true;
      const selectActiveWhatsappConversationSQL = `SELECT whatsappConversationID from WhatsappConversations WHERE whatsappConversationRecipientPhoneNumber=(?) AND whatsappConversationIsActive=(?);`;
      const selectActiveWhatsappConversationValues = [whatsappConversationRecipientPhoneNumber, whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectActiveWhatsappConversationSQL, selectActiveWhatsappConversationValues);
      if (databaseResult.success){
        if (databaseResult.result.length == 0){
          const createWhatsappConversationFromContactListResult = await this.createWhatsappConversationFromContactList(whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName, whatsappConversationAssignedAgentID);
          if (createWhatsappConversationFromContactListResult.success){
            selectOrCreateActiveWhatsappConversationFromContactListPromiseResolve({success: true, result: createWhatsappConversationFromContactListResult.result});
          } else {
            selectOrCreateActiveWhatsappConversationFromContactListPromiseResolve(createWhatsappConversationFromContactListResult);
          }
        } else {
          selectOrCreateActiveWhatsappConversationFromContactListPromiseResolve({success: false, result: databaseResult.result});
        }
      } else {
        selectOrCreateActiveWhatsappConversationFromContactListPromiseResolve(databaseResult);
      }
    });
  },

  createWhatsappConversationFromContactList: async function(whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName, whatsappConversationAssignedAgentID){
    return new Promise (async (createWhatsappConversationPromiseResolve) => { 
      const selectWhatsappContactInformationResult = await this.selectWhatsappContactInformation(whatsappConversationRecipientPhoneNumber);
      if (selectWhatsappContactInformationResult.success) {
        const whatsappConversationRecipientProfileName = selectWhatsappContactInformationResult.result.contactName;
        const whatsappConversationRecipientID = selectWhatsappContactInformationResult.result.contactID;
        const whatsappConversationRecipientEmail = selectWhatsappContactInformationResult.result.contactEmail;
        const whatsappConversationRecipientLocations = selectWhatsappContactInformationResult.result.contactLocations;
        const whatsappConversationRecipientLocationDetails = selectWhatsappContactInformationResult.result.contactLocationDetails;
        const whatsappConversationRecipientNote = selectWhatsappContactInformationResult.result.contactNote;
        const whatsappConversationStartDateTime = Date().toString();
        const whatsappConversationEndDateTime = null;
        const whatsappConversationIsActive = true;
        const createWhatsappConversationFromContactListSQL = `INSERT INTO WhatsappConversations (whatsappConversationAssignedAgentID, whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName, whatsappConversationRecipientID, whatsappConversationRecipientEmail, whatsappConversationRecipientLocations, whatsappConversationRecipientLocationDetails, whatsappConversationRecipientNote, whatsappConversationStartDateTime, whatsappConversationEndDateTime, whatsappConversationIsActive) VALUES (?,?,?,?,?,?,?,?,?,?,?);`;
          const createWhatsappConversationFromContactListValues = [whatsappConversationAssignedAgentID, whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName, whatsappConversationRecipientID, whatsappConversationRecipientEmail, whatsappConversationRecipientLocations, whatsappConversationRecipientLocationDetails, whatsappConversationRecipientNote, whatsappConversationStartDateTime, whatsappConversationEndDateTime, whatsappConversationIsActive];
        const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(createWhatsappConversationFromContactListSQL, createWhatsappConversationFromContactListValues);
        if (databaseResult.success){
          const whatsappConversationID = databaseResult.result.insertId;
          const createWhatsappConversationPromiseResult = 
          {
            whatsappConversationID: whatsappConversationID, 
            whatsappConversationAssignedAgentID: whatsappConversationAssignedAgentID, 
            whatsappConversationRecipientPhoneNumber: whatsappConversationRecipientPhoneNumber,
            whatsappConversationRecipientProfileName: whatsappConversationRecipientProfileName,
            whatsappConversationStartDateTime: whatsappConversationStartDateTime,
            whatsappConversationEndDateTime: whatsappConversationEndDateTime,
            whatsappConversationIsActive: whatsappConversationIsActive
          }
          createWhatsappConversationPromiseResolve({success: true, result: createWhatsappConversationPromiseResult});
        } else {
          createWhatsappConversationPromiseResolve(databaseResult);
        }
      } else {
        createWhatsappConversationPromiseResolve(selectWhatsappContactInformationResult);
      }
    });
  },

  closeWhatsappConversation: async function(whatsappConversationID, whatsappConversationCloseComment, whatsappConversationAmount, whatsappConversationProducts){
    return new Promise (async (closeWhatsappConversationPromiseResolve) => {
      const whatsappConversationEndDateTime = Date().toString();
      const whatsappConversationIsActive = false;
      const closeWhatsappConversationSQL = `UPDATE WhatsappConversations SET whatsappConversationEndDateTime=(?), whatsappConversationIsActive=(?), whatsappConversationCloseComment=(?), whatsappConversationAmount=(?), whatsappConversationProducts=(?) WHERE whatsappConversationID=(?);`;
      const closeWhatsappConversationValues = [whatsappConversationEndDateTime, whatsappConversationIsActive, whatsappConversationCloseComment, parseFloat(whatsappConversationAmount), JSON.stringify(whatsappConversationProducts), whatsappConversationID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(closeWhatsappConversationSQL, closeWhatsappConversationValues);
      closeWhatsappConversationPromiseResolve(databaseResult);
    });
  }, 
  
  createWhatsappConversation: async function(whatsappConversationRecipientPhoneNumber){
    return new Promise (async (createWhatsappConversationPromiseResolve) => {
      const selectWhatsappConversationAssignedAgentIDResult = await this.selectWhatsappConversationAssignedAgentID();
      if (selectWhatsappConversationAssignedAgentIDResult.success){
        const whatsappConversationAssignedAgentID = selectWhatsappConversationAssignedAgentIDResult.result;
        const selectWhatsappContactInformationResult = await this.selectWhatsappContactInformation(whatsappConversationRecipientPhoneNumber);
        if (selectWhatsappContactInformationResult.success){


          const whatsappConversationRecipientProfileName = selectWhatsappContactInformationResult.result.contactName;
          const whatsappConversationRecipientID = selectWhatsappContactInformationResult.result.contactID;
          const whatsappConversationRecipientEmail = selectWhatsappContactInformationResult.result.contactEmail;
          const whatsappConversationRecipientLocations = selectWhatsappContactInformationResult.result.contactLocations;
          const whatsappConversationRecipientLocationDetails = selectWhatsappContactInformationResult.result.contactLocationDetails;
          const whatsappConversationRecipientNote = selectWhatsappContactInformationResult.result.contactNote;


          const whatsappConversationStartDateTime = Date().toString();
          const whatsappConversationEndDateTime = null;
          const whatsappConversationIsActive = true;
          const createWhatsappConversationSQL = `INSERT INTO WhatsappConversations (whatsappConversationAssignedAgentID, whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName, whatsappConversationRecipientID, whatsappConversationRecipientEmail, whatsappConversationRecipientLocations, whatsappConversationRecipientLocationDetails, whatsappConversationRecipientNote, whatsappConversationStartDateTime, whatsappConversationEndDateTime, whatsappConversationIsActive) VALUES (?,?,?,?,?,?,?,?,?,?,?);`;
          const createWhatsappConversationValues = [whatsappConversationAssignedAgentID, whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName, whatsappConversationRecipientID, whatsappConversationRecipientEmail, whatsappConversationRecipientLocations, whatsappConversationRecipientLocationDetails, whatsappConversationRecipientNote, whatsappConversationStartDateTime, whatsappConversationEndDateTime, whatsappConversationIsActive];
          const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(createWhatsappConversationSQL, createWhatsappConversationValues);
          if (databaseResult.success){
            const whatsappConversationID = databaseResult.result.insertId;
            const createWhatsappConversationPromiseResult = 
            {
              whatsappConversationID: whatsappConversationID, 
              whatsappConversationAssignedAgentID: whatsappConversationAssignedAgentID, 
              whatsappConversationRecipientPhoneNumber: whatsappConversationRecipientPhoneNumber,
              whatsappConversationRecipientProfileName: whatsappConversationRecipientProfileName,
              whatsappConversationRecipientProfileName: selectWhatsappContactInformationResult.result.contactName,
              whatsappConversationRecipientID: selectWhatsappContactInformationResult.result.contactID,
              whatsappConversationRecipientEmail: selectWhatsappContactInformationResult.result.contactEmail,
              whatsappConversationRecipientLocations: selectWhatsappContactInformationResult.result.contactLocations,
              whatsappConversationRecipientLocationDetails: selectWhatsappContactInformationResult.result.contactLocationDetails,
              whatsappConversationRecipientNote: selectWhatsappContactInformationResult.result.contactNote,
              whatsappConversationStartDateTime: whatsappConversationStartDateTime,
              whatsappConversationEndDateTime: whatsappConversationEndDateTime,
              whatsappConversationIsActive: whatsappConversationIsActive
            }
            createWhatsappConversationPromiseResolve({success: true, result: createWhatsappConversationPromiseResult});
          } else {
            createWhatsappConversationPromiseResolve(databaseResult);
          }
        } else {
          createWhatsappConversationPromiseResolve(selectWhatsappContactProfileNameResult);
        }
      } else {
        createWhatsappConversationPromiseResolve(selectWhatsappConversationAssignedAgentIDResult);
      }
    });
  },

  createWhatsappConversationWithWhatsappConversationAssignedAgentID: async function(whatsappConversationAssignedAgentID, whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName){
    return new Promise (async (createWhatsappConversationWithWhatsappConversationAssignedAgentIDPromiseResolve) => {
      const whatsappConversationRecipientID = 0;
      const whatsappConversationRecipientEmail = 'NA';
      const whatsappConversationRecipientLocations = 
      JSON.stringify({
        'CASA': {
          'latitude': 0,
          'longitude': 0
        },
        'TRABAJO': {
          'latitude': 0,
          'longitude': 0
        },
        'OTRO': {
          'latitude': 0,
          'longitude': 0
        }
      });
      const whatsappConversationRecipientLocationDetails = 'NA';
      const whatsappConversationRecipientNote = 'NA';
      const whatsappConversationStartDateTime = Date().toString();
      const whatsappConversationEndDateTime = null;
      const whatsappConversationIsActive = true;
      const createWhatsappConversationSQL = `INSERT INTO WhatsappConversations (whatsappConversationAssignedAgentID, whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName, whatsappConversationRecipientID, whatsappConversationRecipientEmail, whatsappConversationRecipientLocations, whatsappConversationRecipientLocationDetails, whatsappConversationRecipientNote, whatsappConversationStartDateTime, whatsappConversationEndDateTime, whatsappConversationIsActive) VALUES (?,?,?,?,?,?,?,?,?,?,?);`;
      const createWhatsappConversationValues = [whatsappConversationAssignedAgentID, whatsappConversationRecipientPhoneNumber, whatsappConversationRecipientProfileName, whatsappConversationRecipientID, whatsappConversationRecipientEmail, whatsappConversationRecipientLocations, whatsappConversationRecipientLocationDetails, whatsappConversationRecipientNote, whatsappConversationStartDateTime, whatsappConversationEndDateTime, whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(createWhatsappConversationSQL, createWhatsappConversationValues);
      if (databaseResult.success){
        const whatsappConversationID = databaseResult.result.insertId;
        createWhatsappConversationWithWhatsappConversationAssignedAgentIDPromiseResolve({success: true, result: whatsappConversationID});
      } else {
        createWhatsappConversationWithWhatsappConversationAssignedAgentIDPromiseResolve(databaseResult);
      }
    });
  },

  selectWhatsappGeneralMessageIndex: async function(whatsappGeneralMessageWhatsappConversationID){
    return new Promise(async (selectWhatsappGeneralMessageIndexPromiseResolve) => {
      const getWhatsappGeneralMessageIndexSQL = `SELECT whatsappGeneralMessageIndex FROM WhatsappGeneralMessages WHERE whatsappGeneralMessageWhatsappConversationID=(?) ORDER BY whatsappGeneralMessageIndex DESC;`;
      const getWhatsappGeneralMessageIndexValues = [whatsappGeneralMessageWhatsappConversationID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(getWhatsappGeneralMessageIndexSQL, getWhatsappGeneralMessageIndexValues);
      if (databaseResult.success){
        if (databaseResult.result.length == 0){
          selectWhatsappGeneralMessageIndexPromiseResolve({success: true, result: 0});
        } else {
          selectWhatsappGeneralMessageIndexPromiseResolve({success: true, result: databaseResult.result[0].whatsappGeneralMessageIndex + 1});
        }
      } else {
        selectWhatsappGeneralMessageIndexPromiseResolve(databaseResult);
      }
    });
  },
  
  createWhatsappGeneralMessage: async function(whatsappGeneralMessageWhatsappConversationID, whatsappGeneralMessageID, whatsappGeneralMessageRepliedMessageID, whatsappGeneralMessageOwnerPhoneNumber){
    return new Promise(async (createWhatsappGeneralMessagePromiseResolve) => {
      const selectWhatsappGeneralMessageIndexResult = await this.selectWhatsappGeneralMessageIndex(whatsappGeneralMessageWhatsappConversationID);
      if (selectWhatsappGeneralMessageIndexResult.success){
        const whatsappGeneralMessageIndex = selectWhatsappGeneralMessageIndexResult.result;
        const whatsappGeneralMessageCreationDateTime = new Date().toString();
        const whatsappGeneralMessageSendingDateTime = null;
        const whatsappGeneralMessageDeliveringDateTime = null;
        const whatsappGeneralMessageReadingDateTime = null;
        const createWhatsappGeneralMessageSQL = `INSERT INTO WhatsappGeneralMessages (whatsappGeneralMessageID, whatsappGeneralMessageWhatsappConversationID, whatsappGeneralMessageIndex, whatsappGeneralMessageRepliedMessageID, whatsappGeneralMessageCreationDateTime, whatsappGeneralMessageSendingDateTime, whatsappGeneralMessageDeliveringDateTime, whatsappGeneralMessageReadingDateTime, whatsappGeneralMessageOwnerPhoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        const createWhatsappGeneralMessageValues = [whatsappGeneralMessageID, whatsappGeneralMessageWhatsappConversationID, whatsappGeneralMessageIndex, whatsappGeneralMessageRepliedMessageID, whatsappGeneralMessageCreationDateTime, whatsappGeneralMessageSendingDateTime, whatsappGeneralMessageDeliveringDateTime, whatsappGeneralMessageReadingDateTime, whatsappGeneralMessageOwnerPhoneNumber];
        const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(createWhatsappGeneralMessageSQL, createWhatsappGeneralMessageValues);
        if (databaseResult.success){
          createWhatsappGeneralMessagePromiseResolve({success: true, result: {whatsappGeneralMessageIndex: whatsappGeneralMessageIndex, whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageCreationDateTime}});
        } else {
          createWhatsappGeneralMessagePromiseResolve(databaseResult);
        }
      } else {
        createWhatsappGeneralMessagePromiseResolve(selectWhatsappGeneralMessageIndexResult);
      }
    });
  },

  createWhatsappTextMessage: async function(whatsappTextMessageID, whatsappTextMessageBody){
    return new Promise(async (createWhatsappTextMessagePromiseResolve) => {
      const createWhatsappTextMessageSQL = `INSERT INTO WhatsappTextMessages (whatsappTextMessageID, whatsappTextMessageBody) VALUES (?,?);`;
      const createWhatsappTextMessageValues = [whatsappTextMessageID, whatsappTextMessageBody];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(createWhatsappTextMessageSQL, createWhatsappTextMessageValues);
      createWhatsappTextMessagePromiseResolve(databaseResult);
    });
  },

  createWhatsappLocationMessage: async function(whatsappLocationMessageID, whatsappLocationMessageLatitude, whatsappLocationMessageLongitude){
    return new Promise(async (createWhatsappLocationMessagePromiseResolve) => {
      const createWhatsappLocationMessageSQL = `INSERT INTO WhatsappLocationMessages (whatsappLocationMessageID, whatsappLocationMessageLatitude, whatsappLocationMessageLongitude) VALUES (?, ?, ?);`;
      const createWhatsappLocationMessageValues = [whatsappLocationMessageID, whatsappLocationMessageLatitude, whatsappLocationMessageLongitude];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(createWhatsappLocationMessageSQL, createWhatsappLocationMessageValues);
      createWhatsappLocationMessagePromiseResolve(databaseResult);
    });
  },

  createWhatsappContactMessage: async function(whatsappContactMessageID, whatsappContactMessageName, whatsappContactMessagePhoneNumber){
    return new Promise(async (createWhatsappContactMessagePromiseResolve) => {
      const createWhatsappContactMessageSQL = `INSERT INTO WhatsappContactMessages (whatsappContactMessageID, whatsappContactMessageName, whatsappContactMessagePhoneNumber) VALUES (?, ?, ?);`;
      const createWhatsappContactMessageValues = [whatsappContactMessageID, whatsappContactMessageName, whatsappContactMessagePhoneNumber];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(createWhatsappContactMessageSQL, createWhatsappContactMessageValues);
      createWhatsappContactMessagePromiseResolve(databaseResult);
    });
  },

  createWhatsappImageMessage: async function(whatsappImageMessageID, whatsappImageMessageFile, whatsappImageMessageCaption){
    return new Promise(async (createWhatsappImageMessagePromiseResolve) => {
      const createWhatsappImageMessageSQL = `INSERT INTO WhatsappImageMessages (whatsappImageMessageID, whatsappImageMessageFile, whatsappImageMessageCaption) VALUES (?, ?, ?);`;
      const createWhatsappImageMessageValues = [whatsappImageMessageID, Buffer.from(whatsappImageMessageFile), whatsappImageMessageCaption];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(createWhatsappImageMessageSQL, createWhatsappImageMessageValues);
      createWhatsappImageMessagePromiseResolve(databaseResult);
    });
  },

  createWhatsappVideoMessage: async function(whatsappVideoMessageID, whatsappVideoMessageFile, whatsappVideoMessageCaption){
    return new Promise(async (createWhatsappVideoMessagePromiseResolve) => {
      const createWhatsappVideoMessageSQL = `INSERT INTO WhatsappVideoMessages (whatsappVideoMessageID, whatsappVideoMessageFile, whatsappVideoMessageCaption) VALUES (?, ?, ?);`;
      const createWhatsappVideoMessageValues = [whatsappVideoMessageID, Buffer.from(whatsappVideoMessageFile), whatsappVideoMessageCaption];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(createWhatsappVideoMessageSQL, createWhatsappVideoMessageValues);
      createWhatsappVideoMessagePromiseResolve(databaseResult);
    });
  },

  createWhatsappAudioMessage: async function(whatsappAudioMessageID, whatsappAudioMessageFile){
    return new Promise(async (createWhatsappAudioMessagePromiseResolve) => {
      const createWhatsappAudioMessageSQL = `INSERT INTO WhatsappAudioMessages (whatsappAudioMessageID, whatsappAudioMessageFile) VALUES (?, ?);`;
      const createWhatsappAudioMessageValues = [whatsappAudioMessageID, Buffer.from(whatsappAudioMessageFile)];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(createWhatsappAudioMessageSQL, createWhatsappAudioMessageValues);
      createWhatsappAudioMessagePromiseResolve(databaseResult);
    });
  },

  createWhatsappDocumentMessage: async function(whatsappDocumentMessageID, whatsappDocumentMessageFile, whatsappDocumentMessageMimeType, whatsappDocumentMessageFileName){
    return new Promise(async (createWhatsappDocumentMessagePromiseResolve) => {
      const createWhatsappDocumentMessageSQL = `INSERT INTO WhatsappDocumentMessages (whatsappDocumentMessageID, whatsappDocumentMessageFile, whatsappDocumentMessageMimeType, whatsappDocumentMessageFileName) VALUES (?, ?, ?, ?);`;
      const createWhatsappDocumentMessageValues = [whatsappDocumentMessageID, Buffer.from(whatsappDocumentMessageFile), whatsappDocumentMessageMimeType, whatsappDocumentMessageFileName];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(createWhatsappDocumentMessageSQL, createWhatsappDocumentMessageValues);
      createWhatsappDocumentMessagePromiseResolve(databaseResult);
    });
  },

  createWhatsappFavoriteImageMessage: async function(whatsappFavoriteImageMessageID, whatsappFavoriteImageMessageDriveURL, whatsappFavoriteImageMessageCaption){
    return new Promise(async (createWhatsappFavoriteImageMessagePromiseResolve) => {
      const createWhatsappFavoriteImageMessageSQL = `INSERT INTO WhatsappFavoriteImageMessages (whatsappFavoriteImageMessageID, whatsappFavoriteImageMessageDriveURL, whatsappFavoriteImageMessageCaption) VALUES (?,?,?);`;
      const createWhatsappFavoriteImageMessageValues = [whatsappFavoriteImageMessageID, whatsappFavoriteImageMessageDriveURL, whatsappFavoriteImageMessageCaption];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(createWhatsappFavoriteImageMessageSQL, createWhatsappFavoriteImageMessageValues);
      createWhatsappFavoriteImageMessagePromiseResolve(databaseResult);
    });
  },

  updateAssignedAgentToConversation: async function(whatsappConversationID, whatsappConversationAssignedAgentID){
    return new Promise(async (updateAssignedAgentToConversationPromiseResolve) => {
      const updateAssignedAgentToConversationSQL = `UPDATE WhatsappConversations SET whatsappConversationAssignedAgentID=(?) WHERE whatsappConversationID=(?);`;
      const updateAssignedAgentToConversationValues = [whatsappConversationAssignedAgentID, whatsappConversationID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateAssignedAgentToConversationSQL, updateAssignedAgentToConversationValues);
      updateAssignedAgentToConversationPromiseResolve(databaseResult);
    });
  },

  composeWhatsappGeneralMessage: async function(whatsappGeneralMessageInformation){
    return new Promise(async (composeWhatsappGeneralMessagePromiseResolve) => {
      var whatsappGeneralMessage = 
      {
        whatsappGeneralMessageID: whatsappGeneralMessageInformation.whatsappGeneralMessageID,
        whatsappGeneralMessageCreationDateTime: whatsappGeneralMessageInformation.whatsappGeneralMessageCreationDateTime,
      };  
      if (whatsappGeneralMessageInformation.whatsappTextMessageBody != null){
        whatsappGeneralMessage['whatsappGeneralMessageType'] = 'text';
        whatsappGeneralMessage['whatsappTextMessageBody'] = whatsappGeneralMessageInformation.whatsappTextMessageBody;
      } else if ((whatsappGeneralMessageInformation.whatsappLocationMessageLatitude != null) && (whatsappGeneralMessageInformation.whatsappLocationMessageLongitude != null)){
        whatsappGeneralMessage['whatsappGeneralMessageType'] = 'location';
        whatsappGeneralMessage['whatsappLocationMessageLatitude'] = whatsappGeneralMessageInformation.whatsappLocationMessageLatitude;
        whatsappGeneralMessage['whatsappLocationMessageLongitude'] = whatsappGeneralMessageInformation.whatsappLocationMessageLongitude;
      } else if ((whatsappGeneralMessageInformation.whatsappContactMessageName != null) && (whatsappGeneralMessageInformation.whatsappContactMessagePhoneNumber != null)){
        whatsappGeneralMessage['whatsappGeneralMessageType'] = 'contact';
        whatsappGeneralMessage['whatsappContactMessagePhoneNumber'] = whatsappGeneralMessage.whatsappContactMessagePhoneNumber;
        whatsappGeneralMessage['whatsappContactMessageName'] = whatsappGeneralMessage.whatsappContactMessageName;
      } else if (whatsappGeneralMessageInformation.whatsappImageMessageFile != null){
        whatsappGeneralMessage['whatsappGeneralMessageType'] = 'image';
        whatsappGeneralMessage['whatsappImageMessageFile'] = Buffer.from(whatsappGeneralMessageInformation.whatsappImageMessageFile).toString('base64');
        whatsappGeneralMessage['whatsappImageMessageCaption'] = whatsappGeneralMessageInformation.whatsappImageMessageCaption;
      } else if (whatsappGeneralMessageInformation.whatsappVideoMessageFile != null){
        whatsappGeneralMessage['whatsappGeneralMessageType'] = 'video';
        whatsappGeneralMessage['whatsappVideoMessageFile'] = Buffer.from(whatsappGeneralMessageInformation.whatsappVideoMessageFile).toString('base64');
        whatsappGeneralMessage['whatsappVideoMessageCaption'] = whatsappGeneralMessageInformation.whatsappVideoMessageCaption;
      } else if (whatsappGeneralMessageInformation.whatsappAudioMessageFile != null){
        whatsappGeneralMessage['whatsappGeneralMessageType'] = 'audio';
        whatsappGeneralMessage['whatsappAudioMessageFile'] = Buffer.from(whatsappGeneralMessageInformation.whatsappAudioMessageFile).toString('base64');
      } else if (whatsappGeneralMessageInformation.whatsappDocumentMessageFile != null){
        whatsappGeneralMessage['whatsappGeneralMessageType'] = 'document';
        whatsappGeneralMessage['whatsappDocumentMessageFile'] = Buffer.from(whatsappGeneralMessageInformation.whatsappDocumentMessageFile).toString('base64');
        whatsappGeneralMessage['whatsappDocumentMessageMimeType'] = whatsappGeneralMessageInformation.whatsappDocumentMessageMimeType;
        whatsappGeneralMessage['whatsappDocumentMessageFileName'] = whatsappGeneralMessageInformation.whatsappDocumentMessageFileName;
      } else if (whatsappGeneralMessageInformation.whatsappFavoriteImageMessageDriveURL != null){
        whatsappGeneralMessage['whatsappGeneralMessageType'] = 'favoriteImage';
        whatsappGeneralMessage['whatsappFavoriteImageMessageDriveURL'] = whatsappGeneralMessageInformation.whatsappFavoriteImageMessageDriveURL;
        whatsappGeneralMessage['whatsappFavoriteImageMessageCaption'] = whatsappGeneralMessageInformation.whatsappFavoriteImageMessageCaption;

      }
      composeWhatsappGeneralMessagePromiseResolve(whatsappGeneralMessage);
    });
  },

  selectWhatsappGeneralMessage: async function(whatsappGeneralMessageID){
    return new Promise(async (selectWhatsappGeneralMessagePromiseResolve) => {
      const selectWhatsappGeneralMessageSQL = 
      `
        SELECT 
          WhatsappGeneralMessages.whatsappGeneralMessageID,
          WhatsappGeneralMessages.whatsappGeneralMessageCreationDateTime,
          WhatsappTextMessages.whatsappTextMessageBody,
          WhatsappLocationMessages.whatsappLocationMessageLatitude,
          WhatsappLocationMessages.whatsappLocationMessageLongitude,
          WhatsappContactMessages.whatsappContactMessageName,
          WhatsappContactMessages.whatsappContactMessagePhoneNumber,
          WhatsappImageMessages.whatsappImageMessageFile,
          WhatsappImageMessages.whatsappImageMessageCaption,
          WhatsappVideoMessages.whatsappVideoMessageFile,
          WhatsappVideoMessages.whatsappVideoMessageCaption,
          WhatsappAudioMessages.whatsappAudioMessageFile,
          WhatsappDocumentMessages.whatsappDocumentMessageFile,
          WhatsappDocumentMessages.whatsappDocumentMessageMimeType,
          WhatsappDocumentMessages.whatsappDocumentMessageFileName,
          WhatsappFavoriteImageMessages.whatsappFavoriteImageMessageDriveURL,
          WhatsappFavoriteImageMessages.whatsappFavoriteImageMessageCaption
        FROM WhatsappGeneralMessages
          LEFT JOIN WhatsappTextMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappTextMessages.whatsappTextMessageID
          LEFT JOIN WhatsappLocationMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappLocationMessages.whatsappLocationMessageID
          LEFT JOIN WhatsappContactMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappContactMessages.whatsappContactMessageID
          LEFT JOIN WhatsappImageMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappImageMessages.whatsappImageMessageID
          LEFT JOIN WhatsappVideoMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappVideoMessages.whatsappVideoMessageID
          LEFT JOIN WhatsappAudioMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappAudioMessages.whatsappAudioMessageID
          LEFT JOIN WhatsappDocumentMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappDocumentMessages.whatsappDocumentMessageID
          LEFT JOIN WhatsappFavoriteImageMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappFavoriteImageMessages.whatsappFavoriteImageMessageID
        WHERE 
        WhatsappGeneralMessages.whatsappGeneralMessageID=(?);`;
      const selectWhatsappGeneralMessageValues = [whatsappGeneralMessageID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectWhatsappGeneralMessageSQL, selectWhatsappGeneralMessageValues);
      if (databaseResult.success){
        console.log(whatsappGeneralMessageID);
        console.log(databaseResult);
        const composeWhatsappGeneralMessageResult = await this.composeWhatsappGeneralMessage(databaseResult.result[0]);
        selectWhatsappGeneralMessagePromiseResolve({success: true, result: composeWhatsappGeneralMessageResult});
      } else {
        selectWhatsappGeneralMessagePromiseResolve(databaseResult);
      }
    });
  },


  selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumber: async function(whatsappConversationRecipientPhoneNumber){
    return new Promise(async (selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberPromiseResolve) => {
      const selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberSQL = 
      `
        SELECT 
          WhatsappConversations.whatsappConversationID,
          WhatsappConversations.whatsappConversationStartDateTime, 
          WhatsappConversations.whatsappConversationEndDateTime, 
          WhatsappConversations.whatsappConversationCloseComment, 
          WhatsappConversations.whatsappConversationAmount, 
          WhatsappConversations.whatsappConversationProducts,
          WhatsappConversations.whatsappConversationAssignedAgentID,
          Agents.agentName
        FROM WhatsappConversations JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
        WHERE whatsappConversationIsActive=(?) AND whatsappConversationRecipientPhoneNumber=(?);
      `;
      const whatsappConversationIsActive = false;
      const selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberValues = [whatsappConversationIsActive, whatsappConversationRecipientPhoneNumber];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberSQL, selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberValues);
      selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumberPromiseResolve(databaseResult);
    });
  },
  
}