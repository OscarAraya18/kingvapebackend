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
        Agents.agentID,
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
      
      let currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 6);
      let hourPart = currentDate.toISOString().substring(11, 13);
      let hour = parseInt(hourPart, 10);
      var selectTodayDashboardInformationSQL = '';
      if (hour >= 18){
        selectTodayDashboardInformationSQL = 
        `
        SELECT
          whatsappConversationAmount,
          whatsappConversationRecipientPhoneNumber,
          whatsappConversationAssignedAgentID
        FROM WhatsappConversations
        WHERE 
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%Y-%m-%d 6:00:00')
            AND
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
        ;`;
      } else {
        selectTodayDashboardInformationSQL = 
        `
        SELECT
          whatsappConversationAmount,
          whatsappConversationRecipientPhoneNumber,
          whatsappConversationAssignedAgentID
        FROM WhatsappConversations
        WHERE 
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
        ;`;
      }
      
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
        STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
          AND
        STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
      ;`;
      const selectTodayMessagesAmountDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTodayMessagesAmountSQL);
      
      var temp1 = 0
      var temp2 = 0

      if (selectTodayMessagesAmountDatabaseResult.result[0]){
        temp1 = selectTodayMessagesAmountDatabaseResult.result[0].whatsappSendedMessages;
      }
      if (selectTodayMessagesAmountDatabaseResult.result[0]){
        temp2 = selectTodayMessagesAmountDatabaseResult.result[0].whatsappReceivedMessages;
      }
      
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
          whatsappSendedMessages: temp1,
          whatsappReceivedMessages: temp2
        }
      }
      selectTodayDashboardInformationPromiseResolve(JSON.stringify(result));
    });
  },

  selectAgentNames: async function(){
    return new Promise(async (selectAgentNamesPromiseResolve) => {
      const selectAgentNamesSQL = `SELECT agentName, agentID FROM Agents WHERE agentIsActive=(?) ORDER BY CASE WHEN agentType = 'admin' THEN 1 ELSE 0 END, agentName;`;
      const selectAgentNamesValues = [true];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAgentNamesSQL, selectAgentNamesValues);
      selectAgentNamesPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectTransferableAgentNames: async function(){
    return new Promise(async (selectTransferableAgentNamesPromiseResolve) => {
      const selectTransferableAgentNamesSQL = `SELECT agentName, agentID FROM Agents WHERE agentIsActive=(?) ORDER BY CASE WHEN agentType = 'admin' THEN 1 ELSE 0 END, agentName;`;
      const selectTransferableAgentNamesValues = [true];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTransferableAgentNamesSQL, selectTransferableAgentNamesValues);
      selectTransferableAgentNamesPromiseResolve(JSON.stringify(databaseResult));
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
      
      if (agentName != null) conditions.push(`agentName = '${agentName}'`);

      if (store != '') conditions.push(`whatsappConversationRecipientProfileName LIKE '%${store}%'`);
      
      if (conversation == 'Vendido'){
        conditions.push(`whatsappConversationAmount != 0`);
      } else if (conversation == 'No vendido') {
        conditions.push(`whatsappConversationAmount = 0`);
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
        WhatsappConversations.whatsappConversationStartDateTime,
        WhatsappConversations.whatsappConversationCloseComment,
        WhatsappConversations.whatsappConversationIsActive
      FROM WhatsappConversations
      LEFT JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
      `;
      var selectFilteredConversationsSQL = selectFilteredConversationsSQL + whereClause;      
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectFilteredConversationsSQL);

      selectFilteredConversationsPromiseResolve(JSON.stringify(databaseResult));
    });
  },


  selectRankingFilteredConversations: async function(agentID, initialDate, endDate){
    return new Promise(async (selectRankingFilteredConversationsPromiseResolve) => {
      
      var selectRankingFilteredConversationsSQL = '';

      if (initialDate == '' && endDate == ''){
        let currentDate = new Date();
        currentDate.setHours(currentDate.getHours() - 6);
        let hourPart = currentDate.toISOString().substring(11, 13);
        let hour = parseInt(hourPart, 10);
        var selectTodayDashboardInformationSQL = '';
        if (hour >= 18){
          selectRankingFilteredConversationsSQL = 
          `
          SELECT 
            whatsappConversationID,
            whatsappConversationRecipientPhoneNumber,
            whatsappConversationRecipientProfileName,
            whatsappConversationAmount,
            whatsappConversationStartDateTime,
            whatsappConversationCloseComment
          FROM WhatsappConversations
          WHERE 
            whatsappConversationAssignedAgentID = (?) 
              AND 
            whatsappConversationIsActive = (?)
              AND
            STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%Y-%m-%d 6:00:00')
              AND
            STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
          `;
        } else {
          selectRankingFilteredConversationsSQL = 
          `
          SELECT 
            whatsappConversationID,
            whatsappConversationRecipientPhoneNumber,
            whatsappConversationRecipientProfileName,
            whatsappConversationAmount,
            whatsappConversationStartDateTime,
            whatsappConversationCloseComment
          FROM WhatsappConversations
          WHERE 
            whatsappConversationAssignedAgentID = (?) 
              AND 
            whatsappConversationIsActive = (?)
              AND
              STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
                AND
              STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
          `; 
        }
      } else {
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

        const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

        var selectRankingFilteredConversationsSQL = 
        `
        SELECT 
          whatsappConversationID,
          whatsappConversationRecipientPhoneNumber,
          whatsappConversationRecipientProfileName,
          whatsappConversationAmount,
          whatsappConversationStartDateTime,
          whatsappConversationCloseComment
        FROM WhatsappConversations
        WHERE whatsappConversationAssignedAgentID = (?) AND whatsappConversationIsActive = (?)
        `;
        selectRankingFilteredConversationsSQL = selectRankingFilteredConversationsSQL + whereClause;
      }

      const selectRankingFilteredConversationsValues = [agentID, 0];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectRankingFilteredConversationsSQL, selectRankingFilteredConversationsValues);

      selectRankingFilteredConversationsPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectPlotInformation: async function(plotType, initialDate, endDate, agents, stores){
    return new Promise(async (selectPlotInformationPromiseResolve) => {
      
      const dateConditions = []; 
      if (initialDate != ''){
        initialDate = new Date(initialDate);
        initialDate.setHours(initialDate.getHours() + 6);
        initialDate = initialDate.toISOString();
        dateConditions.push(`STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') >= STR_TO_DATE('${initialDate}', '%Y-%m-%dT%H:%i:%s.%fZ')`);
      }
      if (endDate != ''){
        endDate = new Date(endDate);
        endDate.setHours(endDate.getHours() + 30);
        endDate = endDate.toISOString();
        dateConditions.push(`STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') <= STR_TO_DATE('${endDate}', '%Y-%m-%dT%H:%i:%s.%fZ')`);
      }
      const dateWhereClause = dateConditions.length > 0 ? `AND ${dateConditions.join(' AND ')}` : '';

      const agentConditions = [];
      if (agents.length > 0) {
        agents.forEach(agent => {
          agentConditions.push(`whatsappConversationAssignedAgentID = '${agent}'`);
        });
      }
      const agentWhereClause = agentConditions.length > 0 ? `AND (${agentConditions.join(' OR ')})` : '';

      const storeConditions = [];
      if (stores.length > 0) {
        stores.forEach(store => {
          storeConditions.push(`whatsappConversationRecipientProfileName LIKE '%${store}%'`);
        });
      }
      const storeWhereClause = storeConditions.length > 0 ? `AND (${storeConditions.join(' OR ')})` : '';

      var selectPlotInformationSQL = 
      `
      SELECT
        DATE_FORMAT(STR_TO_DATE(whatsappConversationEndDateTime, '%a %b %d %Y %T GMT+0000'), '%Y-%m-%d') as whatsappConversationDateTime,
        WhatsappConversations.whatsappConversationEndDateTime,
        WhatsappConversations.whatsappConversationID,
        WhatsappConversations.whatsappConversationAmount,
        Agents.agentName
      FROM WhatsappConversations
      LEFT JOIN Agents ON Agents.agentID = WhatsappConversations.whatsappConversationAssignedAgentID
      WHERE whatsappConversationIsActive = (?)
      `;
      selectPlotInformationSQL = selectPlotInformationSQL + dateWhereClause + agentWhereClause + storeWhereClause;
      const selectPlotInformationValues = [false];

      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectPlotInformationSQL, selectPlotInformationValues);
      if (databaseResult.success){
        if (plotType == 1){
          const plotInformation = this.plotBasedOnMoney(databaseResult.result);
          selectPlotInformationPromiseResolve(JSON.stringify(plotInformation));
        } else if (plotType == 2){
          const plotInformation = this.plotBasedOnSelledConversations(databaseResult.result);
          selectPlotInformationPromiseResolve(JSON.stringify(plotInformation));
        } else if (plotType == 3){
          const plotInformation = this.plotBasedOnNotSelledConversations(databaseResult.result);
          selectPlotInformationPromiseResolve(JSON.stringify(plotInformation));
        }
      } else {
        selectPlotInformationPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  selectPlotConnectionInformation: async function(initialDate, endDate, agents){
    return new Promise(async (selectPlotConnectionInformationPromiseResolve) => {
      
      const dateConditions = []; 
      if (initialDate != ''){
        initialDate = new Date(initialDate);
        initialDate.setHours(initialDate.getHours() + 6);
        initialDate = initialDate.toISOString();
        dateConditions.push(`STR_TO_DATE(agentStatusChangeDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') >= STR_TO_DATE('${initialDate}', '%Y-%m-%dT%H:%i:%s.%fZ')`);
      }
      if (endDate != ''){
        endDate = new Date(endDate);
        endDate.setHours(endDate.getHours() + 30);
        endDate = endDate.toISOString();
        dateConditions.push(`STR_TO_DATE(agentStatusChangeDateTime, '%a %b %d %Y %H:%i:%s GMT+0000') <= STR_TO_DATE('${endDate}', '%Y-%m-%dT%H:%i:%s.%fZ')`);
      }
      const dateWhereClause = dateConditions.length > 0 ? `AND ${dateConditions.join(' AND ')}` : '';

      const agentConditions = [];
      if (agents.length > 0) {
        agents.forEach(agent => {
          agentConditions.push(`agentStatusChangeAgentID = '${agent}'`);
        });
      }
      const agentWhereClause = agentConditions.length > 0 ? `AND (${agentConditions.join(' OR ')})` : '';

      var selectPlotInformationSQL = 
      `
      SELECT
        AgentStatusChanges.agentStatusChangeDateTime,
        AgentStatusChanges.agentStatusChangeStatus,
        Agents.agentName
      FROM AgentStatusChanges
      LEFT JOIN Agents ON Agents.agentID = AgentStatusChanges.agentStatusChangeAgentID
      WHERE agentStatusChangeID IS NOT NULL
      `;
      selectPlotInformationSQL = selectPlotInformationSQL + dateWhereClause + agentWhereClause;

      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectPlotInformationSQL);
      if (databaseResult.success){

        const agentData = {};
        databaseResult.result.forEach(entry => {
          const agentName = entry.agentName;
          if (!agentData[agentName]) {
            agentData[agentName] = [];
          }
          agentData[agentName].push({
            x: new Date(entry.agentStatusChangeDateTime).getTime(),
            y: entry.agentStatusChangeStatus == 'online' ? 1 : 0,
          });
        });
        const seriesData = Object.entries(agentData).map(([agentName, agentStatusData]) => ({
          name: agentName,
          data: agentStatusData,
        }));
        selectPlotConnectionInformationPromiseResolve(JSON.stringify({success: true, result: seriesData}));
      } else {
        selectPlotConnectionInformationPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  plotBasedOnMoney: function(databaseResult){
    var datesFiltered = {};
    for (var databaseResultIndex in databaseResult){
      const databaseResultObject = databaseResult[databaseResultIndex];
      const databaseResultWhatsappConversationDateTime = databaseResultObject.whatsappConversationDateTime;
      const databaseResultAgentName = databaseResultObject.agentName;
      const databaseResultWhatsappConversationAmount = databaseResultObject.whatsappConversationAmount;
      if (databaseResultWhatsappConversationDateTime != null){
        if ((databaseResultWhatsappConversationDateTime in datesFiltered)){
          if (databaseResultAgentName in datesFiltered[databaseResultWhatsappConversationDateTime]){
            datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] + databaseResultWhatsappConversationAmount;
          } else {
            datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = databaseResultWhatsappConversationAmount;
          }
        } else {
          datesFiltered[databaseResultWhatsappConversationDateTime] = {};
          datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = databaseResultWhatsappConversationAmount;
        }
      }
    }
    var agentNames = new Set();
    for (var dateFiltered in datesFiltered) {
      Object.keys(datesFiltered[dateFiltered]).forEach(agent => agentNames.add(agent));
    }
    for (var dateFiltered in datesFiltered) {
      agentNames.forEach(agent => {
        if (!datesFiltered[dateFiltered][agent]) {
          datesFiltered[dateFiltered][agent] = 0;
        }
      });
    }
    const datesArray = Object.keys(datesFiltered).sort();
    const agentsArray = Array.from(new Set(Object.values(datesFiltered).flatMap(Object.keys)));
    agentsArray.sort();
    
    var agentsData = agentsArray.map(agent => {
      return {
        name: agent,
        data: datesArray.map(date => datesFiltered[date][agent] || 0)
      };
    });
    const result = {success: true, result: {dates: datesArray, agents: agentsData}};
    return result;
  },

  plotBasedOnSelledConversations: function(databaseResult){
    var datesFiltered = {};
    for (var databaseResultIndex in databaseResult){
      const databaseResultObject = databaseResult[databaseResultIndex];
      const databaseResultWhatsappConversationDateTime = databaseResultObject.whatsappConversationDateTime;
      const databaseResultAgentName = databaseResultObject.agentName;
      const databaseResultWhatsappConversationAmount = databaseResultObject.whatsappConversationAmount;
      if (databaseResultWhatsappConversationDateTime != null){
        if ((databaseResultWhatsappConversationDateTime in datesFiltered)){
          if (databaseResultAgentName in datesFiltered[databaseResultWhatsappConversationDateTime]){
            if (databaseResultWhatsappConversationAmount != 0){
              datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] + 1;
            }
          } else {
            if (databaseResultWhatsappConversationAmount != 0){
              datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = 1;
            } else {
              datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = 0;
            }
          }
        } else {
          datesFiltered[databaseResultWhatsappConversationDateTime] = {};
          if (databaseResultWhatsappConversationAmount != 0){
            datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = 1;
          } else {
            datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = 0;
          }
        }
      }
    }
    var agentNames = new Set();
    for (var dateFiltered in datesFiltered) {
      Object.keys(datesFiltered[dateFiltered]).forEach(agent => agentNames.add(agent));
    }
    for (var dateFiltered in datesFiltered) {
      agentNames.forEach(agent => {
        if (!datesFiltered[dateFiltered][agent]) {
          datesFiltered[dateFiltered][agent] = 0;
        }
      });
    }
    const datesArray = Object.keys(datesFiltered).sort();
    const agentsArray = Array.from(new Set(Object.values(datesFiltered).flatMap(Object.keys)));
    agentsArray.sort();
    
    var agentsData = agentsArray.map(agent => {
      return {
        name: agent,
        data: datesArray.map(date => datesFiltered[date][agent] || 0)
      };
    });
    const result = {success: true, result: {dates: datesArray, agents: agentsData}};
    return result;
  },

  plotBasedOnNotSelledConversations: function(databaseResult){
    var datesFiltered = {};
    for (var databaseResultIndex in databaseResult){
      const databaseResultObject = databaseResult[databaseResultIndex];
      const databaseResultWhatsappConversationDateTime = databaseResultObject.whatsappConversationDateTime;
      const databaseResultAgentName = databaseResultObject.agentName;
      const databaseResultWhatsappConversationAmount = databaseResultObject.whatsappConversationAmount;
      if (databaseResultWhatsappConversationDateTime != null){
        if ((databaseResultWhatsappConversationDateTime in datesFiltered)){
          if (databaseResultAgentName in datesFiltered[databaseResultWhatsappConversationDateTime]){
            if (databaseResultWhatsappConversationAmount == 0){
              datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] + 1;
            }
          } else {
            if (databaseResultWhatsappConversationAmount == 0){
              datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = 1;
            } else {
              datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = 0;
            }
          }
        } else {
          datesFiltered[databaseResultWhatsappConversationDateTime] = {};
          if (databaseResultWhatsappConversationAmount == 0){
            datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = 1;
          } else {
            datesFiltered[databaseResultWhatsappConversationDateTime][databaseResultAgentName] = 0;
          }
        }
      }
    }
    var agentNames = new Set();
    for (var dateFiltered in datesFiltered) {
      Object.keys(datesFiltered[dateFiltered]).forEach(agent => agentNames.add(agent));
    }
    for (var dateFiltered in datesFiltered) {
      agentNames.forEach(agent => {
        if (!datesFiltered[dateFiltered][agent]) {
          datesFiltered[dateFiltered][agent] = 0;
        }
      });
    }
    const datesArray = Object.keys(datesFiltered).sort();
    const agentsArray = Array.from(new Set(Object.values(datesFiltered).flatMap(Object.keys)));
    agentsArray.sort();
    
    var agentsData = agentsArray.map(agent => {
      return {
        name: agent,
        data: datesArray.map(date => datesFiltered[date][agent] || 0)
      };
    });
    const result = {success: true, result: {dates: datesArray, agents: agentsData}};
    return result;
  },



  selectAllWhatsappFavoriteImages: function(){
    return new Promise(async (selectAllWhatsappFavoriteImagesPromiseResolve) => {
      const selectAllWhatsappFavoriteImagesSQL = `SELECT * FROM WhatsappFavoriteImages ORDER BY whatsappFavoriteImageName;`;
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAllWhatsappFavoriteImagesSQL);
      selectAllWhatsappFavoriteImagesPromiseResolve(JSON.stringify(databaseResult));
    });
  },



}