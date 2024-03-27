const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');

const axios = require('axios');

module.exports = {
  
  /* 
    EXECUTE METHODS
  */
  agentLogin: async function(agentUsername, agentPassword){
    return new Promise(async (agentLoginPromiseResolve) => {
      const selectAgentSQL = `SELECT * FROM Agents WHERE agentUsername=(?) AND agentPassword=(?) AND agentIsWorking=(?);`;
      const selectAgentValues = [agentUsername, agentPassword, true];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentSQL, selectAgentValues);
      if (databaseResult.success){
        if (databaseResult.result.length == 0){
          const agentLoginResult = {success: false};
          agentLoginPromiseResolve(JSON.stringify(agentLoginResult));
        } else {
          const agentLoginResult = 
          {
            success: true,
            result: 
            {
              agentID: databaseResult.result[0].agentID,
              agentName: databaseResult.result[0].agentName,
              agentUsername: databaseResult.result[0].agentUsername,
              agentPassword: databaseResult.result[0].agentPassword,
              agentProfileImage: Buffer.from(databaseResult.result[0].agentProfileImage).toString('base64'),
              agentType: databaseResult.result[0].agentType,
              agentStatus: databaseResult.result[0].agentStatus,
              agentStartMessage: databaseResult.result[0].agentStartMessage,
              agentEndMessage: databaseResult.result[0].agentEndMessage
            }
          };
          agentLoginPromiseResolve(JSON.stringify(agentLoginResult));
        }
      } else {
        agentLoginPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  agentLogout: async function(agentID){
    return new Promise(async (agentLogoutPromiseResolve) => {
      const updateAgentStatusSQL = `UPDATE Agents SET agentStatus=(?) WHERE agentID=(?);`;
      const agentStatus = 'offline';
      const updateAgentStatusValues = [agentStatus, agentID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateAgentStatusSQL, updateAgentStatusValues);
      if (databaseResult.success){
        const agentLogoutResult = {success: true, result: {agentID: agentID}};
        agentLogoutPromiseResolve(JSON.stringify(agentLogoutResult));
      } else {
        agentLogoutPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },


  /*
    UPDATE METHODS
  */
  updateAgentLoginCredentials: async function(agentID, agentUsername, agentPassword, agentProfileImageAsBase64){
    return new Promise(async (updateAgentLoginCredentialsPromiseResolve) => {
      const updateAgentLoginCredentialsSQL = `UPDATE Agents SET agentUsername=(?), agentPassword=(?), agentProfileImage=(?) WHERE agentID=(?);`;
      const agentProfileImageAsBlob = Buffer.from(agentProfileImageAsBase64, 'base64');
      const updateAgentLoginCredentialsValues = [agentUsername, agentPassword, agentProfileImageAsBlob, agentID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateAgentLoginCredentialsSQL, updateAgentLoginCredentialsValues);
      if (databaseResult.success){
        const updateAgentLoginCredentialsResult = 
        {
          success: true, 
          result: 
          {
            agentID: agentID, 
            agentUsername: agentUsername,
            agentPassword: agentPassword,
            agentProfileImage: agentProfileImageAsBase64
          }
        };
        updateAgentLoginCredentialsPromiseResolve(JSON.stringify(updateAgentLoginCredentialsResult));
      } else {
        updateAgentLoginCredentialsPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  updateAgentStatus: async function(websocketConnection, agentID, agentName, agentStatus){
    return new Promise(async (updateAgentStatusPromiseResolve) => {
      const updateAgentStatusSQL = `UPDATE Agents SET agentStatus=(?) WHERE agentID=(?) AND agentIsWorking=(?);`;
      const updateAgentStatusValues = [agentStatus, agentID, true];
      const updateAgentStatusDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateAgentStatusSQL, updateAgentStatusValues);
      if (updateAgentStatusDatabaseResult.success){
        if (updateAgentStatusDatabaseResult.result.affectedRows == 1){
          const insertAgentStatusChangeSQL = `INSERT INTO AgentStatusChanges (agentStatusChangeAgentID, agentStatusChangeStatus, agentStatusChangeDateTime) VALUES (?,?,?);`;
          const agentStatusChangeDateTime = new Date().toString();
          const insertAgentStatusChangeValues = [agentID, agentStatus, agentStatusChangeDateTime];
          const insertAgentStatusChangeDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(insertAgentStatusChangeSQL, insertAgentStatusChangeValues);
          if (insertAgentStatusChangeDatabaseResult.success){
            const websocketMessageContent = 
            {
              success: true, 
              result: 
              {
                agentID: agentID, 
                agentName: agentName, 
                agentStatus: agentStatus
              }
            };
            websocketConnection.sendWebsocketMessage('/agent/update/agentStatus', websocketMessageContent);
            updateAgentStatusPromiseResolve(JSON.stringify(websocketMessageContent));
          } else {
            websocketConnection.sendWebsocketMessage('/agent/update/agentStatus', insertAgentStatusChangeDatabaseResult);
            updateAgentStatusPromiseResolve(JSON.stringify(insertAgentStatusChangeDatabaseResult));
          }
        } else {
          updateAgentStatusPromiseResolve(JSON.stringify({success: false}));
        }
      } else {
        websocketConnection.sendWebsocketMessage('/agent/update/agentStatus', updateAgentStatusDatabaseResult);
        updateAgentStatusPromiseResolve(JSON.stringify(updateAgentStatusDatabaseResult));
      }
    });
  },

  updateAgentWorkingStatus: async function(agentID, agentIsWorking){
    return new Promise(async (updateAgentWorkingStatusPromiseResolve) => {
      const updateAgentWorkingStatusSQL = `UPDATE Agents SET agentIsWorking=(?) WHERE agentID=(?);`;
      const updateAgentWorkingStatusValues = [agentIsWorking, agentID];
      const updateAgentStatusDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateAgentWorkingStatusSQL, updateAgentWorkingStatusValues);
      updateAgentWorkingStatusPromiseResolve(JSON.stringify(updateAgentStatusDatabaseResult))
    });
  },


  updateAgentAutomaticMessages: async function(agentID, agentStartMessage, agentEndMessage){
    return new Promise(async (updateAgentAutomaticMessagesPromiseResolve) => {
      const updateAgentAutomaticMessagesSQL = `UPDATE Agents SET agentStartMessage=(?), agentEndMessage=(?) WHERE agentID=(?);`;
      const updateAgentAutomaticMessagesValues = [agentStartMessage, agentEndMessage, agentID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateAgentAutomaticMessagesSQL, updateAgentAutomaticMessagesValues);
      if (databaseResult.success){
        const websocketMessageContent = 
        {
          success: true, 
          result: 
          {
            agentID: agentID, 
            agentStartMessage: agentStartMessage, 
            agentEndMessage: agentEndMessage
          }
        };
        updateAgentAutomaticMessagesPromiseResolve(JSON.stringify(websocketMessageContent));
      } else {
        updateAgentAutomaticMessagesPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  updateAgentFromAdminPortal: async function(agentID, agentUsername, agentPassword, agentName){
    return new Promise(async (updateAgentFromAdminPortalPromiseResolve) => {
      const updateAgentFromAdminPortalSQL = `UPDATE Agents SET agentUsername=(?), agentPassword=(?), agentName=(?) WHERE agentID=(?);`;
      const updateAgentFromAdminPortalValues = [agentUsername, agentPassword, agentName, agentID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateAgentFromAdminPortalSQL, updateAgentFromAdminPortalValues);
      updateAgentFromAdminPortalPromiseResolve(JSON.stringify(databaseResult));
    });
  },


  /*
    SELECT METHODS
  */
  selectAgents: async function (){
    return new Promise(async (selectAgentsPromiseResolve) => {
      const selectAllAgentsSQL = `SELECT * FROM Agents WHERE agentIsActive=(?);`;
      const agentIsActive = true;
      const selectAllAgentsValues = [agentIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAllAgentsSQL, selectAllAgentsValues);
      if (databaseResult.success){
        for (var agent in databaseResult.result){
          databaseResult.result[agent].agentProfileImage = Buffer.from(databaseResult.result[agent].agentProfileImage).toString('base64');
        }
        selectAgentsPromiseResolve(JSON.stringify(databaseResult));
      } else {
        selectAgentsPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  selectAllAgentStatus: async function (){
    return new Promise(async (selectAllAgentStatusPromiseResolve) => {
      const selectAllAgentStatusSQL = `SELECT agentID, agentName, agentStatus, agentColor, agentFontColor FROM Agents WHERE agentIsActive=(?);`;
      const agentIsActive = true;
      const selectAllAgentStatusValues = [agentIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAllAgentStatusSQL, selectAllAgentStatusValues);
      selectAllAgentStatusPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectAgentStatus: async function (agentID){
    return new Promise(async (selectAgentStatusPromiseResolve) => {
      const selectAgentStatusSQL = `SELECT agentStatus FROM Agents WHERE agentID=(?);`;
      const selectAgentStatusValues = [agentID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentStatusSQL, selectAgentStatusValues);
      if (databaseResult.success){
        if (databaseResult.result[0]){
          const agentStatus = databaseResult.result[0].agentStatus;
          const websocketMessageContent = {success: true, result: {agentStatus: agentStatus}};
          selectAgentStatusPromiseResolve(JSON.stringify(websocketMessageContent));
        }
      } else {
        selectAgentStatusPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  selectAgentFavoriteMessages: async function (agentID){
    return new Promise(async (selectAgentFavoriteMessagesPromiseResolve) => {
      const selectAgentFavoriteMessagesSQL = `SELECT * FROM AgentFavoriteMessages WHERE AgentFavoriteMessageAgentID=(?);`;
      const selectAgentFavoriteMessagesValues = [agentID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentFavoriteMessagesSQL, selectAgentFavoriteMessagesValues); 
      selectAgentFavoriteMessagesPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  updateAgentFavoriteMessage: async function(agentFavoriteMessageID, agentFavoriteMessageAgentID, agentFavoriteMessageTextMessageBody){
    return new Promise(async (updateAgentFavoriteMessagePromiseResolve) => {
      const updateAgentFavoriteMessageSQL = `UPDATE AgentFavoriteMessages SET agentFavoriteMessageTextMessageBody=(?) WHERE agentFavoriteMessageID=(?);`;
      const updateAgentFavoriteMessageValues = [agentFavoriteMessageTextMessageBody, agentFavoriteMessageID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateAgentFavoriteMessageSQL, updateAgentFavoriteMessageValues);
      if (databaseResult.success){
        const websocketMessageContent = 
        {
          success: true, 
          result: 
          {
            agentFavoriteMessageID: agentFavoriteMessageID, 
            agentFavoriteMessageAgentID: agentFavoriteMessageAgentID,
            agentFavoriteMessageTextMessageBody: agentFavoriteMessageTextMessageBody, 
          }
        };
        updateAgentFavoriteMessagePromiseResolve(JSON.stringify(websocketMessageContent));
      } else {
        updateAgentFavoriteMessagePromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  deleteAgentFavoriteMessage: async function(agentFavoriteMessageID){
    return new Promise(async (deleteAgentFavoriteMessagePromiseResolve) => {
      const deleteAgentFavoriteMessageSQL = `DELETE FROM AgentFavoriteMessages WHERE agentFavoriteMessageID=(?);`;
      const deleteAgentFavoriteMessageValues = [agentFavoriteMessageID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(deleteAgentFavoriteMessageSQL, deleteAgentFavoriteMessageValues);
      if (databaseResult.success){
        const websocketMessageContent = {success: true, result: {agentFavoriteMessageID: agentFavoriteMessageID}};
        deleteAgentFavoriteMessagePromiseResolve(JSON.stringify(websocketMessageContent));
      } else {
        deleteAgentFavoriteMessagePromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  insertAgentFavoriteMessage: async function(agentFavoriteMessageAgentID, agentFavoriteMessageName, agentFavoriteMessageTextMessageBody){
    return new Promise(async (insertAgentFavoriteMessagePromiseResolve) => {
      const insertAgentFavoriteMessageSQL = `INSERT INTO AgentFavoriteMessages (agentFavoriteMessageAgentID, agentFavoriteMessageName, agentFavoriteMessageTextMessageBody) VALUES (?, ?, ?);`;
      const insertAgentFavoriteMessageValues = [agentFavoriteMessageAgentID, agentFavoriteMessageName, agentFavoriteMessageTextMessageBody];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(insertAgentFavoriteMessageSQL, insertAgentFavoriteMessageValues);
      if (databaseResult.success){
        const agentFavoriteMessageID = databaseResult.result.insertId;
        const websocketMessageContent = 
        {
          success: true, 
          result: 
          {
            agentFavoriteMessageID: agentFavoriteMessageID, 
            agentFavoriteMessageAgentID: agentFavoriteMessageAgentID, 
            agentFavoriteMessageName: agentFavoriteMessageName, 
            agentFavoriteMessageTextMessageBody: agentFavoriteMessageTextMessageBody
          }
        };
        insertAgentFavoriteMessagePromiseResolve(JSON.stringify(websocketMessageContent));
      } else {
        insertAgentFavoriteMessagePromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  selectAgentComments: async function (whatsappConversationAssignedAgentID, whatsappConversationIsActive){
    return new Promise(async (selectAgentCommentsPromiseResolve) => {
      const selectAgentCommentsSQL = 
      `
        SELECT WhatsappConversationComments.*
        FROM WhatsappConversationComments
        LEFT JOIN 
        WhatsappConversations ON WhatsappConversationComments.whatsappConversationCommentWhatsappConversationID = WhatsappConversations.whatsappConversationID
        WHERE
          WhatsappConversations.whatsappConversationAssignedAgentID=(?)
            AND
          WhatsappConversations.whatsappConversationIsActive=(?);
      `
      const selectAgentCommentsValues = [whatsappConversationAssignedAgentID, whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentCommentsSQL, selectAgentCommentsValues);
      if (databaseResult.success){
        const composeWhatsappCommentsResult = await this.composeWhatsappComments(databaseResult.result);
        selectAgentCommentsPromiseResolve(JSON.stringify({success: true, result: composeWhatsappCommentsResult}));
      } else {
        selectAgentCommentsPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  composeWhatsappComments: async function(comments){
    return new Promise(async (composeWhatsappCommentsPromiseResolve) => {
      const whatsappComments = {};
      
      for (var commentIndex in comments){
        var comment = comments[commentIndex];
        var whatsappConversationID = comment.whatsappConversationCommentWhatsappConversationID;
        if (!(whatsappConversationID in whatsappComments)){
          if (comment.whatsappConversationAudioCommentFile != null){
            comment.whatsappConversationAudioCommentFile = comment.whatsappConversationAudioCommentFile.toString('base64');
          }
          whatsappComments[whatsappConversationID] = [comment];
        } else {
          if (comment.whatsappConversationAudioCommentFile != null){
            comment.whatsappConversationAudioCommentFile = comment.whatsappConversationAudioCommentFile.toString('base64');
          }
          whatsappComments[whatsappConversationID].push(comment);
        }
      }
      composeWhatsappCommentsPromiseResolve(whatsappComments);
    });
  },
  
  selectAgentConversations: async function (whatsappConversationAssignedAgentID, whatsappConversationIsActive){
    return new Promise(async (selectAgentConversationsPromiseResolve) => {
      const selectAgentActiveConversationsSQL = 
      `
        SELECT 
          WhatsappConversations.whatsappConversationID,
          WhatsappConversations.whatsappConversationAssignedAgentID,
          WhatsappConversations.whatsappConversationRecipientPhoneNumber,
          WhatsappConversations.whatsappConversationRecipientProfileName,
          WhatsappConversations.whatsappConversationRecipientID,
          WhatsappConversations.whatsappConversationRecipientEmail,
          WhatsappConversations.whatsappConversationRecipientLocations,
          WhatsappConversations.whatsappConversationRecipientLocationDetails,
          WhatsappConversations.whatsappConversationRecipientNote,
          WhatsappConversations.whatsappConversationStartDateTime,
          WhatsappConversations.whatsappConversationEndDateTime,
          WhatsappConversations.whatsappConversationIsActive,
          WhatsappGeneralMessages.whatsappGeneralMessageID,
          WhatsappGeneralMessages.whatsappGeneralMessageIndex,
          WhatsappGeneralMessages.whatsappGeneralMessageRepliedMessageID,
          WhatsappGeneralMessages.whatsappGeneralMessageCreationDateTime,
          WhatsappGeneralMessages.whatsappGeneralMessageSendingDateTime,
          WhatsappGeneralMessages.whatsappGeneralMessageDeliveringDateTime,
          WhatsappGeneralMessages.whatsappGeneralMessageReadingDateTime,
          WhatsappGeneralMessages.whatsappGeneralMessageOwnerPhoneNumber,
          WhatsappTextMessages.whatsappTextMessageBody,
          WhatsappLocationMessages.whatsappLocationMessageLatitude,
          WhatsappLocationMessages.whatsappLocationMessageLongitude,
          WhatsappContactMessages.whatsappContactMessageName,
          WhatsappContactMessages.whatsappContactMessagePhoneNumber,
          COALESCE(
            WhatsappImageMessages.whatsappImageMessageFile, 
            WhatsappImageMessagesCurrent.whatsappImageMessageFile
          ) AS whatsappImageMessageFile,
          COALESCE(
              WhatsappImageMessages.whatsappImageMessageCaption, 
              WhatsappImageMessagesCurrent.whatsappImageMessageCaption
          ) AS whatsappImageMessageCaption,
          COALESCE(
              WhatsappImageMessages.whatsappImageMessageType, 
              WhatsappImageMessagesCurrent.whatsappImageMessageType
          ) AS whatsappImageMessageType,
          WhatsappVideoMessages.whatsappVideoMessageFile,
          WhatsappVideoMessages.whatsappVideoMessageCaption,
          WhatsappAudioMessages.whatsappAudioMessageFile,
          WhatsappDocumentMessages.whatsappDocumentMessageFile,
          WhatsappDocumentMessages.whatsappDocumentMessageMimeType,
          WhatsappDocumentMessages.whatsappDocumentMessageFileName,
          WhatsappFavoriteImageMessages.whatsappFavoriteImageMessageDriveURL,
          WhatsappFavoriteImageMessages.whatsappFavoriteImageMessageCaption
        FROM WhatsappConversations
          LEFT JOIN WhatsappGeneralMessages ON WhatsappConversations.whatsappConversationID = WhatsappGeneralMessages.whatsappGeneralMessageWhatsappConversationID
          LEFT JOIN WhatsappTextMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappTextMessages.whatsappTextMessageID
          LEFT JOIN WhatsappLocationMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappLocationMessages.whatsappLocationMessageID
          LEFT JOIN WhatsappContactMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappContactMessages.whatsappContactMessageID
          LEFT JOIN WhatsappImageMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappImageMessages.whatsappImageMessageID
          LEFT JOIN WhatsappImageMessagesCurrent ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappImageMessagesCurrent.whatsappImageMessageID
          LEFT JOIN WhatsappVideoMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappVideoMessages.whatsappVideoMessageID
          LEFT JOIN WhatsappAudioMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappAudioMessages.whatsappAudioMessageID
          LEFT JOIN WhatsappDocumentMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappDocumentMessages.whatsappDocumentMessageID
          LEFT JOIN WhatsappFavoriteImageMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappFavoriteImageMessages.whatsappFavoriteImageMessageID
        WHERE 
          WhatsappConversations.whatsappConversationAssignedAgentID=(?)
          AND
          WhatsappConversations.whatsappConversationIsActive=(?)
        ORDER BY
          WhatsappGeneralMessages.whatsappGeneralMessageIndex;
      `;
      const selectAgentActiveConversationsValues = [whatsappConversationAssignedAgentID, whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentActiveConversationsSQL, selectAgentActiveConversationsValues);
      if (databaseResult.success){
        const composeWhatsappConversationsResult = await this.composeWhatsappConversations(databaseResult.result);
        selectAgentConversationsPromiseResolve(JSON.stringify({success: true, result: composeWhatsappConversationsResult}));
      } else {
        selectAgentConversationsPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  selectAgentConversation: async function (whatsappConversationID){
    return new Promise(async (selectAgentConversationPromiseResolve) => {
      const selectAgentActiveConversationSQL = 
      `
        SELECT 
          WhatsappConversations.whatsappConversationID,
          WhatsappConversations.whatsappConversationAssignedAgentID,
          WhatsappConversations.whatsappConversationRecipientPhoneNumber,
          WhatsappConversations.whatsappConversationRecipientProfileName,
          WhatsappConversations.whatsappConversationRecipientID,
          WhatsappConversations.whatsappConversationRecipientEmail,
          WhatsappConversations.whatsappConversationRecipientLocations,
          WhatsappConversations.whatsappConversationRecipientLocationDetails,
          WhatsappConversations.whatsappConversationRecipientNote,
          WhatsappConversations.whatsappConversationStartDateTime,
          WhatsappConversations.whatsappConversationEndDateTime,
          WhatsappConversations.whatsappConversationIsActive,
          WhatsappGeneralMessages.whatsappGeneralMessageID,
          WhatsappGeneralMessages.whatsappGeneralMessageIndex,
          WhatsappGeneralMessages.whatsappGeneralMessageRepliedMessageID,
          WhatsappGeneralMessages.whatsappGeneralMessageCreationDateTime,
          WhatsappGeneralMessages.whatsappGeneralMessageSendingDateTime,
          WhatsappGeneralMessages.whatsappGeneralMessageDeliveringDateTime,
          WhatsappGeneralMessages.whatsappGeneralMessageReadingDateTime,
          WhatsappGeneralMessages.whatsappGeneralMessageOwnerPhoneNumber,
          WhatsappTextMessages.whatsappTextMessageBody,
          WhatsappLocationMessages.whatsappLocationMessageLatitude,
          WhatsappLocationMessages.whatsappLocationMessageLongitude,
          WhatsappContactMessages.whatsappContactMessageName,
          WhatsappContactMessages.whatsappContactMessagePhoneNumber,
          COALESCE(
            WhatsappImageMessages.whatsappImageMessageFile, 
            WhatsappImageMessagesCurrent.whatsappImageMessageFile
          ) AS whatsappImageMessageFile,
          COALESCE(
              WhatsappImageMessages.whatsappImageMessageCaption, 
              WhatsappImageMessagesCurrent.whatsappImageMessageCaption
          ) AS whatsappImageMessageCaption,
          COALESCE(
              WhatsappImageMessages.whatsappImageMessageType, 
              WhatsappImageMessagesCurrent.whatsappImageMessageType
          ) AS whatsappImageMessageType,
          WhatsappVideoMessages.whatsappVideoMessageFile,
          WhatsappVideoMessages.whatsappVideoMessageCaption,
          WhatsappAudioMessages.whatsappAudioMessageFile,
          WhatsappDocumentMessages.whatsappDocumentMessageFile,
          WhatsappDocumentMessages.whatsappDocumentMessageMimeType,
          WhatsappDocumentMessages.whatsappDocumentMessageFileName,
          WhatsappFavoriteImageMessages.whatsappFavoriteImageMessageDriveURL,
          WhatsappFavoriteImageMessages.whatsappFavoriteImageMessageCaption
        FROM WhatsappConversations
          LEFT JOIN WhatsappGeneralMessages ON WhatsappConversations.whatsappConversationID = WhatsappGeneralMessages.whatsappGeneralMessageWhatsappConversationID
          LEFT JOIN WhatsappTextMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappTextMessages.whatsappTextMessageID
          LEFT JOIN WhatsappLocationMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappLocationMessages.whatsappLocationMessageID
          LEFT JOIN WhatsappContactMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappContactMessages.whatsappContactMessageID
          LEFT JOIN WhatsappImageMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappImageMessages.whatsappImageMessageID
          LEFT JOIN WhatsappImageMessagesCurrent ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappImageMessagesCurrent.whatsappImageMessageID
          LEFT JOIN WhatsappVideoMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappVideoMessages.whatsappVideoMessageID
          LEFT JOIN WhatsappAudioMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappAudioMessages.whatsappAudioMessageID
          LEFT JOIN WhatsappDocumentMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappDocumentMessages.whatsappDocumentMessageID
          LEFT JOIN WhatsappFavoriteImageMessages ON WhatsappGeneralMessages.whatsappGeneralMessageID = WhatsappFavoriteImageMessages.whatsappFavoriteImageMessageID
        WHERE 
          WhatsappConversations.whatsappConversationID=(?)
        ORDER BY
          WhatsappGeneralMessages.whatsappGeneralMessageIndex;
      `;
      const selectAgentActiveConversationValues = [whatsappConversationID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentActiveConversationSQL, selectAgentActiveConversationValues);
      if (databaseResult.success){
        const composeWhatsappConversationsResult = await this.composeWhatsappConversations(databaseResult.result);
        selectAgentConversationPromiseResolve(JSON.stringify({success: true, result: composeWhatsappConversationsResult}));
      } else {
        selectAgentConversationPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  composeWhatsappConversations: async function(getAgentWhatsappConversationsDatabaseResult){
    return new Promise(async (composeWhatsappConversationsPromiseResolve) => {
      const whatsappConversations = {};
      
      for (var whatsappGeneralMessageIndex in getAgentWhatsappConversationsDatabaseResult){
        var whatsappGeneralMessage = getAgentWhatsappConversationsDatabaseResult[whatsappGeneralMessageIndex];
        var whatsappConversationID = whatsappGeneralMessage.whatsappConversationID;
        if (!(whatsappConversationID in whatsappConversations)){
          var whatsappConversationRecipientPhoneNumber = whatsappGeneralMessage.whatsappConversationRecipientPhoneNumber;
          var whatsappConversationRecipientProfileName = whatsappGeneralMessage.whatsappConversationRecipientProfileName;
          var whatsappConversationRecipientID = whatsappGeneralMessage.whatsappConversationRecipientID;
          var whatsappConversationRecipientEmail = whatsappGeneralMessage.whatsappConversationRecipientEmail;
          var whatsappConversationRecipientLocations = JSON.parse(whatsappGeneralMessage.whatsappConversationRecipientLocations);
          var whatsappConversationRecipientLocationDetails = whatsappGeneralMessage.whatsappConversationRecipientLocationDetails;
          var whatsappConversationRecipientNote = whatsappGeneralMessage.whatsappConversationRecipientNote;
          var whatsappConversationAssignedAgentID = whatsappGeneralMessage.whatsappConversationAssignedAgentID;
          var whatsappConversationStartDateTime = whatsappGeneralMessage.whatsappConversationStartDateTime;
          var whatsappConversationEndDateTime = whatsappGeneralMessage.whatsappConversationEndDateTime;
          var whatsappConversationIsActive = whatsappGeneralMessage.whatsappConversationIsActive;
          whatsappConversations[whatsappConversationID] = 
          {
            whatsappConversationAssignedAgentID: whatsappConversationAssignedAgentID,
            whatsappConversationStartDateTime:  whatsappConversationStartDateTime,
            whatsappConversationEndDateTime: whatsappConversationEndDateTime,
            whatsappConversationRecipientPhoneNumber: whatsappConversationRecipientPhoneNumber,
            whatsappConversationRecipientProfileName: whatsappConversationRecipientProfileName,
            whatsappConversationRecipientID: whatsappConversationRecipientID,
            whatsappConversationRecipientEmail: whatsappConversationRecipientEmail,
            whatsappConversationRecipientLocations: whatsappConversationRecipientLocations,
            whatsappConversationRecipientLocationDetails: whatsappConversationRecipientLocationDetails,
            whatsappConversationRecipientNote: whatsappConversationRecipientNote,
            whatsappConversationIsActive: whatsappConversationIsActive,
            whatsappConversationMessages: [],
            whatsappConversationProducts: []
          };
        }
        whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex] = 
        {
          whatsappGeneralMessageIndex: whatsappGeneralMessage.whatsappGeneralMessageIndex,
          whatsappGeneralMessageID: whatsappGeneralMessage.whatsappGeneralMessageID,
          whatsappGeneralMessageRepliedMessageID: whatsappGeneralMessage.whatsappGeneralMessageRepliedMessageID,
          whatsappGeneralMessageCreationDateTime: whatsappGeneralMessage.whatsappGeneralMessageCreationDateTime,
          whatsappGeneralMessageSendingDateTime: whatsappGeneralMessage.whatsappGeneralMessageSendingDateTime,
          whatsappGeneralMessageDeliveringDateTime: whatsappGeneralMessage.whatsappGeneralMessageDeliveringDateTime,
          whatsappGeneralMessageReadingDateTime: whatsappGeneralMessage.whatsappGeneralMessageReadingDateTime,
          whatsappGeneralMessageOwnerPhoneNumber: whatsappGeneralMessage.whatsappGeneralMessageOwnerPhoneNumber
        };
        if (whatsappGeneralMessage.whatsappTextMessageBody != null){
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappGeneralMessageType'] = 'text';
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappTextMessageBody'] = whatsappGeneralMessage.whatsappTextMessageBody;
        } else if ((whatsappGeneralMessage.whatsappLocationMessageLatitude != null) && (whatsappGeneralMessage.whatsappLocationMessageLongitude != null)){
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappGeneralMessageType'] = 'location';
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappLocationMessageLatitude'] = whatsappGeneralMessage.whatsappLocationMessageLatitude;
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappLocationMessageLongitude'] = whatsappGeneralMessage.whatsappLocationMessageLongitude;
        } else if ((whatsappGeneralMessage.whatsappContactMessageName != null) && (whatsappGeneralMessage.whatsappContactMessagePhoneNumber != null)){
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappGeneralMessageType'] = 'contact';
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappContactMessagePhoneNumber'] = whatsappGeneralMessage.whatsappContactMessagePhoneNumber;
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappContactMessageName'] = whatsappGeneralMessage.whatsappContactMessageName;
        } else if (whatsappGeneralMessage.whatsappImageMessageFile != null){
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappGeneralMessageType'] = 'image';
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappImageMessageFile'] = Buffer.from(whatsappGeneralMessage.whatsappImageMessageFile).toString('base64');
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappImageMessageCaption'] = whatsappGeneralMessage.whatsappImageMessageCaption;
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappImageMessageType'] = whatsappGeneralMessage.whatsappImageMessageType;
        } else if (whatsappGeneralMessage.whatsappVideoMessageFile != null){
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappGeneralMessageType'] = 'video';
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappVideoMessageFile'] = Buffer.from(whatsappGeneralMessage.whatsappVideoMessageFile).toString('base64');
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappVideoMessageCaption'] = whatsappGeneralMessage.whatsappVideoMessageCaption;
        } else if (whatsappGeneralMessage.whatsappAudioMessageFile != null){
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappGeneralMessageType'] = 'audio';
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappAudioMessageFile'] = Buffer.from(whatsappGeneralMessage.whatsappAudioMessageFile).toString('base64');
        } else if (whatsappGeneralMessage.whatsappDocumentMessageFile != null){
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappGeneralMessageType'] = 'document';
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappDocumentMessageFile'] = Buffer.from(whatsappGeneralMessage.whatsappDocumentMessageFile).toString('base64');
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappDocumentMessageMimeType'] = whatsappGeneralMessage.whatsappDocumentMessageMimeType;
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappDocumentMessageFileName'] = whatsappGeneralMessage.whatsappDocumentMessageFileName;
        } else if (whatsappGeneralMessage.whatsappFavoriteImageMessageDriveURL != null){
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappGeneralMessageType'] = 'favoriteImage';
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappFavoriteImageMessageDriveURL'] = whatsappGeneralMessage.whatsappFavoriteImageMessageDriveURL;
          whatsappConversations[whatsappConversationID]['whatsappConversationMessages'][whatsappGeneralMessage.whatsappGeneralMessageIndex]['whatsappFavoriteImageMessageCaption'] = whatsappGeneralMessage.whatsappFavoriteImageMessageCaption;
        }
      }

      for (var whatsappConversationID in whatsappConversations){
        if (whatsappConversations[whatsappConversationID]['whatsappConversationMessages'].length == 0){
          delete whatsappConversations[whatsappConversationID];
        }
      }
      composeWhatsappConversationsPromiseResolve(whatsappConversations);
    });
  },

  insertAgent: async function(agentID, agentName, agentUsername, agentPassword, agentType){
    return new Promise(async (insertAgentPromiseResolve) => {
      const insertAgentSQL = `INSERT INTO Agents (agentID, agentName, agentProfileImage, agentUsername, agentPassword, agentType, agentStatus, agentStartMessage, agentEndMessage) VALUES (?,?,?,?,?,?,?,?,?);`;
      const agentProfileImage = '';
      const agentStatus = 'offline';
      const agentStartMessage = 'Hola, gracias por escribir a KingVape';
      const agentEndMessage = 'Gracias por escribir a KingVape, me despido';
      const insertAgentValues = [agentID, agentName, agentProfileImage, agentUsername, agentPassword, agentType, agentStatus, agentStartMessage, agentEndMessage];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(insertAgentSQL, insertAgentValues);
      insertAgentPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  deleteAgent: async function(agentID){
    return new Promise(async (deleteAgentPromiseResolve) => {
      const deleteAgentSQL = `DELETE FROM Agents WHERE agentID=(?);`;
      const deleteAgentValues = [agentID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(deleteAgentSQL, deleteAgentValues);
      deleteAgentPromiseResolve(JSON.stringify(databaseResult));
    });
  },
  
  selectApplicationStatus: async function(){
    return new Promise(async (selectApplicationStatusPromiseResolve) => {
      const selectApplicationStatusSQL = `SELECT active FROM Application;`;
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectApplicationStatusSQL);
      if (databaseResult.result[0]){
        selectApplicationStatusPromiseResolve(JSON.stringify({success: true, result: databaseResult.result[0].active}));
      } else {
        selectApplicationStatusPromiseResolve(JSON.stringify({success: false}));
      }
    });
  },

  updateApplicationStatus: async function(websocketConnection, active){
    return new Promise(async (updateApplicationStatusPromiseResolve) => {
      const updateApplicationStatusSQL = `UPDATE Application SET active=(?);`;
      const updateApplicationStatusValues = [active];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateApplicationStatusSQL, updateApplicationStatusValues);
      if (databaseResult.success){
        websocketConnection.sendWebsocketMessage('/updateApplicationStatus', {success: true, result: active});
        updateApplicationStatusPromiseResolve(JSON.stringify({success: true, result: active}));
      } else {
        updateApplicationStatusPromiseResolve(JSON.stringify({success: false}));
      }
    });
  },

  selectFavoriteImages: async function(){
    return new Promise(async (selectFavoriteImagesPromiseResolve) => {
      const selectFavoriteImagesSQL = `SELECT * FROM WhatsappFavoriteImages ORDER BY whatsappFavoriteImageName;`;
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectFavoriteImagesSQL);
      selectFavoriteImagesPromiseResolve(JSON.stringify(databaseResult));
    });
  },





  selectPieChartInformation: async function(){
    return new Promise(async (selectPieChartInformationPromiseResolve) => {
      let currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 6);
      let hourPart = currentDate.toISOString().substring(11, 13);
      let hour = parseInt(hourPart, 10);

      var selectAgentRankingInformationSQL = '';
      if (hour >= 18){
        selectAgentRankingInformationSQL = 
        `
        SELECT WhatsappConversations.whatsappConversationAmount, WhatsappConversations.whatsappConversationEndDateTime, Agents.agentName
        FROM WhatsappConversations
        JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
        WHERE 
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%Y-%m-%d 6:00:00')
            AND
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
            AND
          WhatsappConversationAmount != (?);
        `; 
      } else {
        selectAgentRankingInformationSQL = 
        `
        SELECT WhatsappConversations.whatsappConversationAmount, WhatsappConversations.whatsappConversationEndDateTime, Agents.agentName
        FROM WhatsappConversations
        JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
        WHERE 
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
            AND
          WhatsappConversationAmount != (?);
        `;        
      }

      const selectAgentRankingInformationValues = [0];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentRankingInformationSQL, selectAgentRankingInformationValues);
      var agentsAndAmounts = {};
      for (var conversationIndex in databaseResult.result){
        const agentName = databaseResult.result[conversationIndex].agentName;
        const whatsappConversationAmount = databaseResult.result[conversationIndex].whatsappConversationAmount;
        if (agentName in agentsAndAmounts){
          agentsAndAmounts[agentName] = agentsAndAmounts[agentName] + whatsappConversationAmount;
        } else {
          agentsAndAmounts[agentName] = whatsappConversationAmount;
        }
      }
      selectPieChartInformationPromiseResolve(JSON.stringify(agentsAndAmounts));
    });
  },

  selectFilteredPieChartInformation: async function(initialDate, endDate){
    return new Promise(async (selectFilteredPieChartInformationPromiseResolve) => {
      const conditions = [];
            
      if (initialDate != ''){
        initialDate = new Date(initialDate);
        initialDate.setHours(initialDate.getHours() + 6);
        initialDate = initialDate.toString();
        initialDate = initialDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') >= STR_TO_DATE('${initialDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      if (endDate != ''){
        endDate = new Date(endDate);
        endDate.setHours(endDate.getHours() + 6);
        endDate = endDate.toString();
        endDate = endDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') <= STR_TO_DATE('${endDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

      var selectAgentRankingInformationSQL = 
      `
      SELECT WhatsappConversations.whatsappConversationAmount, WhatsappConversations.whatsappConversationEndDateTime, Agents.agentName
      FROM WhatsappConversations
      JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
      WHERE 
        WhatsappConversationAmount != (?)
      `;
      selectAgentRankingInformationSQL = selectAgentRankingInformationSQL + whereClause;
      const selectAgentRankingInformationValues = [0];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentRankingInformationSQL, selectAgentRankingInformationValues);
      
      var agentsAndAmounts = {};
      for (var conversationIndex in databaseResult.result){
        const agentName = databaseResult.result[conversationIndex].agentName;
        const whatsappConversationAmount = databaseResult.result[conversationIndex].whatsappConversationAmount;
        if (agentName in agentsAndAmounts){
          agentsAndAmounts[agentName] = agentsAndAmounts[agentName] + whatsappConversationAmount;
        } else {
          agentsAndAmounts[agentName] = whatsappConversationAmount;
        }
      }
      selectFilteredPieChartInformationPromiseResolve(JSON.stringify(agentsAndAmounts));
    });
  },

  selectBarChartInformation: async function(){
    return new Promise(async (selectBarChartInformationPromiseResolve) => {
      let currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 6);
      let hourPart = currentDate.toISOString().substring(11, 13);
      let hour = parseInt(hourPart, 10);

      var selectAgentRankingInformationSQL = '';
      if (hour >= 18){
        selectAgentRankingInformationSQL = 
        `
        SELECT 
          Agents.agentID,
          Agents.agentName,
          WhatsappConversations.whatsappConversationAmount, 
          WhatsappConversations.whatsappConversationRecipientPhoneNumber,
          WhatsappConversations.whatsappConversationCloseComment
        FROM WhatsappConversations
        JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
        WHERE 
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%Y-%m-%d 6:00:00')
            AND
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
            AND
          WhatsappConversations.whatsappConversationIsActive = (?)
        `;
      } else {
        selectAgentRankingInformationSQL = 
        `
        SELECT 
          Agents.agentID,
          Agents.agentName,
          WhatsappConversations.whatsappConversationAmount, 
          WhatsappConversations.whatsappConversationRecipientPhoneNumber,
          WhatsappConversations.whatsappConversationCloseComment
        FROM WhatsappConversations
        JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
        WHERE 
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
            AND
          WhatsappConversations.whatsappConversationIsActive = (?)
        `;
      }
      
      const whatsappConversationIsActive = false;
      const selectAgentRankingInformationValues = [whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentRankingInformationSQL, selectAgentRankingInformationValues);
      if (databaseResult.success){
      
        const sortedDatabaseResult = databaseResult.result.sort((a, b) => b.whatsappConversationAmount - a.whatsappConversationAmount);
        var evaluatedNumbers = {};
        var agentsAndConversations = {};
        
        for (var sortedDatabaseResultIndex in sortedDatabaseResult){
          const sortedDatabaseResultObject = sortedDatabaseResult[sortedDatabaseResultIndex];
          const whatsappConversationRecipientPhoneNumber = sortedDatabaseResultObject.whatsappConversationRecipientPhoneNumber;
          const whatsappConversationAmount = sortedDatabaseResultObject.whatsappConversationAmount;
          const whatsappConversationCloseComment = sortedDatabaseResultObject.whatsappConversationCloseComment;
          const agentName = sortedDatabaseResultObject.agentName;
          if (!(whatsappConversationRecipientPhoneNumber in evaluatedNumbers)){
            evaluatedNumbers[whatsappConversationRecipientPhoneNumber] = 'true';
            if (agentName in agentsAndConversations){
              if (whatsappConversationAmount == 0){
                if (whatsappConversationCloseComment == 'Venta perdida' || whatsappConversationCloseComment == 'Venta para otro día' || whatsappConversationCloseComment == 'Consulta sobre productos' || whatsappConversationCloseComment == 'No contestó'){
                  agentsAndConversations[agentName]['whatsappNotSelledConversations'] = agentsAndConversations[agentName]['whatsappNotSelledConversations'] + 1;
                }
              } else {
                agentsAndConversations[agentName]['whatsappSelledConversations'] = agentsAndConversations[agentName]['whatsappSelledConversations'] + 1;
              }
            } else {
              if (whatsappConversationAmount == 0){
                if (whatsappConversationCloseComment == 'Venta perdida' || whatsappConversationCloseComment == 'Venta para otro día' || whatsappConversationCloseComment == 'Consulta sobre productos' || whatsappConversationCloseComment == 'No contestó'){
                  agentsAndConversations[agentName] = {'agentID': sortedDatabaseResultObject.agentID, 'whatsappSelledConversations': 0, 'whatsappNotSelledConversations': 1}
                }
              } else {
                agentsAndConversations[agentName] = {'agentID': sortedDatabaseResultObject.agentID, 'whatsappSelledConversations': 1, 'whatsappNotSelledConversations': 0}
              }
            }
          }
        }
        var agentsAndConversationsArray = [];
        for (var agentName in agentsAndConversations){
          agentsAndConversationsArray.push
          ({
            'agentName': agentName,
            'agentID': agentsAndConversations[agentName].agentID,
            'whatsappSelledConversations': agentsAndConversations[agentName].whatsappSelledConversations,
            'whatsappNotSelledConversations': agentsAndConversations[agentName].whatsappNotSelledConversations
          });
        }
        const result = 
        {
          success: true, 
          result: agentsAndConversationsArray
        };
        selectBarChartInformationPromiseResolve(JSON.stringify(result));
        
      } else {
        selectBarChartInformationPromiseResolve(JSON.stringify(databaseResult));

      }
    });
  },

  
  selectFilteredBarChartInformationResult: async function(initialDate, endDate){
    return new Promise(async (selectBarFilteredBarChartInformationPromiseResolve) => {
      const conditions = [];
            
      if (initialDate != ''){
        initialDate = new Date(initialDate);
        initialDate.setHours(initialDate.getHours() + 6);
        initialDate = initialDate.toString();
        initialDate = initialDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') >= STR_TO_DATE('${initialDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      if (endDate != ''){
        endDate = new Date(endDate);
        endDate.setHours(endDate.getHours() + 6);
        endDate = endDate.toString();
        endDate = endDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') <= STR_TO_DATE('${endDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

      var selectAgentRankingInformationSQL = 
      `
      SELECT 
        Agents.agentID,
        Agents.agentName,
        WhatsappConversations.whatsappConversationAmount, 
        WhatsappConversations.whatsappConversationRecipientPhoneNumber,
        WhatsappConversations.whatsappConversationCloseComment
      FROM WhatsappConversations
      JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
      WHERE 
        WhatsappConversations.whatsappConversationIsActive = (?)
      `;
      selectAgentRankingInformationSQL = selectAgentRankingInformationSQL + whereClause;

      const whatsappConversationIsActive = false;
      const selectAgentRankingInformationValues = [whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentRankingInformationSQL, selectAgentRankingInformationValues);
      
      const sortedDatabaseResult = databaseResult.result.sort((a, b) => b.whatsappConversationAmount - a.whatsappConversationAmount);
      
      var evaluatedNumbers = {};
      var agentsAndConversations = {};
      
      for (var sortedDatabaseResultIndex in sortedDatabaseResult){
        const sortedDatabaseResultObject = sortedDatabaseResult[sortedDatabaseResultIndex];
        const whatsappConversationRecipientPhoneNumber = sortedDatabaseResultObject.whatsappConversationRecipientPhoneNumber;
        const whatsappConversationAmount = sortedDatabaseResultObject.whatsappConversationAmount;
        const whatsappConversationCloseComment = sortedDatabaseResultObject.whatsappConversationCloseComment;
        const agentName = sortedDatabaseResultObject.agentName;
        if (!(whatsappConversationRecipientPhoneNumber in evaluatedNumbers)){
          evaluatedNumbers[whatsappConversationRecipientPhoneNumber] = 'true';
          if (agentName in agentsAndConversations){
            if (whatsappConversationAmount == 0){
              if (whatsappConversationCloseComment == 'Venta perdida' || whatsappConversationCloseComment == 'Venta para otro día' || whatsappConversationCloseComment == 'Consulta sobre productos' || whatsappConversationCloseComment == 'No contestó'){
                agentsAndConversations[agentName]['whatsappNotSelledConversations'] = agentsAndConversations[agentName]['whatsappNotSelledConversations'] + 1;
              }
            } else {
              agentsAndConversations[agentName]['whatsappSelledConversations'] = agentsAndConversations[agentName]['whatsappSelledConversations'] + 1;
            }
          } else {
            if (whatsappConversationAmount == 0){
              if (whatsappConversationCloseComment == 'Venta perdida' || whatsappConversationCloseComment == 'Venta para otro día' || whatsappConversationCloseComment == 'Consulta sobre productos' || whatsappConversationCloseComment == 'No contestó'){
                agentsAndConversations[agentName] = {'agentID': sortedDatabaseResultObject.agentID, 'whatsappSelledConversations': 0, 'whatsappNotSelledConversations': 1}
              }
            } else {
              agentsAndConversations[agentName] = {'agentID': sortedDatabaseResultObject.agentID, 'whatsappSelledConversations': 1, 'whatsappNotSelledConversations': 0}
            }
          }
        }
      }
      var agentsAndConversationsArray = [];
      for (var agentName in agentsAndConversations){
        agentsAndConversationsArray.push
        ({
          'agentName': agentName,
          'agentID': agentsAndConversations[agentName].agentID,
          'whatsappSelledConversations': agentsAndConversations[agentName].whatsappSelledConversations,
          'whatsappNotSelledConversations': agentsAndConversations[agentName].whatsappNotSelledConversations
        });
      }
      const result = 
      {
        success: true, 
        result: agentsAndConversationsArray
      };
      selectBarFilteredBarChartInformationPromiseResolve(JSON.stringify(result));
    });
  },

  selectTodayInformation: async function(){
    return new Promise(async (selectTodayInformationPromiseResolve) => {
      let currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 6);
      let hourPart = currentDate.toISOString().substring(11, 13);
      let hour = parseInt(hourPart, 10);

      var selectAgentRankingInformationSQL = '';
      if (hour >= 18){
        selectAgentRankingInformationSQL = 
        `
        SELECT whatsappConversationAmount, whatsappConversationAssignedAgentID, whatsappConversationRecipientPhoneNumber, whatsappConversationCloseComment, whatsappConversationLocalityName
        FROM WhatsappConversations
        WHERE 
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
            AND
          whatsappConversationIsActive = (?)
        ;`;
      } else {
        selectAgentRankingInformationSQL = 
        `
        SELECT whatsappConversationAmount, whatsappConversationAssignedAgentID, whatsappConversationRecipientPhoneNumber, whatsappConversationCloseComment, whatsappConversationLocalityName
        FROM WhatsappConversations
        WHERE 
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
            AND
          whatsappConversationIsActive = (?)
        ;`;
      }
  
      const whatsappConversationIsActive = false;
      const selectAgentRankingInformationValues = [whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentRankingInformationSQL, selectAgentRankingInformationValues);
      
      var evaluatedNumbers = {};
      var whatsappSelledConversations = 0;
      var whatsappNotSelledConversations = 0;

      var informationByLocality = {};

      if (databaseResult.success){

        const sortedDatabaseResult = databaseResult.result.sort((a, b) => b.whatsappConversationAmount - a.whatsappConversationAmount);
        for (var sortedDatabaseResultIndex in sortedDatabaseResult){
          const sortedDatabaseResultObject = sortedDatabaseResult[sortedDatabaseResultIndex];
          const whatsappConversationAmount = sortedDatabaseResultObject.whatsappConversationAmount;
          const whatsappConversationCloseComment = sortedDatabaseResultObject.whatsappConversationCloseComment;

          const whatsappConversationLocalityName = sortedDatabaseResultObject.whatsappConversationLocalityName;

          const whatsappConversationRecipientPhoneNumber = sortedDatabaseResultObject.whatsappConversationRecipientPhoneNumber;

          if ((whatsappConversationAmount != 0) && (!(whatsappConversationRecipientPhoneNumber in evaluatedNumbers))){
            whatsappSelledConversations = whatsappSelledConversations + 1;
            if (whatsappConversationLocalityName in informationByLocality){
              informationByLocality[whatsappConversationLocalityName]['whatsappSelledConversations'] = informationByLocality[whatsappConversationLocalityName]['whatsappSelledConversations'] + 1;
              informationByLocality[whatsappConversationLocalityName]['amount'] = informationByLocality[whatsappConversationLocalityName]['amount'] + whatsappConversationAmount;
            } else {
              informationByLocality[whatsappConversationLocalityName] = 
              {
                'whatsappSelledConversations': 1,
                'whatsappNotSelledConversations': 0,
                'amount': whatsappConversationAmount
              }
            }
          }
          if ((whatsappConversationAmount == 0) && (!(whatsappConversationRecipientPhoneNumber in evaluatedNumbers))){

            if (whatsappConversationCloseComment == 'Venta perdida' || whatsappConversationCloseComment == 'Venta para otro día' || whatsappConversationCloseComment == 'Consulta sobre productos' || whatsappConversationCloseComment == 'No contestó'){
              
              if (whatsappConversationLocalityName in informationByLocality){
                informationByLocality[whatsappConversationLocalityName]['whatsappNotSelledConversations'] = informationByLocality[whatsappConversationLocalityName]['whatsappNotSelledConversations'] + 1;
              } else {
                informationByLocality[whatsappConversationLocalityName] = 
                {
                  'whatsappSelledConversations': 0,
                  'whatsappNotSelledConversations': 1,
                  'amount': 0
                }
              }
            }
          }

          if (whatsappConversationRecipientPhoneNumber in evaluatedNumbers){
            if (whatsappConversationCloseComment != 'Vuelve a escribir'){
              if (whatsappConversationCloseComment == 'Venta perdida' || whatsappConversationCloseComment == 'Venta para otro día' || whatsappConversationCloseComment == 'Consulta sobre productos' || whatsappConversationCloseComment == 'No contestó'){
                whatsappNotSelledConversations = whatsappNotSelledConversations + 1;
                if (whatsappConversationLocalityName in informationByLocality){
                  informationByLocality[whatsappConversationLocalityName]['whatsappNotSelledConversations'] = informationByLocality[whatsappConversationLocalityName]['whatsappNotSelledConversations'] + 1;
                } else {
                  informationByLocality[whatsappConversationLocalityName] = 
                  {
                    'whatsappSelledConversations': 0,
                    'whatsappNotSelledConversations': 1,
                    'amount': 0
                  }
                }
              } else {
                whatsappSelledConversations = whatsappSelledConversations + 1;
                if (whatsappConversationLocalityName in informationByLocality){
                  informationByLocality[whatsappConversationLocalityName]['whatsappSelledConversations'] = informationByLocality[whatsappConversationLocalityName]['whatsappSelledConversations'] + 1;
                  informationByLocality[whatsappConversationLocalityName]['amount'] = informationByLocality[whatsappConversationLocalityName]['amount'] + whatsappConversationAmount;
                } else {
                  informationByLocality[whatsappConversationLocalityName] = 
                  {
                    'whatsappSelledConversations': 1,
                    'whatsappNotSelledConversations': 0,
                    'amount': whatsappConversationAmount
                  }
                }
              }
            }
          }

          
          evaluatedNumbers[whatsappConversationRecipientPhoneNumber] = 'true';
        }

        const result = 
        {
          success: true, 
          result: 
          {
            'total': 
            {
            'whatsappTotalConversations': whatsappSelledConversations + whatsappNotSelledConversations,
            'whatsappSelledConversations': whatsappSelledConversations,
            'whatsappNotSelledConversations': whatsappNotSelledConversations
            },
            'localities': informationByLocality
          }
        }

        selectTodayInformationPromiseResolve(JSON.stringify(result))
      } else {
        selectTodayInformationPromiseResolve(JSON.stringify({success: false}))
      }
      ;
    });
  },

  selectFilteredTodayInformation: async function(initialDate, endDate){
    return new Promise(async (selectFilteredTodayInformationPromiseResolve) => {
      const conditions = [];
            
      if (initialDate != ''){
        initialDate = new Date(initialDate);
        initialDate.setHours(initialDate.getHours() + 6);
        initialDate = initialDate.toString();
        initialDate = initialDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') >= STR_TO_DATE('${initialDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      if (endDate != ''){
        endDate = new Date(endDate);
        endDate.setHours(endDate.getHours() + 6);
        endDate = endDate.toString();
        endDate = endDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') <= STR_TO_DATE('${endDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

      var selectAgentRankingInformationSQL = 
      `
      SELECT whatsappConversationAmount, whatsappConversationRecipientPhoneNumber, whatsappConversationCloseComment
      FROM WhatsappConversations
      WHERE 
        whatsappConversationIsActive = (?)
      `;
      selectAgentRankingInformationSQL = selectAgentRankingInformationSQL + whereClause;
      
      const whatsappConversationIsActive = false;
      const selectAgentRankingInformationValues = [whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentRankingInformationSQL, selectAgentRankingInformationValues);
            
      var evaluatedNumbers = {};
      var whatsappSelledConversations = 0;
      var whatsappNotSelledConversations = 0;
      const sortedDatabaseResult = databaseResult.result.sort((a, b) => b.whatsappConversationAmount - a.whatsappConversationAmount);
      for (var sortedDatabaseResultIndex in sortedDatabaseResult){
        const sortedDatabaseResultObject = sortedDatabaseResult[sortedDatabaseResultIndex];
        const whatsappConversationAmount = sortedDatabaseResultObject.whatsappConversationAmount;
        const whatsappConversationCloseComment = sortedDatabaseResultObject.whatsappConversationCloseComment;
        const whatsappConversationRecipientPhoneNumber = sortedDatabaseResultObject.whatsappConversationRecipientPhoneNumber;
        if ((whatsappConversationAmount != 0) && (!(whatsappConversationRecipientPhoneNumber in evaluatedNumbers))){
          whatsappSelledConversations = whatsappSelledConversations + 1;
        }
        if ((whatsappConversationAmount == 0) && (!(whatsappConversationRecipientPhoneNumber in evaluatedNumbers))){
          if (whatsappConversationCloseComment == 'Venta perdida' || whatsappConversationCloseComment == 'Venta para otro día' || whatsappConversationCloseComment == 'Consulta sobre productos' || whatsappConversationCloseComment == 'No contestó'){
            whatsappNotSelledConversations = whatsappNotSelledConversations + 1;
          }
        }
        evaluatedNumbers[whatsappConversationRecipientPhoneNumber] = 'true';
      }
      const result = 
      {
        success: true, 
        result: 
        [{
          whatsappTotalConversations: whatsappSelledConversations + whatsappNotSelledConversations,
          whatsappSelledConversations: whatsappSelledConversations,
          whatsappNotSelledConversations: whatsappNotSelledConversations
        }]
      }
      selectFilteredTodayInformationPromiseResolve(JSON.stringify(result));
    });
  },

  selectTodayTopSell: async function(){
    return new Promise(async (selectTodayTopSellPromiseResolve) => {
      let currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 6);
      let hourPart = currentDate.toISOString().substring(11, 13);
      let hour = parseInt(hourPart, 10);

      var selectTodayTopSellSQL = '';
      if (hour >= 18){
        selectTodayTopSellSQL = 
        `
        SELECT 
          Agents.agentName,
          WhatsappConversations.whatsappConversationAmount,
          WhatsappConversations.whatsappConversationRecipientPhoneNumber,
          WhatsappConversations.whatsappConversationRecipientProfileName
        FROM WhatsappConversations
        JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
        WHERE 
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%Y-%m-%d 6:00:00')
            AND
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
            AND
          WhatsappConversations.whatsappConversationIsActive = (?)
        `;
      } else {
        selectTodayTopSellSQL = 
        `
        SELECT 
          Agents.agentName,
          WhatsappConversations.whatsappConversationAmount,
          WhatsappConversations.whatsappConversationRecipientPhoneNumber,
          WhatsappConversations.whatsappConversationRecipientProfileName
        FROM WhatsappConversations
        JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
        WHERE 
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
            AND
          WhatsappConversations.whatsappConversationIsActive = (?)
        `;
      }

      const whatsappConversationIsActive = false;
      const selectTodayTopSellValues = [whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTodayTopSellSQL, selectTodayTopSellValues);
      if (databaseResult.success){
        const sortedDatabaseResult = databaseResult.result.sort((a, b) => b.whatsappConversationAmount - a.whatsappConversationAmount);
        var temp = [];
        if (sortedDatabaseResult[0]){
          const maxIndex = Math.min(sortedDatabaseResult.length, 10);
          temp = sortedDatabaseResult.slice(0, maxIndex);
        }
        const result = 
        {
          success: true, 
          result: temp
        };
        selectTodayTopSellPromiseResolve(JSON.stringify(result));
      }
    });
  },

  selectFilteredTodayTopSell: async function(initialDate, endDate){
    return new Promise(async (selectFilteredTodayTopSellPromiseResolve) => {
      const conditions = [];
            
      if (initialDate != ''){
        initialDate = new Date(initialDate);
        initialDate.setHours(initialDate.getHours() + 6);
        initialDate = initialDate.toString();
        initialDate = initialDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') >= STR_TO_DATE('${initialDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      if (endDate != ''){
        endDate = new Date(endDate);
        endDate.setHours(endDate.getHours() + 6);
        endDate = endDate.toString();
        endDate = endDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') <= STR_TO_DATE('${endDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

      var selectTodayTopSellSQL = 
      `
      SELECT 
        Agents.agentName,
        WhatsappConversations.whatsappConversationAmount
      FROM WhatsappConversations
      JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
      WHERE 
        WhatsappConversations.whatsappConversationIsActive = (?)
      `;
      selectTodayTopSellSQL = selectTodayTopSellSQL + whereClause;

      const whatsappConversationIsActive = false;
      const selectTodayTopSellValues = [whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTodayTopSellSQL, selectTodayTopSellValues);
      
      const sortedDatabaseResult = databaseResult.result.sort((a, b) => b.whatsappConversationAmount - a.whatsappConversationAmount);
      
      var subresult = 'Sin datos';
      if (sortedDatabaseResult[0]){
        subresult = sortedDatabaseResult[0].agentName
      } 

      const result = 
      {
        success: true, 
        result: subresult
      };
      selectFilteredTodayTopSellPromiseResolve(JSON.stringify(result));
    });
  },

  selectTodayFeedbackInformation: async function(){
    return new Promise(async (selectTodayFeedbackInformationPromiseResolve) => {
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 6);
      var hourPart = currentDate.toISOString().substring(11, 13);
      var hour = parseInt(hourPart, 10);

      var selectTodayFeedbackInformationSQL = '';
      if (hour >= 18){
        selectTodayFeedbackInformationSQL = 
        `
        SELECT 
          WhatsappConversations.whatsappConversationRecipientPhoneNumber,
          WhatsappConversations.whatsappConversationRecipientProfileName,
          Agents.agentName,
          WhatsappFeedbacks.whatsappFeedbackOne,
          WhatsappFeedbacks.whatsappFeedbackTwo,
          WhatsappFeedbacks.whatsappFeedbackThree,
          WhatsappFeedbacks.whatsappFeedbackFour
        FROM WhatsappConversations
        LEFT JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
        LEFT JOIN WhatsappFeedbacks ON WhatsappConversations.whatsappConversationID = WhatsappFeedbacks.whatsappFeedbackWhatsappConversationID
        WHERE 
          STR_TO_DATE(WhatsappFeedbacks.whatsappFeedbackDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(WhatsappFeedbacks.whatsappFeedbackDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
        `;
      } else {
        selectTodayFeedbackInformationSQL = 
        `
        SELECT 
          WhatsappConversations.whatsappConversationRecipientPhoneNumber,
          WhatsappConversations.whatsappConversationRecipientProfileName,
          Agents.agentName,
          WhatsappFeedbacks.whatsappFeedbackOne,
          WhatsappFeedbacks.whatsappFeedbackTwo,
          WhatsappFeedbacks.whatsappFeedbackThree,
          WhatsappFeedbacks.whatsappFeedbackFour
        FROM WhatsappConversations
        LEFT JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
        LEFT JOIN WhatsappFeedbacks ON WhatsappConversations.whatsappConversationID = WhatsappFeedbacks.whatsappFeedbackWhatsappConversationID
        WHERE 
          STR_TO_DATE(WhatsappFeedbacks.whatsappFeedbackDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(WhatsappFeedbacks.whatsappFeedbackDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
        `;
      }

      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTodayFeedbackInformationSQL);
      if (databaseResult.success){
        
        const feedbackInformation = {};

        for (var databaseResultIndex in databaseResult.result){
          const databaseResultObject = databaseResult.result[databaseResultIndex];
          const agentName = databaseResultObject.agentName;
          const whatsappFeedbackOne = databaseResultObject.whatsappFeedbackOne;
          const whatsappFeedbackTwo = databaseResultObject.whatsappFeedbackTwo;
          const whatsappFeedbackThree = databaseResultObject.whatsappFeedbackThree;
          const whatsappFeedbackFour = databaseResultObject.whatsappFeedbackFour;
          if (!(agentName in feedbackInformation)){
            feedbackInformation[agentName] = {
              'agentName': agentName,
              'whatsappConversationsAmount': 1,
              'agentScore': (whatsappFeedbackOne + whatsappFeedbackTwo + whatsappFeedbackThree + whatsappFeedbackFour)/4
            }
          } else {
            feedbackInformation[agentName]['whatsappConversationsAmount'] = feedbackInformation[agentName]['whatsappConversationsAmount'] + 1;
            feedbackInformation[agentName]['agentScore'] = feedbackInformation[agentName]['agentScore'] + (whatsappFeedbackOne + whatsappFeedbackTwo + whatsappFeedbackThree + whatsappFeedbackFour)/4;
          }
        }

        for (var agentName in feedbackInformation){
          feedbackInformation[agentName]['agentScore'] = Math.round((feedbackInformation[agentName]['agentScore']/feedbackInformation[agentName]['whatsappConversationsAmount']) * 2) / 2;
        }

        selectTodayFeedbackInformationPromiseResolve(JSON.stringify(feedbackInformation));
      }
    });
  },

  selectFilteredTodayFeedbackInformation: async function(initialDate, endDate){
    return new Promise(async (selectTodayFeedbackInformationPromiseResolve) => {
      const conditions = [];
          
      if (initialDate != ''){
        initialDate = new Date(initialDate);
        initialDate.setHours(initialDate.getHours() + 6);
        initialDate = initialDate.toString();
        initialDate = initialDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(WhatsappFeedbacks.whatsappFeedbackDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') >= STR_TO_DATE('${initialDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      if (endDate != ''){
        endDate = new Date(endDate);
        endDate.setHours(endDate.getHours() + 6);
        endDate = endDate.toString();
        endDate = endDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(WhatsappFeedbacks.whatsappFeedbackDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') <= STR_TO_DATE('${endDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

      var selectTodayFeedbackInformationSQL = 
      `
      SELECT 
          WhatsappConversations.whatsappConversationRecipientPhoneNumber,
          WhatsappConversations.whatsappConversationRecipientProfileName,
          Agents.agentName,
          WhatsappFeedbacks.whatsappFeedbackOne,
          WhatsappFeedbacks.whatsappFeedbackTwo,
          WhatsappFeedbacks.whatsappFeedbackThree,
          WhatsappFeedbacks.whatsappFeedbackFour
        FROM WhatsappConversations
        LEFT JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
        LEFT JOIN WhatsappFeedbacks ON WhatsappConversations.whatsappConversationID = WhatsappFeedbacks.whatsappFeedbackWhatsappConversationID
        WHERE
          WhatsappConversations.whatsappConversationIsActive = (?)
      `;
      selectTodayFeedbackInformationSQL = selectTodayFeedbackInformationSQL + whereClause;

      const whatsappConversationIsActive = false;
      const selectTodayFeedbackInformationValues = [whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTodayFeedbackInformationSQL, selectTodayFeedbackInformationValues);

      if (databaseResult.success){
        
        const feedbackInformation = {};

        for (var databaseResultIndex in databaseResult.result){
          const databaseResultObject = databaseResultObject[databaseResultIndex];
          const agentName = databaseResultObject.agentName;
          const whatsappFeedbackOne = databaseResultObject.whatsappFeedbackOne;
          const whatsappFeedbackTwo = databaseResultObject.whatsappFeedbackTwo;
          const whatsappFeedbackThree = databaseResultObject.whatsappFeedbackThree;
          const whatsappFeedbackFour = databaseResultObject.whatsappFeedbackFour;
          if (!(agentName in feedbackInformation)){
            feedbackInformation[agentName] = {
              'agentName': agentName,
              'whatsappConversationsAmount': 1,
              'agentScore': (whatsappFeedbackOne + whatsappFeedbackTwo + whatsappFeedbackThree + whatsappFeedbackFour)/4
            }
          } else {
            feedbackInformation[agentName]['whatsappConversationsAmount'] = feedbackInformation[agentName]['whatsappConversationsAmount'] + 1;
            feedbackInformation[agentName]['agentScore'] = feedbackInformation[agentName]['agentScore'] + (whatsappFeedbackOne + whatsappFeedbackTwo + whatsappFeedbackThree + whatsappFeedbackFour)/4;
          }
        }

        for (var agentName in feedbackInformation){
          feedbackInformation[agentName]['agentScore'] = Math.round((feedbackInformation[agentName]['agentScore']/feedbackInformation[agentName]['whatsappConversationsAmount']) * 2) / 2;
        }

        selectTodayFeedbackInformationPromiseResolve(JSON.stringify(feedbackInformation));
      }
    });
  },

  
















  traduceText: async function(textToTraduce, languageToTraduce){
    return new Promise(async (traduceTextPromiseResolve) => {
      axios.post('https://api-free.deepl.com/v2/translate',
      {
        text: [textToTraduce],
        target_lang: languageToTraduce
      },
        {headers: {'Authorization': 'DeepL-Auth-Key 9be540ee-a00f-4710-a607-1d2fa1aa8fc8:fx', 'Content-Type': 'application/json'}}
      ).then((response) =>{ 
        try {
          const traducedText = response.data.translations[0].text;
          traduceTextPromiseResolve(JSON.stringify({success: true, result: traducedText}));
        } catch (error) {
          traduceTextPromiseResolve(JSON.stringify({success: false, result: error}));
        }
      })
      .catch((error) =>{
        traduceTextPromiseResolve(JSON.stringify({success: false, result: error}));
      });
    });
  },


  updateWhatsappFavoriteImage: async function(whatsappFavoriteImageID, whatsappFavoriteImageName, whatsappFavoriteImageFileID, whatsappFavoriteImageDriveURL, whatsappFavoriteImageCatalog){
    return new Promise(async (updateWhatsappFavoriteImagePromiseResolve) => {
      const updateWhatsappFavoriteImageSQL = `UPDATE WhatsappFavoriteImages SET whatsappFavoriteImageName=(?), whatsappFavoriteImageFileID=(?), whatsappFavoriteImageDriveURL=(?), whatsappFavoriteImageCatalog=(?), whatsappFavoriteImageUploadDate=(?) WHERE whatsappFavoriteImageID=(?);`;
      const whatsappFavoriteImageUploadDate = new Date().toString();
      const updateWhatsappFavoriteImageValues = [whatsappFavoriteImageName, whatsappFavoriteImageFileID, whatsappFavoriteImageDriveURL, whatsappFavoriteImageCatalog, whatsappFavoriteImageUploadDate, whatsappFavoriteImageID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappFavoriteImageSQL, updateWhatsappFavoriteImageValues);
      updateWhatsappFavoriteImagePromiseResolve(JSON.stringify(databaseResult));
    });
  },


  insertSticker: async function(stickerAgentID, stickerName, stickerFile){
    return new Promise(async (insertStickerPromiseResolve) => {
      const insertStickerSQL = `INSERT INTO Stickers (stickerAgentID, stickerName, stickerFile) VALUES (?, ?, ?);`;
      const insertStickerValues = [stickerAgentID, stickerName, Buffer.from(stickerFile.split(",")[1], 'base64')];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(insertStickerSQL, insertStickerValues);
      insertStickerPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  insertNotification: async function(notificationAgentID, notificationName, notificationPhoneNumber, notificationDateTime){
    return new Promise(async (insertNotificationPromiseResolve) => {
      const insertNotificationSQL = `INSERT INTO Notifications (notificationAgentID, notificationName, notificationPhoneNumber, notificationDateTime) VALUES (?, ?, ?, ?);`;
      const insertNotificationValues = [notificationAgentID, notificationName, notificationPhoneNumber, notificationDateTime];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(insertNotificationSQL, insertNotificationValues);
      insertNotificationPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  useNotification: async function(notificationID){
    return new Promise(async (useNotificationPromiseResolve) => {
      const useNotificationSQL = `UPDATE Notifications SET notificationUsed=(?) WHERE notificationID=(?);`;
      const notificationUsed = true;
      const useNotificationValues = [notificationUsed, notificationID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(useNotificationSQL, useNotificationValues);
      useNotificationPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  deleteNotification: async function(notificationID){
    return new Promise(async (deleteNotificationPromiseResolve) => {
      const deleteNotificationSQL = `DELETE FROM Notifications WHERE notificationID=(?);`;
      const deleteNotificationValues = [notificationID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(deleteNotificationSQL, deleteNotificationValues);
      deleteNotificationPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectAgentNotifications: async function(notificationAgentID){
    return new Promise(async (selectAgentNotificationsPromiseResolve) => {
      const selectAgentNotificationsSQL = `SELECT * FROM Notifications WHERE notificationAgentID=(?);`;
      const selectAgentNotificationsValues = [notificationAgentID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentNotificationsSQL, selectAgentNotificationsValues);
      selectAgentNotificationsPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectMissingLocalStickers: async function(stickerCurrentIDS){
    return new Promise(async (selectMissingLocalStickersPromiseResolve) => {
      var selectMissingLocalStickersSQL = '';
      if (stickerCurrentIDS.length == 0){
        selectMissingLocalStickersSQL = `SELECT * FROM Stickers WHERE stickerID;`;
      } else {
        selectMissingLocalStickersSQL = `SELECT * FROM Stickers WHERE stickerID NOT IN (?);`;
      }
      const selectMissingLocalStickersValues = [stickerCurrentIDS];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectMissingLocalStickersSQL, selectMissingLocalStickersValues);
      if (databaseResult.success){
        const parsedStickers = databaseResult.result.map(sticker => {
          return {
            stickerID: sticker.stickerID,
            stickerAgentID: sticker.stickerAgentID,
            stickerName: sticker.stickerName,
            stickerFile: Buffer.from(sticker.stickerFile).toString('base64')
          };
        });
        selectMissingLocalStickersPromiseResolve(JSON.stringify({success: true, result: parsedStickers}));
      } else {
        selectMissingLocalStickersPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  }


 
}
