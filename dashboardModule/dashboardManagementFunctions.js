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
        STR_TO_DATE(whatsappConversationStartDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_SUB(CURDATE(), INTERVAL 100 HOUR)
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
        STR_TO_DATE(whatsappGeneralMessageCreationDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_SUB(CURDATE(), INTERVAL 100 HOUR)
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

  /*
  selectTodayDashboardReport: async function(){
    return new Promise(async (selectTodayDashboardReportPromiseResolve) => {
      const selectTodayDashboardReportSQL = 
      `
      SELECT 
        Agents.agentName,
        WhatsappConversations.whatsappConversationAmount, 
        WhatsappConversations.whatsappConversationRecipientPhoneNumber
      FROM WhatsappConversations
      JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
      WHERE 
        STR_TO_DATE(whatsappConversationStartDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_SUB(CURDATE(), INTERVAL 100 HOUR)
      ;`;
      const selectTodayDashboardReportDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTodayDashboardReportSQL);
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
        STR_TO_DATE(whatsappGeneralMessageCreationDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_SUB(CURDATE(), INTERVAL 100 HOUR)
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
  */

  selectAgentNames: async function(){
    return new Promise(async (selectAgentNamesPromiseResolve) => {
      const selectAgentNamesSQL = `SELECT agentName FROM Agents;`;
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentNamesSQL);
      selectAgentNamesPromiseResolve(JSON.stringify(databaseResult));
    });
  },
  

}