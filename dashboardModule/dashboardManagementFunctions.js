const constants = require('../constants.js');
const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');

module.exports = {
  selectAllActiveConversationBasicInformation: async function(){
    return new Promise(async (selectAllActiveConversationBasicInformationPromiseResolve) => {
      const selectAllActiveConversationBasicInformationSQL = 
      `
      SELECT 
        WhatsappConversations.whatsappConversationID,
        WhatsappConversations.whatsappConversationRecipientPhoneNumber,
        WhatsappConversations.whatsappConversationRecipientProfileName,
        Agents.agentName,
        WhatsappConversations.whatsappConversationStartDateTime,
        WhatsappGeneralMessages.whatsappGeneralMessageCreationDateTime,
        WhatsappGeneralMessages.whatsappGeneralMessageOwnerPhoneNumber
      FROM WhatsappConversations
      LEFT JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
      LEFT JOIN (
        SELECT
          whatsappGeneralMessageWhatsappConversationID,
          whatsappGeneralMessageOwnerPhoneNumber,
          MAX(whatsappGeneralMessageIndex) AS whatsappLastGeneralMessageIndex
        FROM WhatsappGeneralMessages
        GROUP BY whatsappGeneralMessageWhatsappConversationID
      ) WhatsappGeneralMessagesIndexTable ON WhatsappConversations.whatsappConversationID = WhatsappGeneralMessagesIndexTable.whatsappGeneralMessageWhatsappConversationID
      LEFT JOIN WhatsappGeneralMessages ON WhatsappGeneralMessages.whatsappGeneralMessageWhatsappConversationID = WhatsappGeneralMessagesIndexTable.whatsappGeneralMessageWhatsappConversationID AND WhatsappGeneralMessages.whatsappGeneralMessageIndex = WhatsappGeneralMessagesIndexTable.whatsappLastGeneralMessageIndex
      WHERE 
        WhatsappConversations.whatsappConversationIsActive = (?)
      `;
      const whatsappConversationIsActive = true;
      const selectAllActiveConversationBasicInformationValues = [whatsappConversationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAllActiveConversationBasicInformationSQL, selectAllActiveConversationBasicInformationValues);
      selectAllActiveConversationBasicInformationPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectTodayDashboardInformation: async function(){
    return new Promise(async (selectTodayDashboardInformationPromiseResolve) => {
      const selectTodayDashboardInformationSQL = 
      `
      SELECT
        whatsappConversationAmount,
        whatsappConversationRecipientPhoneNumber,
        whatsappConversationAssignedAgentID
      FROM WhatsappConversations
      WHERE 
        STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
          AND
        STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 30 HOUR, '%Y-%m-%d 06:00:00')
      ;`;
      const selectTodayDashboardInformationDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTodayDashboardInformationSQL);
      var evaluatedNumbers = {};
      var whatsappSelledConversations = 0;
      var whatsappNotSelledConversations = 0;
      var whatsappPendingConversations = 0;
      var whatsappTotalSells = 0;
      const sortedDatabaseResult = selectTodayDashboardInformationDatabaseResult.result.sort((a, b) => b.whatsappConversationAmount - a.whatsappConversationAmount);
      for (var sortedDatabaseResultIndex in sortedDatabaseResult){
        const sortedDatabaseResultObject = sortedDatabaseResult[sortedDatabaseResultIndex];
        const whatsappConversationAmount = sortedDatabaseResultObject.whatsappConversationAmount;
        const whatsappConversationRecipientPhoneNumber = sortedDatabaseResultObject.whatsappConversationRecipientPhoneNumber;
        const whatsappConversationAssignedAgentID = sortedDatabaseResultObject.whatsappConversationAssignedAgentID;
        whatsappTotalSells = whatsappTotalSells + whatsappConversationAmount;
        if ((whatsappConversationAssignedAgentID == null) && (!(whatsappConversationRecipientPhoneNumber in evaluatedNumbers))){
          whatsappPendingConversations = whatsappPendingConversations + 1;
        }
        else if ((whatsappConversationAmount != 0) && (!(whatsappConversationRecipientPhoneNumber in evaluatedNumbers))){
          whatsappSelledConversations = whatsappSelledConversations + 1;
        }
        else if ((whatsappConversationAmount == 0) && (!(whatsappConversationRecipientPhoneNumber in evaluatedNumbers))){
          whatsappNotSelledConversations = whatsappNotSelledConversations + 1;
        }
        evaluatedNumbers[whatsappConversationRecipientPhoneNumber] = 'true';
      }

      const selectTodayMessagesAmountSQL = 
      `
      SELECT
        SUM(CASE WHEN whatsappGeneralMessageOwnerPhoneNumber IS NULL THEN 1 ELSE 0 END) AS whatsappSendedMessages,
        SUM(CASE WHEN whatsappGeneralMessageOwnerPhoneNumber IS NOT NULL THEN 1 ELSE 0 END) AS whatsappReceivedMessages
      FROM WhatsappGeneralMessages
      WHERE 
        STR_TO_DATE(whatsappGeneralMessageCreationDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
          AND
        STR_TO_DATE(whatsappGeneralMessageCreationDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 30 HOUR, '%Y-%m-%d 06:00:00')
      ;`;
      const selectTodayMessagesAmountDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTodayMessagesAmountSQL);
      const result = 
      {
        success: true, 
        result: 
        {
          whatsappTotalConversations: whatsappSelledConversations + whatsappNotSelledConversations + whatsappPendingConversations,
          whatsappSelledConversations: whatsappSelledConversations,
          whatsappNotSelledConversations: whatsappNotSelledConversations,
          whatsappPendingConversations: whatsappPendingConversations,
          whatsappTotalSells: whatsappTotalSells,
          whatsappSendedMessages: selectTodayMessagesAmountDatabaseResult.result[0].whatsappSendedMessages,
          whatsappReceivedMessages: selectTodayMessagesAmountDatabaseResult.result[0].whatsappReceivedMessages
        }
      }
      selectTodayDashboardInformationPromiseResolve(JSON.stringify(result));
    });
  },

  selectAgentNames: async function(){
    return new Promise(async (selectAgentNamesPromiseResolve) => {
      const selectAgentNamesSQL = `SELECT agentName FROM Agents;`;
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentNamesSQL);
      selectAgentNamesPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectFilteredConversations: async function(initialDate, endDate, recipientPhoneNumber, agentName, store, conversation){
    return new Promise(async (selectFilteredConversationsPromiseResolve) => {
      const conditions = [];
            
      if (initialDate != ''){
        initialDate = new Date(initialDate);
        initialDate.setHours(initialDate.getHours() + 6);
        initialDate = initialDate.toString();
        initialDate = initialDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(whatsappConversationStartDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') >= STR_TO_DATE('${initialDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      if (endDate != ''){
        endDate = new Date(endDate);
        endDate.setHours(endDate.getHours() + 6);
        endDate = endDate.toString();
        endDate = endDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(whatsappConversationStartDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') <= STR_TO_DATE('${endDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      if (recipientPhoneNumber != '') conditions.push(`whatsappConversationRecipientPhoneNumber = '${recipientPhoneNumber}'`);
      
      if (agentName != '') conditions.push(`agentName = '${agentName}'`);

      if (store != '') conditions.push(`whatsappConversationRecipientProfileName LIKE '%${store}%'`);
      
      if (conversation == 'Vendido'){
        conditions.push(`whatsappConversationAmount != 0`);
      } else if (conversation == 'No vendido') {
        conditions.push(`whatsappConversationAmount == 0`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      var selectFilteredConversationsSQL = 
      `
      SELECT
        WhatsappConversations.whatsappConversationID,
        WhatsappConversations.whatsappConversationRecipientPhoneNumber,
        WhatsappConversations.whatsappConversationRecipientProfileName,
        WhatsappConversations.whatsappConversationAmount,
        Agents.agentName,
        WhatsappConversations.whatsappConversationStartDateTime
      FROM WhatsappConversations
      LEFT JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
      `;
      var selectFilteredConversationsSQL = selectFilteredConversationsSQL + whereClause;

      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectFilteredConversationsSQL);
      selectFilteredConversationsPromiseResolve(JSON.stringify(databaseResult));
    });
  }
  

}