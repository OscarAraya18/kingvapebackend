const constants = require('../constants.js');
const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');

const axios = require('axios');


module.exports = {

  insertWhatsappInvoice: async function(whatsappInvoiceWhatsappConversationID, whatsappInvoiceLocalityID, whatsappInvoiceAgentID, whatsappInvoiceState, whatsappInvoiceCentralDateTime, whatsappInvoiceClientName, whatsappInvoiceClientPhoneNumber, whatsappInvoiceClientLocation, whatsappInvoiceClientLocationURL, whatsappInvoiceAmount, whatsappInvoiceShippingMethod, whatsappInvoicePaymentMethod, whatsappInvoicePaymentState, whatsappInvoiceLocationNote, whatsappInvoiceShippingNote, whatsappInvoiceProducts, whatsappInvoiceIsForToday){
    return new Promise(async (insertWhatsappInvoicePromiseResolve) => {
      const insertWhatsappInvoiceSQL = `INSERT INTO WhatsappInvoices (whatsappInvoiceWhatsappConversationID, whatsappInvoiceLocalityID, whatsappInvoiceAgentID, whatsappInvoiceState, whatsappInvoiceCentralDateTime, whatsappInvoiceClientName, whatsappInvoiceClientPhoneNumber, whatsappInvoiceClientLocation, whatsappInvoiceClientLocationURL, whatsappInvoiceAmount, whatsappInvoiceShippingMethod, whatsappInvoicePaymentMethod, whatsappInvoicePaymentState, whatsappInvoiceLocationNote, whatsappInvoiceShippingNote, whatsappInvoiceProducts, whatsappInvoiceIsForToday) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
      const insertWhatsappInvoiceValues = [whatsappInvoiceWhatsappConversationID, whatsappInvoiceLocalityID, whatsappInvoiceAgentID, whatsappInvoiceState, whatsappInvoiceCentralDateTime, whatsappInvoiceClientName, whatsappInvoiceClientPhoneNumber, JSON.stringify(whatsappInvoiceClientLocation), whatsappInvoiceClientLocationURL, whatsappInvoiceAmount, whatsappInvoiceShippingMethod, whatsappInvoicePaymentMethod, whatsappInvoicePaymentState, whatsappInvoiceLocationNote, whatsappInvoiceShippingNote, JSON.stringify(whatsappInvoiceProducts)];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(insertWhatsappInvoiceSQL, insertWhatsappInvoiceValues);
      insertWhatsappInvoicePromiseResolve(JSON.stringify(databaseResult));      
    });
  },
  
  selectAllActiveWhatsappInvoice: async function(){
    return new Promise(async (selectAllActiveWhatsappInvoicePromiseResolve) => {
      const selectAllActiveWhatsappInvoiceSQL = 
      `
        SELECT
          WhatsappInvoices.whatsappInvoiceID,
          WhatsappInvoices.whatsappInvoiceWhatsappConversationID,
          WhatsappInvoices.whatsappInvoiceLocalityID,
          WhatsappInvoices.whatsappInvoiceAgentID,
          WhatsappInvoices.whatsappInvoiceLocalityAgentID,
          WhatsappInvoices.whatsappInvoiceState,
          WhatsappInvoices.whatsappInvoiceHasBeenBilled,
          WhatsappInvoices.whatsappInvoiceCentralDateTime,
          WhatsappInvoices.whatsappInvoiceLocalityDateTime,
          WhatsappInvoices.whatsappInvoiceShippingDateTime,
          WhatsappInvoices.whatsappInvoiceDeliveredDateTime,
          WhatsappInvoices.whatsappInvoiceClientName,
          WhatsappInvoices.whatsappInvoiceClientPhoneNumber,
          WhatsappInvoices.whatsappInvoiceClientLocation,
          WhatsappInvoices.whatsappInvoiceClientLocationURL,
          WhatsappInvoices.whatsappInvoiceAmount,
          WhatsappInvoices.whatsappInvoiceShippingMethod,
          WhatsappInvoices.whatsappInvoicePaymentMethod,
          WhatsappInvoices.whatsappInvoicePaymentState,
          WhatsappInvoices.whatsappInvoiceLocationNote,
          WhatsappInvoices.whatsappInvoiceShippingNote,
          WhatsappInvoices.whatsappInvoiceProducts,
          WhatsappInvoices.whatsappInvoiceNotShippedReason,
          WhatsappInvoices.whatsappInvoiceHasBeenUpdated,
          WhatsappInvoices.whatsappInvoiceUpdatedField,
          WhatsappInvoices.whatsappInvoiceIsForToday,
          Agents.agentName,
          LocalityAgents.localityAgentName,
          Localities.localityName
        FROM WhatsappInvoices
          LEFT JOIN Agents ON WhatsappInvoices.whatsappInvoiceAgentID = Agents.agentID
          LEFT JOIN LocalityAgents ON WhatsappInvoices.whatsappInvoiceLocalityAgentID = LocalityAgents.localityAgentID
          LEFT JOIN Localities ON WhatsappInvoices.whatsappInvoiceLocalityID = Localities.localityID
        WHERE WhatsappInvoices.whatsappInvoiceState!=(?) AND WhatsappInvoices.whatsappInvoiceState!=(?)
        ORDER BY WhatsappInvoices.whatsappInvoiceID DESC;
      `;
      const selectAllActiveWhatsappInvoiceValues = ['E', 'X'];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAllActiveWhatsappInvoiceSQL, selectAllActiveWhatsappInvoiceValues);
      selectAllActiveWhatsappInvoicePromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  selectAllActiveWhatsappInvoiceFromLocality: async function(localityID){
    return new Promise(async (selectAllActiveWhatsappInvoiceFromLocalityPromiseResolve) => {
      const selectAllActiveWhatsappInvoiceSQL = 
      `
        SELECT
          WhatsappInvoices.whatsappInvoiceID,
          WhatsappInvoices.whatsappInvoiceWhatsappConversationID,
          WhatsappInvoices.whatsappInvoiceLocalityID,
          WhatsappInvoices.whatsappInvoiceAgentID,
          WhatsappInvoices.whatsappInvoiceLocalityAgentID,
          WhatsappInvoices.whatsappInvoiceState,
          WhatsappInvoices.whatsappInvoiceHasBeenBilled,
          WhatsappInvoices.whatsappInvoiceCentralDateTime,
          WhatsappInvoices.whatsappInvoiceLocalityDateTime,
          WhatsappInvoices.whatsappInvoiceShippingDateTime,
          WhatsappInvoices.whatsappInvoiceDeliveredDateTime,
          WhatsappInvoices.whatsappInvoiceClientName,
          WhatsappInvoices.whatsappInvoiceClientPhoneNumber,
          WhatsappInvoices.whatsappInvoiceClientLocation,
          WhatsappInvoices.whatsappInvoiceClientLocationURL,
          WhatsappInvoices.whatsappInvoiceAmount,
          WhatsappInvoices.whatsappInvoiceShippingMethod,
          WhatsappInvoices.whatsappInvoicePaymentMethod,
          WhatsappInvoices.whatsappInvoicePaymentState,
          WhatsappInvoices.whatsappInvoiceLocationNote,
          WhatsappInvoices.whatsappInvoiceShippingNote,
          WhatsappInvoices.whatsappInvoiceProducts,
          WhatsappInvoices.whatsappInvoiceNotShippedReason,
          WhatsappInvoices.whatsappInvoiceHasBeenUpdated,
          WhatsappInvoices.whatsappInvoiceUpdatedField,
          WhatsappInvoices.whatsappInvoiceIsForToday,
          Agents.agentName,
          LocalityAgents.localityAgentName,
          Localities.localityName
        FROM WhatsappInvoices 
        LEFT JOIN Agents ON WhatsappInvoices.whatsappInvoiceAgentID = Agents.agentID
        LEFT JOIN LocalityAgents ON WhatsappInvoices.whatsappInvoiceLocalityAgentID = LocalityAgents.localityAgentID
        LEFT JOIN Localities ON WhatsappInvoices.whatsappInvoiceLocalityID = Localities.localityID
        WHERE WhatsappInvoices.whatsappInvoiceState!=(?) AND WhatsappInvoices.whatsappInvoiceState!=(?) AND WhatsappInvoices.whatsappInvoiceState!=(?) AND WhatsappInvoices.whatsappInvoiceLocalityID=(?)
        ORDER BY WhatsappInvoices.whatsappInvoiceID DESC;
      `;
      const selectAllActiveWhatsappInvoiceValues = ['E', 'X', 'C', localityID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAllActiveWhatsappInvoiceSQL, selectAllActiveWhatsappInvoiceValues);
      selectAllActiveWhatsappInvoiceFromLocalityPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  selectAllActiveWhatsappInvoiceFromLocalityAgent: async function(localityAgentID){
    return new Promise(async (selectAllActiveWhatsappInvoiceFromLocalityAgentPromiseResolve) => {
      const selectAllActiveWhatsappInvoiceFromLocalityAgentSQL = 
      `
      SELECT
        WhatsappInvoices.whatsappInvoiceID,
        WhatsappInvoices.whatsappInvoiceWhatsappConversationID,
        WhatsappInvoices.whatsappInvoiceLocalityID,
        WhatsappInvoices.whatsappInvoiceAgentID,
        WhatsappInvoices.whatsappInvoiceLocalityAgentID,
        WhatsappInvoices.whatsappInvoiceState,
        WhatsappInvoices.whatsappInvoiceHasBeenBilled,
        WhatsappInvoices.whatsappInvoiceCentralDateTime,
        WhatsappInvoices.whatsappInvoiceLocalityDateTime,
        WhatsappInvoices.whatsappInvoiceShippingDateTime,
        WhatsappInvoices.whatsappInvoiceDeliveredDateTime,
        WhatsappInvoices.whatsappInvoiceClientName,
        WhatsappInvoices.whatsappInvoiceClientPhoneNumber,
        WhatsappInvoices.whatsappInvoiceClientLocation,
        WhatsappInvoices.whatsappInvoiceClientLocationURL,
        WhatsappInvoices.whatsappInvoiceAmount,
        WhatsappInvoices.whatsappInvoiceShippingMethod,
        WhatsappInvoices.whatsappInvoicePaymentMethod,
        WhatsappInvoices.whatsappInvoicePaymentState,
        WhatsappInvoices.whatsappInvoiceLocationNote,
        WhatsappInvoices.whatsappInvoiceShippingNote,
        WhatsappInvoices.whatsappInvoiceProducts,
        WhatsappInvoices.whatsappInvoiceNotShippedReason,
        WhatsappInvoices.whatsappInvoiceHasBeenUpdated,
        WhatsappInvoices.whatsappInvoiceUpdatedField,
        WhatsappInvoices.whatsappInvoiceIsForToday,
        Agents.agentName,
        LocalityAgents.localityAgentName,
        Localities.localityName
      FROM WhatsappInvoices 
      LEFT JOIN Agents ON WhatsappInvoices.whatsappInvoiceAgentID = Agents.agentID
      LEFT JOIN LocalityAgents ON WhatsappInvoices.whatsappInvoiceLocalityAgentID = LocalityAgents.localityAgentID
      LEFT JOIN Localities ON WhatsappInvoices.whatsappInvoiceLocalityID = Localities.localityID
      WHERE WhatsappInvoices.whatsappInvoiceState=(?) AND WhatsappInvoices.whatsappInvoiceLocalityAgentID=(?)
      ORDER BY WhatsappInvoices.whatsappInvoiceID DESC;
      `;
      const selectAllActiveWhatsappInvoiceFromLocalityAgentValues = ['R', localityAgentID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAllActiveWhatsappInvoiceFromLocalityAgentSQL, selectAllActiveWhatsappInvoiceFromLocalityAgentValues);
      selectAllActiveWhatsappInvoiceFromLocalityAgentPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceState: async function(whatsappInvoiceID, whatsappInvoiceState, whatsappInvoiceStateDateTime, whatsappInvoiceLocalityID, whatsappInvoiceLocalityAgentID, whatsappInvoiceLocalityAgentBillerID, returnedFromShippingToLocality, whatsappInvoiceNotShippedReason){
    return new Promise(async (updateWhatsappInvoiceStatePromiseResolve) => {
      var updateWhatsappInvoiceStateSQL = '';
      var updateWhatsappInvoiceStateValues = [];
      if (whatsappInvoiceState == 'C'){
        updateWhatsappInvoiceStateSQL = 
        `
        UPDATE WhatsappInvoices 
        SET whatsappInvoiceState=(?), whatsappInvoiceLocalityID=(?), whatsappInvoiceLocalityAgentID=(?), whatsappInvoiceLocalityDateTime=(?), whatsappInvoiceShippingDateTime=(?)
        WHERE whatsappInvoiceID=(?);
        `;
        whatsappInvoiceLocalityAgentID = null;
        const whatsappInvoiceLocalityDateTime = null;
        const whatsappInvoiceShippingDateTime = null;
        updateWhatsappInvoiceStateValues = [whatsappInvoiceState, whatsappInvoiceLocalityID, whatsappInvoiceLocalityAgentID, whatsappInvoiceLocalityDateTime, whatsappInvoiceShippingDateTime, whatsappInvoiceID,];
      } else if (whatsappInvoiceState == 'S'){
        if (returnedFromShippingToLocality){
          updateWhatsappInvoiceStateSQL = 
          `
          UPDATE WhatsappInvoices 
          SET whatsappInvoiceState=(?), whatsappInvoiceLocalityAgentID=(?), whatsappInvoiceShippingDateTime=(?)
          WHERE whatsappInvoiceID=(?);
          `;
          whatsappInvoiceLocalityAgentID = null;
          const whatsappInvoiceShippingDateTime = null;
          updateWhatsappInvoiceStateValues = [whatsappInvoiceState, whatsappInvoiceLocalityAgentID, whatsappInvoiceShippingDateTime, whatsappInvoiceID];
        } else {
          updateWhatsappInvoiceStateSQL = 
          `
          UPDATE WhatsappInvoices 
          SET whatsappInvoiceState=(?), whatsappInvoiceLocalityDateTime=(?), whatsappInvoiceLocalityAgentID=(?), whatsappInvoiceShippingDateTime=(?)
          WHERE whatsappInvoiceID=(?);
          `;
          whatsappInvoiceLocalityAgentID = null;
          const whatsappInvoiceShippingDateTime = null;
          updateWhatsappInvoiceStateValues = [whatsappInvoiceState, whatsappInvoiceStateDateTime, whatsappInvoiceLocalityAgentID, whatsappInvoiceShippingDateTime, whatsappInvoiceID];
        }
      } else if (whatsappInvoiceState == 'R'){
        updateWhatsappInvoiceStateSQL = 
        `
        UPDATE WhatsappInvoices 
        SET whatsappInvoiceState=(?), whatsappInvoiceShippingDateTime=(?), whatsappInvoiceLocalityAgentID=(?), whatsappInvoiceLocalityAgentBillerID=(?)
        WHERE whatsappInvoiceID=(?);
        `;
        updateWhatsappInvoiceStateValues = [whatsappInvoiceState, whatsappInvoiceStateDateTime, whatsappInvoiceLocalityAgentID, whatsappInvoiceLocalityAgentBillerID, whatsappInvoiceID];
      } else if (whatsappInvoiceState == 'E') {
        updateWhatsappInvoiceStateSQL = 
        `
        UPDATE WhatsappInvoices 
        SET whatsappInvoiceState=(?), whatsappInvoiceDeliveredDateTime=(?)
        WHERE whatsappInvoiceID=(?);
        `;
        updateWhatsappInvoiceStateValues = [whatsappInvoiceState, whatsappInvoiceStateDateTime, whatsappInvoiceID];
      } else if (whatsappInvoiceState == 'NE'){
        updateWhatsappInvoiceStateSQL = 
        `
        UPDATE WhatsappInvoices 
        SET whatsappInvoiceState=(?), whatsappInvoiceShippingDateTime=(?), whatsappInvoiceNotShippedReason=(?)
        WHERE whatsappInvoiceID=(?);
        `;
        const whatsappInvoiceShippingDateTime = null;
        updateWhatsappInvoiceStateValues = [whatsappInvoiceState, whatsappInvoiceShippingDateTime, whatsappInvoiceNotShippedReason, whatsappInvoiceID];
      } else if (whatsappInvoiceState == 'X'){
        updateWhatsappInvoiceStateSQL = 
        `
        UPDATE WhatsappInvoices 
        SET whatsappInvoiceState=(?), whatsappInvoiceLocalityAgentID=(?)
        WHERE whatsappInvoiceID=(?);
        `;
        const whatsappInvoiceLocalityAgentID = null;
        updateWhatsappInvoiceStateValues = [whatsappInvoiceState, whatsappInvoiceLocalityAgentID, whatsappInvoiceID];
        const updateWhatsappConversationWhenWhatsappInvoiceCancelledResult = await this.updateWhatsappConversationWhenWhatsappInvoiceCancelled(whatsappInvoiceID);
        if (updateWhatsappConversationWhenWhatsappInvoiceCancelledResult.success == false){
          updateWhatsappInvoiceStatePromiseResolve(JSON.stringify(updateWhatsappConversationWhenWhatsappInvoiceCancelledResult));
        }
      }
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceStateSQL, updateWhatsappInvoiceStateValues);
      updateWhatsappInvoiceStatePromiseResolve(JSON.stringify(databaseResult));      
    });
  },


  updateWhatsappConversationWhenWhatsappInvoiceCancelled: async function(whatsappInvoiceID){
    return new Promise(async (updateWhatsappConversationWhenWhatsappInvoiceCancelledPromiseResolve) => {
      const selectWhatsappConversationID = `SELECT whatsappInvoiceWhatsappConversationID FROM WhatsappInvoices WHERE whatsappInvoiceID=(?);`;
      const selectWhatsappConversationValues = [whatsappInvoiceID];
      const selectWhatsappConversationResult = await databaseManagementFunctions.executeDatabaseSQL(selectWhatsappConversationID, selectWhatsappConversationValues);
      if (selectWhatsappConversationResult.success){
        if (selectWhatsappConversationResult.result[0]){
          const whatsappConversationID = selectWhatsappConversationResult.result[0].whatsappInvoiceWhatsappConversationID;
          const updateWhatsappConversationSQL =  `UPDATE WhatsappConversations SET whatsappConversationCloseComment=(?), whatsappConversationProducts=(?), whatsappConversationAmount=(?) WHERE whatsappConversationID=(?);`;
          const updateWhatsappConversationValues = ['Venta perdida', '[]', 0, whatsappConversationID];
          const updateWhatsappConversationResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappConversationSQL, updateWhatsappConversationValues);
          updateWhatsappConversationWhenWhatsappInvoiceCancelledPromiseResolve(updateWhatsappConversationResult);
        } else {
          updateWhatsappConversationWhenWhatsappInvoiceCancelledPromiseResolve({success: false});
        }
      } else {
        updateWhatsappConversationWhenWhatsappInvoiceCancelledPromiseResolve(selectWhatsappConversationResult);
      }
    });
  },

  updateWhatsappInvoiceHasBeenBilled: async function(whatsappInvoiceID, whatsappInvoiceHasBeenBilled){
    return new Promise(async (updateWhatsappInvoiceHasBeenBilledPromiseResolve) => {
      const updateWhatsappInvoiceHasBeenBilledSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceHasBeenBilled=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceHasBeenBilledValues = [whatsappInvoiceHasBeenBilled, whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceHasBeenBilledSQL, updateWhatsappInvoiceHasBeenBilledValues);
      updateWhatsappInvoiceHasBeenBilledPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceClientName: async function(whatsappInvoiceID, whatsappInvoiceClientName){
    return new Promise(async (updateWhatsappInvoiceClientNamePromiseResolve) => {
      const updateWhatsappInvoiceClientNameSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceClientName=(?), whatsappInvoiceHasBeenUpdated=(?), whatsappInvoiceUpdatedField=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceClientNameValues = [whatsappInvoiceClientName, true, 'whatsappInvoiceClientName', whatsappInvoiceID]
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceClientNameSQL, updateWhatsappInvoiceClientNameValues);
      updateWhatsappInvoiceClientNamePromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceClientPhoneNumber: async function(whatsappInvoiceID, whatsappInvoiceClientPhoneNumber){
    return new Promise(async (updateWhatsappInvoiceClientPhoneNumberPromiseResolve) => {
      const updateWhatsappInvoiceClientPhoneNumberSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceClientPhoneNumber=(?), whatsappInvoiceHasBeenUpdated=(?), whatsappInvoiceUpdatedField=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceClientPhoneNumberValues = [whatsappInvoiceClientPhoneNumber, true, 'whatsappInvoiceClientPhoneNumber', whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceClientPhoneNumberSQL, updateWhatsappInvoiceClientPhoneNumberValues);
      updateWhatsappInvoiceClientPhoneNumberPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceAmount: async function(whatsappInvoiceID, whatsappInvoiceAmount){
    return new Promise(async (updateWhatsappInvoiceAmountPromiseResolve) => {
      const updateWhatsappInvoiceAmountSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceAmount=(?), whatsappInvoiceHasBeenUpdated=(?), whatsappInvoiceUpdatedField=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceAmountValues = [whatsappInvoiceAmount, true, 'whatsappInvoiceAmount', whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceAmountSQL, updateWhatsappInvoiceAmountValues);
      updateWhatsappInvoiceAmountPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceAgentID: async function(whatsappInvoiceID, whatsappInvoiceAgentID){
    return new Promise(async (updateWhatsappInvoiceAgentIDPromiseResolve) => {
      const updateWhatsappInvoiceAgentIDSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceAgentID=(?), whatsappInvoiceHasBeenUpdated=(?), whatsappInvoiceUpdatedField=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceAgentIDValues = [whatsappInvoiceAgentID, true, 'whatsappInvoiceAgentID', whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceAgentIDSQL, updateWhatsappInvoiceAgentIDValues);
      updateWhatsappInvoiceAgentIDPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceLocalityAgentID: async function(whatsappInvoiceID, whatsappInvoiceLocalityAgentID, whatsappInvoiceShippingDateTime){
    return new Promise(async (updateWhatsappInvoiceLocalityAgentIDPromiseResolve) => {
      const updateWhatsappInvoiceLocalityAgentIDSQL = 
      `
      UPDATE WhatsappInvoices 
      SET whatsappInvoiceLocalityAgentID=(?), whatsappInvoiceShippingDateTime=(?)
      WHERE whatsappInvoiceID=(?);
      `;
      const updateWhatsappInvoiceLocalityAgentIDValues = [whatsappInvoiceLocalityAgentID, whatsappInvoiceShippingDateTime, whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceLocalityAgentIDSQL, updateWhatsappInvoiceLocalityAgentIDValues);
      updateWhatsappInvoiceLocalityAgentIDPromiseResolve(JSON.stringify(databaseResult));      
    });
  },


  updateWhatsappConversationLocalityNameWhenWhatsappInvoiceLocalityIDUpdated: async function(whatsappInvoiceID, whatsappConversationLocalityName){
    return new Promise(async (updateWhatsappConversationLocalityNameWhenWhatsappInvoiceLocalityIDUpdatedPromiseResolve) => {
      const selectWhatsappConversationID = `SELECT whatsappInvoiceWhatsappConversationID FROM WhatsappInvoices WHERE whatsappInvoiceID=(?);`;
      const selectWhatsappConversationValues = [whatsappInvoiceID];
      const selectWhatsappConversationResult = await databaseManagementFunctions.executeDatabaseSQL(selectWhatsappConversationID, selectWhatsappConversationValues);
      if (selectWhatsappConversationResult.success){
        if (selectWhatsappConversationResult.result[0]){
          const whatsappConversationID = selectWhatsappConversationResult.result[0].whatsappInvoiceWhatsappConversationID;
          const updateWhatsappConversationSQL =  `UPDATE WhatsappConversations SET whatsappConversationLocalityName=(?) WHERE whatsappConversationID=(?);`;
          const updateWhatsappConversationValues = [whatsappConversationLocalityName, whatsappConversationID];
          const updateWhatsappConversationResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappConversationSQL, updateWhatsappConversationValues);
          updateWhatsappConversationLocalityNameWhenWhatsappInvoiceLocalityIDUpdatedPromiseResolve(updateWhatsappConversationResult);
        } else {
          updateWhatsappConversationLocalityNameWhenWhatsappInvoiceLocalityIDUpdatedPromiseResolve({success: false});
        }
      } else {
        updateWhatsappConversationLocalityNameWhenWhatsappInvoiceLocalityIDUpdatedPromiseResolve(selectWhatsappConversationResult);
      }
    });
  },


  updateWhatsappInvoiceLocalityID: async function(whatsappInvoiceID, whatsappInvoiceLocalityID, whatsappInvoiceLocalityAgentID){
    return new Promise(async (updateWhatsappInvoiceLocalityIDPromiseResolve) => {
      const updateWhatsappConversationLocalityNameWhenWhatsappInvoiceLocalityIDUpdatedResult = await this.updateWhatsappConversationLocalityNameWhenWhatsappInvoiceLocalityIDUpdated(whatsappInvoiceID, whatsappInvoiceLocalityID);
      if (updateWhatsappConversationLocalityNameWhenWhatsappInvoiceLocalityIDUpdatedResult.success){
        const updateWhatsappInvoiceLocalityIDSQL = 
        `
        UPDATE WhatsappInvoices 
        SET whatsappInvoiceLocalityID=(?), whatsappInvoiceLocalityAgentID=(?)
        WHERE whatsappInvoiceID=(?);
        `;
        const updateWhatsappInvoiceLocalityIDValues = [whatsappInvoiceLocalityID, whatsappInvoiceLocalityAgentID, whatsappInvoiceID];
        const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceLocalityIDSQL, updateWhatsappInvoiceLocalityIDValues);
        updateWhatsappInvoiceLocalityIDPromiseResolve(JSON.stringify(databaseResult));
      }
      updateWhatsappInvoiceLocalityIDPromiseResolve(JSON.stringify(updateWhatsappConversationLocalityNameWhenWhatsappInvoiceLocalityIDUpdatedResult));
    });
  },

  updateWhatsappInvoiceShippingMethod: async function(whatsappInvoiceID, whatsappInvoiceShippingMethod, whatsappInvoiceLocalityAgentID){
    return new Promise(async (updateWhatsappInvoiceShippingMethodPromiseResolve) => {
      var updateWhatsappInvoiceShippingMethodSQL = '';
      var updateWhatsappInvoiceShippingMethodValues = [];
      if (whatsappInvoiceShippingMethod != 'Envío por motorizado'){
        updateWhatsappInvoiceShippingMethodSQL = 
        `
        UPDATE WhatsappInvoices 
        SET whatsappInvoiceShippingMethod=(?), whatsappInvoiceLocalityAgentID=(?), whatsappInvoiceHasBeenUpdated=(?), whatsappInvoiceUpdatedField=(?)
        WHERE whatsappInvoiceID=(?);`;
        updateWhatsappInvoiceShippingMethodValues = [whatsappInvoiceShippingMethod, whatsappInvoiceLocalityAgentID, true, 'whatsappInvoiceShippingMethod', whatsappInvoiceID];
      } else {
        updateWhatsappInvoiceShippingMethodSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceShippingMethod=(?) WHERE whatsappInvoiceID=(?);`;
        updateWhatsappInvoiceShippingMethodValues = [whatsappInvoiceShippingMethod, whatsappInvoiceID];
      } 
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceShippingMethodSQL, updateWhatsappInvoiceShippingMethodValues);
      updateWhatsappInvoiceShippingMethodPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoicePaymentMethod: async function(whatsappInvoiceID, whatsappInvoicePaymentMethod){
    return new Promise(async (updateWhatsappInvoicePaymentMethodPromiseResolve) => {
      const updateWhatsappInvoicePaymentMethodSQL = `UPDATE WhatsappInvoices SET whatsappInvoicePaymentMethod=(?), whatsappInvoiceHasBeenUpdated=(?), whatsappInvoiceUpdatedField=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoicePaymentMethodValues = [whatsappInvoicePaymentMethod, true, 'whatsappInvoicePaymentMethod', whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoicePaymentMethodSQL, updateWhatsappInvoicePaymentMethodValues);
      updateWhatsappInvoicePaymentMethodPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoicePaymentState: async function(whatsappInvoiceID, whatsappInvoicePaymentState){ 
    return new Promise(async (updateWhatsappInvoicePaymentStatePromiseResolve) => {
      const updateWhatsappInvoicePaymentStateSQL = `UPDATE WhatsappInvoices SET whatsappInvoicePaymentState=(?), whatsappInvoiceHasBeenUpdated=(?), whatsappInvoiceUpdatedField=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoicePaymentStateValues = [whatsappInvoicePaymentState, true, 'whatsappInvoicePaymentState', whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoicePaymentStateSQL, updateWhatsappInvoicePaymentStateValues);
      updateWhatsappInvoicePaymentStatePromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceClientLocation: async function(whatsappInvoiceID, whatsappInvoiceClientLocation, whatsappInvoiceLocationID){
    return new Promise(async (updateWhatsappInvoiceClientLocationPromiseResolve) => {
      const updateWhatsappInvoiceClientLocationSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceClientLocation=(?), whatsappInvoiceHasBeenUpdated=(?), whatsappInvoiceUpdatedField=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceClientLocationValues = [whatsappInvoiceClientLocation, true, 'whatsappInvoiceClientLocation', whatsappInvoiceID];
      const updateWhatsappInvoiceClientLocationDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceClientLocationSQL, updateWhatsappInvoiceClientLocationValues);
      if (updateWhatsappInvoiceClientLocationDatabaseResult.success){
        const updateWhatsappInvoiceLocationSQL = `UPDATE WhatsappInvoiceLocations SET whatsappInvoiceLocationIsActive=(?) WHERE whatsappInvoiceLocationID=(?);`;
        const whatsappInvoiceLocationIsActive = false;
        const updateWhatsappInvoiceLocationValues = [whatsappInvoiceLocationIsActive, whatsappInvoiceLocationID];
        const updateWhatsappInvoiceLocationDatabaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceLocationSQL, updateWhatsappInvoiceLocationValues);
        updateWhatsappInvoiceClientLocationPromiseResolve(JSON.stringify(updateWhatsappInvoiceLocationDatabaseResult));      
      } else {
        updateWhatsappInvoiceClientLocationPromiseResolve(JSON.stringify(updateWhatsappInvoiceClientLocationDatabaseResult));      
      }
    });
  },

  updateWhatsappInvoiceClientLocationURL: async function(whatsappInvoiceID, whatsappInvoiceClientLocationURL){
    return new Promise(async (updateWhatsappInvoiceClientLocationURLPromiseResolve) => {
      const updateWhatsappInvoiceClientLocationURLSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceClientLocationURL=(?), whatsappInvoiceHasBeenUpdated=(?), whatsappInvoiceUpdatedField=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceClientLocationURLValues = [whatsappInvoiceClientLocationURL, true, 'whatsappInvoiceClientLocationURL', whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceClientLocationURLSQL, updateWhatsappInvoiceClientLocationURLValues);
      updateWhatsappInvoiceClientLocationURLPromiseResolve(JSON.stringify(databaseResult));        
    });
  },

  updateWhatsappInvoiceLocationNote: async function(whatsappInvoiceID, whatsappInvoiceLocationNote){
    return new Promise(async (updateWhatsappInvoiceLocationNotePromiseResolve) => {
      const updateWhatsappInvoiceLocationNoteSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceLocationNote=(?), whatsappInvoiceHasBeenUpdated=(?), whatsappInvoiceUpdatedField=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceLocationNoteValues = [whatsappInvoiceLocationNote, true, 'whatsappInvoiceLocationNote', whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceLocationNoteSQL, updateWhatsappInvoiceLocationNoteValues);
      updateWhatsappInvoiceLocationNotePromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceShippingNote: async function(whatsappInvoiceID, whatsappInvoiceShippingNote){
    return new Promise(async (updateWhatsappInvoiceShippingNotePromiseResolve) => {
      const updateWhatsappInvoiceShippingNoteSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceShippingNote=(?), whatsappInvoiceHasBeenUpdated=(?), whatsappInvoiceUpdatedField=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceShippingNoteValues = [whatsappInvoiceShippingNote, true, 'whatsappInvoiceShippingNote', whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceShippingNoteSQL, updateWhatsappInvoiceShippingNoteValues);
      updateWhatsappInvoiceShippingNotePromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  selectWhatsappInvoiceLocations: async function(){
    return new Promise(async (selectWhatsappInvoiceLocationsPromiseResolve) => {
      const selectWhatsappInvoiceLocationsSQL = `SELECT whatsappInvoiceLocationID, whatsappInvoiceLocationName, whatsappInvoiceLocationLocation FROM WhatsappInvoiceLocations WHERE whatsappInvoiceLocationIsActive=(?);`;
      const whatsappInvoiceLocationIsActive = true;
      const selectWhatsappInvoiceLocationsValues = [whatsappInvoiceLocationIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectWhatsappInvoiceLocationsSQL, selectWhatsappInvoiceLocationsValues);
      selectWhatsappInvoiceLocationsPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  insertWhatsappInvoiceLocation: async function(whatsappInvoiceLocationName, whatsappInvoiceLocationLocation){
    return new Promise(async (insertWhatsappInvoiceLocationPromiseResolve) => {
      const insertWhatsappInvoiceLocationSQL = `INSERT INTO WhatsappInvoiceLocations (whatsappInvoiceLocationName, whatsappInvoiceLocationLocation) VALUES (?,?);`;
      const insertWhatsappInvoiceLocationValues = [whatsappInvoiceLocationName, JSON.stringify(whatsappInvoiceLocationLocation)];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(insertWhatsappInvoiceLocationSQL, insertWhatsappInvoiceLocationValues);
      insertWhatsappInvoiceLocationPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  selectLocalityAgentNames: async function(localityAgentLocalityID){
    return new Promise(async (selectLocalityAgentNamesPromiseResolve) => {
      const selectLocalityAgentNamesSQL = `SELECT * FROM LocalityAgents WHERE localityAgentLocalityID=(?);`;
      const selectLocalityAgentNamesValues = [localityAgentLocalityID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectLocalityAgentNamesSQL, selectLocalityAgentNamesValues);
      selectLocalityAgentNamesPromiseResolve(JSON.stringify(databaseResult));      
    });
  },


  localityAgentLogin: async function(localityAgentUsername, localityAgentPassword){
    return new Promise(async (localityAgentLoginPromiseResolve) => {
      const localityAgentLoginSQL = `SELECT * FROM LocalityAgents WHERE localityAgentUsername=(?) AND localityAgentPassword=(?) AND localityAgentType=(?) AND localityAgentIsActive=(?)`;
      const localityAgentType = 'Mensajero';
      const localityAgentIsActive = true;
      const localityAgentLoginValues = [localityAgentUsername, localityAgentPassword, localityAgentType, localityAgentIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(localityAgentLoginSQL, localityAgentLoginValues);
      if (databaseResult.success){
        if (databaseResult.result.length == 0){
          const localityAgentLoginResult = {success: false};
          localityAgentLoginPromiseResolve(JSON.stringify(localityAgentLoginResult));
        } else {
          const localityAgentID = databaseResult.result[0].localityAgentID;
          const localityAgentLocalityID = databaseResult.result[0].localityAgentLocalityID;
          const localityAgentName = databaseResult.result[0].localityAgentName;
          const localityAgentColor = databaseResult.result[0].localityAgentColor;

          const localityAgentLoginResult = 
          {
            success: true,
            result: 
            {
              'localityAgentID': localityAgentID,
              'localityAgentLocalityID': localityAgentLocalityID,
              'localityAgentName': localityAgentName,
              'localityAgentColor': localityAgentColor
            }
          };
          localityAgentLoginPromiseResolve(JSON.stringify(localityAgentLoginResult));
        }
      } else {
        localityAgentLoginPromiseResolve(JSON.stringify(databaseResult));      
      }
    });
  },

  selectTodayLocalityAgentShippedInvoices: async function(whatsappInvoiceLocalityAgentID){
    return new Promise(async (selectTodayLocalityAgentShippedInvoicesPromiseResolve) => {
      var selectTodayLocalityAgentShippedInvoicesSQL = '';
      let currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 6);
      let hourPart = currentDate.toISOString().substring(11, 13);
      let hour = parseInt(hourPart, 10);
      if (hour >= 18){
        selectTodayLocalityAgentShippedInvoicesSQL = 
        `
        SELECT 
          COUNT(whatsappInvoiceID) as result
        FROM WhatsappInvoices
        WHERE 
          whatsappInvoiceState = (?) 
            AND 
          whatsappInvoiceLocalityAgentID = (?)
            AND
          STR_TO_DATE(whatsappInvoiceDeliveredDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappInvoiceDeliveredDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
        `;
      } else {
        selectTodayLocalityAgentShippedInvoicesSQL = 
        `
        SELECT 
          COUNT(whatsappInvoiceID) as result
        FROM WhatsappInvoices
        WHERE 
          whatsappInvoiceState = (?) 
            AND 
          whatsappInvoiceLocalityAgentID = (?)
            AND
          STR_TO_DATE(whatsappInvoiceDeliveredDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappInvoiceDeliveredDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
        `; 
      }
      const selectTodayLocalityAgentShippedInvoicesValues = ['E', whatsappInvoiceLocalityAgentID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTodayLocalityAgentShippedInvoicesSQL, selectTodayLocalityAgentShippedInvoicesValues);
      selectTodayLocalityAgentShippedInvoicesPromiseResolve(JSON.stringify(databaseResult));      
    });
  },


  selectTodayDeliveredInvoicesByLocality: async function(whatsappInvoiceLocalityID){
    return new Promise(async (selectTodayDeliveredInvoicesByLocalityPromiseResolve) => {
      var selectTodayDeliveredInvoicesByLocalitySQL = '';
      let currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 6);
      let hourPart = currentDate.toISOString().substring(11, 13);
      let hour = parseInt(hourPart, 10);
      if (hour >= 18){
        selectTodayDeliveredInvoicesByLocalitySQL = 
        `
        SELECT
          WhatsappInvoices.whatsappInvoiceID,
          WhatsappInvoices.whatsappInvoiceWhatsappConversationID,
          WhatsappInvoices.whatsappInvoiceLocalityID,
          WhatsappInvoices.whatsappInvoiceAgentID,
          WhatsappInvoices.whatsappInvoiceLocalityAgentID,
          WhatsappInvoices.whatsappInvoiceState,
          WhatsappInvoices.whatsappInvoiceCentralDateTime,
          WhatsappInvoices.whatsappInvoiceLocalityDateTime,
          WhatsappInvoices.whatsappInvoiceShippingDateTime,
          WhatsappInvoices.whatsappInvoiceDeliveredDateTime,
          WhatsappInvoices.whatsappInvoiceClientName,
          WhatsappInvoices.whatsappInvoiceClientPhoneNumber,
          WhatsappInvoices.whatsappInvoiceClientLocation,
          WhatsappInvoices.whatsappInvoiceClientLocationURL,
          WhatsappInvoices.whatsappInvoiceAmount,
          WhatsappInvoices.whatsappInvoiceShippingMethod,
          WhatsappInvoices.whatsappInvoicePaymentMethod,
          WhatsappInvoices.whatsappInvoicePaymentState,
          WhatsappInvoices.whatsappInvoiceLocationNote,
          WhatsappInvoices.whatsappInvoiceShippingNote,
          WhatsappInvoices.whatsappInvoiceProducts,
          WhatsappInvoices.whatsappInvoiceNotShippedReason,
          WhatsappInvoices.whatsappInvoiceHasBeenUpdated,
          WhatsappInvoices.whatsappInvoiceUpdatedField,
          Agents.agentName,
          LocalityAgents.localityAgentName,
          Localities.localityName
        FROM WhatsappInvoices
          LEFT JOIN Agents ON WhatsappInvoices.whatsappInvoiceAgentID = Agents.agentID
          LEFT JOIN LocalityAgents ON WhatsappInvoices.whatsappInvoiceLocalityAgentID = LocalityAgents.localityAgentID
          LEFT JOIN Localities ON WhatsappInvoices.whatsappInvoiceLocalityID = Localities.localityID
        WHERE 
          WhatsappInvoices.whatsappInvoiceState=(?)
            AND
          WhatsappInvoices.whatsappInvoiceLocalityID=(?)
            AND 
          STR_TO_DATE(whatsappInvoiceDeliveredDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappInvoiceDeliveredDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
        ORDER BY WhatsappInvoices.whatsappInvoiceID DESC;
        `;
      } else {
        selectTodayDeliveredInvoicesByLocalitySQL = 
        `
        SELECT
          WhatsappInvoices.whatsappInvoiceID,
          WhatsappInvoices.whatsappInvoiceWhatsappConversationID,
          WhatsappInvoices.whatsappInvoiceLocalityID,
          WhatsappInvoices.whatsappInvoiceAgentID,
          WhatsappInvoices.whatsappInvoiceLocalityAgentID,
          WhatsappInvoices.whatsappInvoiceState,
          WhatsappInvoices.whatsappInvoiceCentralDateTime,
          WhatsappInvoices.whatsappInvoiceLocalityDateTime,
          WhatsappInvoices.whatsappInvoiceShippingDateTime,
          WhatsappInvoices.whatsappInvoiceDeliveredDateTime,
          WhatsappInvoices.whatsappInvoiceClientName,
          WhatsappInvoices.whatsappInvoiceClientPhoneNumber,
          WhatsappInvoices.whatsappInvoiceClientLocation,
          WhatsappInvoices.whatsappInvoiceClientLocationURL,
          WhatsappInvoices.whatsappInvoiceAmount,
          WhatsappInvoices.whatsappInvoiceShippingMethod,
          WhatsappInvoices.whatsappInvoicePaymentMethod,
          WhatsappInvoices.whatsappInvoicePaymentState,
          WhatsappInvoices.whatsappInvoiceLocationNote,
          WhatsappInvoices.whatsappInvoiceShippingNote,
          WhatsappInvoices.whatsappInvoiceProducts,
          WhatsappInvoices.whatsappInvoiceNotShippedReason,
          WhatsappInvoices.whatsappInvoiceHasBeenUpdated,
          WhatsappInvoices.whatsappInvoiceUpdatedField,
          Agents.agentName,
          LocalityAgents.localityAgentName,
          Localities.localityName
        FROM WhatsappInvoices
          LEFT JOIN Agents ON WhatsappInvoices.whatsappInvoiceAgentID = Agents.agentID
          LEFT JOIN LocalityAgents ON WhatsappInvoices.whatsappInvoiceLocalityAgentID = LocalityAgents.localityAgentID
          LEFT JOIN Localities ON WhatsappInvoices.whatsappInvoiceLocalityID = Localities.localityID
        WHERE 
          WhatsappInvoices.whatsappInvoiceState=(?)
            AND
          WhatsappInvoices.whatsappInvoiceLocalityID=(?) 
            AND 
          STR_TO_DATE(whatsappInvoiceDeliveredDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappInvoiceDeliveredDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
        ORDER BY WhatsappInvoices.whatsappInvoiceID DESC;
        `; 
      }
      const selectTodayDeliveredInvoicesByLocalityValues = ['E', whatsappInvoiceLocalityID, whatsappInvoiceLocalityID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTodayDeliveredInvoicesByLocalitySQL, selectTodayDeliveredInvoicesByLocalityValues);
      selectTodayDeliveredInvoicesByLocalityPromiseResolve(JSON.stringify(databaseResult));      
    });
  },


  selectTodayCanceledInvoicesByLocality: async function(whatsappInvoiceLocalityID){
    return new Promise(async (selectTodayCanceledInvoicesByLocalityPromiseResolve) => {
      var selectTodayCanceledInvoicesByLocalitySQL = '';
      let currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 6);
      let hourPart = currentDate.toISOString().substring(11, 13);
      let hour = parseInt(hourPart, 10);
      if (hour >= 18){
        selectTodayCanceledInvoicesByLocalitySQL = 
        `
        SELECT
          WhatsappInvoices.whatsappInvoiceID,
          WhatsappInvoices.whatsappInvoiceWhatsappConversationID,
          WhatsappInvoices.whatsappInvoiceLocalityID,
          WhatsappInvoices.whatsappInvoiceAgentID,
          WhatsappInvoices.whatsappInvoiceLocalityAgentID,
          WhatsappInvoices.whatsappInvoiceState,
          WhatsappInvoices.whatsappInvoiceCentralDateTime,
          WhatsappInvoices.whatsappInvoiceLocalityDateTime,
          WhatsappInvoices.whatsappInvoiceShippingDateTime,
          WhatsappInvoices.whatsappInvoiceDeliveredDateTime,
          WhatsappInvoices.whatsappInvoiceClientName,
          WhatsappInvoices.whatsappInvoiceClientPhoneNumber,
          WhatsappInvoices.whatsappInvoiceClientLocation,
          WhatsappInvoices.whatsappInvoiceClientLocationURL,
          WhatsappInvoices.whatsappInvoiceAmount,
          WhatsappInvoices.whatsappInvoiceShippingMethod,
          WhatsappInvoices.whatsappInvoicePaymentMethod,
          WhatsappInvoices.whatsappInvoicePaymentState,
          WhatsappInvoices.whatsappInvoiceLocationNote,
          WhatsappInvoices.whatsappInvoiceShippingNote,
          WhatsappInvoices.whatsappInvoiceProducts,
          WhatsappInvoices.whatsappInvoiceNotShippedReason,
          WhatsappInvoices.whatsappInvoiceHasBeenUpdated,
          WhatsappInvoices.whatsappInvoiceUpdatedField,
          Agents.agentName,
          LocalityAgents.localityAgentName,
          Localities.localityName
        FROM WhatsappInvoices
          LEFT JOIN Agents ON WhatsappInvoices.whatsappInvoiceAgentID = Agents.agentID
          LEFT JOIN LocalityAgents ON WhatsappInvoices.whatsappInvoiceLocalityAgentID = LocalityAgents.localityAgentID
          LEFT JOIN Localities ON WhatsappInvoices.whatsappInvoiceLocalityID = Localities.localityID
        WHERE 
          WhatsappInvoices.whatsappInvoiceState=(?)
            AND
          WhatsappInvoices.whatsappInvoiceLocalityID=(?) 
            AND 
          STR_TO_DATE(whatsappInvoiceCentralDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappInvoiceCentralDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
        ORDER BY WhatsappInvoices.whatsappInvoiceID DESC;
        `;
      } else {
        selectTodayCanceledInvoicesByLocalitySQL = 
        `
        SELECT
          WhatsappInvoices.whatsappInvoiceID,
          WhatsappInvoices.whatsappInvoiceWhatsappConversationID,
          WhatsappInvoices.whatsappInvoiceLocalityID,
          WhatsappInvoices.whatsappInvoiceAgentID,
          WhatsappInvoices.whatsappInvoiceLocalityAgentID,
          WhatsappInvoices.whatsappInvoiceState,
          WhatsappInvoices.whatsappInvoiceCentralDateTime,
          WhatsappInvoices.whatsappInvoiceLocalityDateTime,
          WhatsappInvoices.whatsappInvoiceShippingDateTime,
          WhatsappInvoices.whatsappInvoiceDeliveredDateTime,
          WhatsappInvoices.whatsappInvoiceClientName,
          WhatsappInvoices.whatsappInvoiceClientPhoneNumber,
          WhatsappInvoices.whatsappInvoiceClientLocation,
          WhatsappInvoices.whatsappInvoiceClientLocationURL,
          WhatsappInvoices.whatsappInvoiceAmount,
          WhatsappInvoices.whatsappInvoiceShippingMethod,
          WhatsappInvoices.whatsappInvoicePaymentMethod,
          WhatsappInvoices.whatsappInvoicePaymentState,
          WhatsappInvoices.whatsappInvoiceLocationNote,
          WhatsappInvoices.whatsappInvoiceShippingNote,
          WhatsappInvoices.whatsappInvoiceProducts,
          WhatsappInvoices.whatsappInvoiceNotShippedReason,
          WhatsappInvoices.whatsappInvoiceHasBeenUpdated,
          WhatsappInvoices.whatsappInvoiceUpdatedField,
          Agents.agentName,
          LocalityAgents.localityAgentName,
          Localities.localityName
        FROM WhatsappInvoices
          LEFT JOIN Agents ON WhatsappInvoices.whatsappInvoiceAgentID = Agents.agentID
          LEFT JOIN LocalityAgents ON WhatsappInvoices.whatsappInvoiceLocalityAgentID = LocalityAgents.localityAgentID
          LEFT JOIN Localities ON WhatsappInvoices.whatsappInvoiceLocalityID = Localities.localityID
        WHERE 
          WhatsappInvoices.whatsappInvoiceState=(?)
            AND
          WhatsappInvoices.whatsappInvoiceLocalityID=(?)  
            AND 
          STR_TO_DATE(whatsappInvoiceCentralDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappInvoiceCentralDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
        ORDER BY WhatsappInvoices.whatsappInvoiceID DESC;
        `; 
      }
      const selectTodayCanceledInvoicesByLocalityValues = ['X', whatsappInvoiceLocalityID, whatsappInvoiceLocalityID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTodayCanceledInvoicesByLocalitySQL, selectTodayCanceledInvoicesByLocalityValues);
      selectTodayCanceledInvoicesByLocalityPromiseResolve(JSON.stringify(databaseResult));      
    });
  },


  selectTodayInvoicesByLocalityAgent: async function(whatsappInvoiceLocalityID){
    return new Promise(async (selectTodayInvoicesByLocalityAgentPromiseResolve) => {
      var selectTodayInvoicesByLocalityAgentSQL = '';
      let currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 6);
      let hourPart = currentDate.toISOString().substring(11, 13);
      let hour = parseInt(hourPart, 10);
      if (hour >= 18){
        selectTodayInvoicesByLocalityAgentSQL = 
        `
        SELECT
          WhatsappInvoices.whatsappInvoiceID,
          WhatsappInvoices.whatsappInvoiceWhatsappConversationID,
          WhatsappInvoices.whatsappInvoiceLocalityID,
          WhatsappInvoices.whatsappInvoiceAgentID,
          WhatsappInvoices.whatsappInvoiceLocalityAgentID,
          WhatsappInvoices.whatsappInvoiceState,
          WhatsappInvoices.whatsappInvoiceCentralDateTime,
          WhatsappInvoices.whatsappInvoiceLocalityDateTime,
          WhatsappInvoices.whatsappInvoiceShippingDateTime,
          WhatsappInvoices.whatsappInvoiceDeliveredDateTime,
          WhatsappInvoices.whatsappInvoiceClientName,
          WhatsappInvoices.whatsappInvoiceClientPhoneNumber,
          WhatsappInvoices.whatsappInvoiceClientLocation,
          WhatsappInvoices.whatsappInvoiceClientLocationURL,
          WhatsappInvoices.whatsappInvoiceAmount,
          WhatsappInvoices.whatsappInvoiceShippingMethod,
          WhatsappInvoices.whatsappInvoicePaymentMethod,
          WhatsappInvoices.whatsappInvoicePaymentState,
          WhatsappInvoices.whatsappInvoiceLocationNote,
          WhatsappInvoices.whatsappInvoiceShippingNote,
          WhatsappInvoices.whatsappInvoiceProducts,
          WhatsappInvoices.whatsappInvoiceNotShippedReason,
          WhatsappInvoices.whatsappInvoiceHasBeenUpdated,
          WhatsappInvoices.whatsappInvoiceUpdatedField,
          Agents.agentName,
          LocalityAgents.localityAgentName,
          Localities.localityName
        FROM WhatsappInvoices
          LEFT JOIN Agents ON WhatsappInvoices.whatsappInvoiceAgentID = Agents.agentID
          LEFT JOIN LocalityAgents ON WhatsappInvoices.whatsappInvoiceLocalityAgentID = LocalityAgents.localityAgentID
          LEFT JOIN Localities ON WhatsappInvoices.whatsappInvoiceLocalityID = Localities.localityID
        WHERE 
          (WhatsappInvoices.whatsappInvoiceState=(?) OR WhatsappInvoices.whatsappInvoiceState=(?))
            AND 
          WhatsappInvoices.whatsappInvoiceLocalityID=(?)
            AND
          STR_TO_DATE(whatsappInvoiceCentralDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappInvoiceCentralDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
        ORDER BY WhatsappInvoices.whatsappInvoiceID DESC;
        `;
      } else {
        selectTodayInvoicesByLocalityAgentSQL = 
        `
        SELECT
          WhatsappInvoices.whatsappInvoiceID,
          WhatsappInvoices.whatsappInvoiceWhatsappConversationID,
          WhatsappInvoices.whatsappInvoiceLocalityID,
          WhatsappInvoices.whatsappInvoiceAgentID,
          WhatsappInvoices.whatsappInvoiceLocalityAgentID,
          WhatsappInvoices.whatsappInvoiceState,
          WhatsappInvoices.whatsappInvoiceCentralDateTime,
          WhatsappInvoices.whatsappInvoiceLocalityDateTime,
          WhatsappInvoices.whatsappInvoiceShippingDateTime,
          WhatsappInvoices.whatsappInvoiceDeliveredDateTime,
          WhatsappInvoices.whatsappInvoiceClientName,
          WhatsappInvoices.whatsappInvoiceClientPhoneNumber,
          WhatsappInvoices.whatsappInvoiceClientLocation,
          WhatsappInvoices.whatsappInvoiceClientLocationURL,
          WhatsappInvoices.whatsappInvoiceAmount,
          WhatsappInvoices.whatsappInvoiceShippingMethod,
          WhatsappInvoices.whatsappInvoicePaymentMethod,
          WhatsappInvoices.whatsappInvoicePaymentState,
          WhatsappInvoices.whatsappInvoiceLocationNote,
          WhatsappInvoices.whatsappInvoiceShippingNote,
          WhatsappInvoices.whatsappInvoiceProducts,
          WhatsappInvoices.whatsappInvoiceNotShippedReason,
          WhatsappInvoices.whatsappInvoiceHasBeenUpdated,
          WhatsappInvoices.whatsappInvoiceUpdatedField,
          Agents.agentName,
          LocalityAgents.localityAgentName,
          Localities.localityName
        FROM WhatsappInvoices
          LEFT JOIN Agents ON WhatsappInvoices.whatsappInvoiceAgentID = Agents.agentID
          LEFT JOIN LocalityAgents ON WhatsappInvoices.whatsappInvoiceLocalityAgentID = LocalityAgents.localityAgentID
          LEFT JOIN Localities ON WhatsappInvoices.whatsappInvoiceLocalityID = Localities.localityID
        WHERE 
          (WhatsappInvoices.whatsappInvoiceState=(?) OR WhatsappInvoices.whatsappInvoiceState=(?))
            AND 
          WhatsappInvoices.whatsappInvoiceLocalityID=(?)
            AND
          STR_TO_DATE(whatsappInvoiceCentralDateTime, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
            AND
          STR_TO_DATE(whatsappInvoiceCentralDateTime, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
        ORDER BY WhatsappInvoices.whatsappInvoiceID DESC;
        `; 
      }
      const selectTodayInvoicesByLocalityAgentValues = ['R', 'E', whatsappInvoiceLocalityID, whatsappInvoiceLocalityID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectTodayInvoicesByLocalityAgentSQL, selectTodayInvoicesByLocalityAgentValues);
      selectTodayInvoicesByLocalityAgentPromiseResolve(JSON.stringify(databaseResult));      
    });
  },


  insertLocalityAgentLocation: async function(localityAgentLocationLocalityAgentID, localityAgentLocationLatitude, localityAgentLocationLongitude){
    return new Promise(async (insertLocalityAgentLocationPromiseResolve) => {
      const countLocalityAgentLocationsSQL = `SELECT COUNT(*) AS localityAgentLocationsAmount FROM LocalityAgentLocations WHERE localityAgentLocationLocalityAgentID = (?);`;
      const countLocalityAgentLocationsValues = [localityAgentLocationLocalityAgentID];
      const countLocalityAgentLocationsResult = await databaseManagementFunctions.executeDatabaseSQL(countLocalityAgentLocationsSQL, countLocalityAgentLocationsValues);
      if (countLocalityAgentLocationsResult.success){
        if (countLocalityAgentLocationsResult.result[0]){
          const localityAgentLocationsAmount = countLocalityAgentLocationsResult.result[0].localityAgentLocationsAmount;
          if (localityAgentLocationsAmount >= 250){
            const deleteOldestLocalityAgentLocationSQL = 
            `
            DELETE FROM LocalityAgentLocations 
            WHERE localityAgentLocationLocalityAgentID=(?)
            ORDER BY localityAgentLocationID ASC
            LIMIT 1;
            `;
            const deleteOldestLocalityAgentLocationValues = [localityAgentLocationLocalityAgentID];
            const deleteOldestLocalityAgentLocationResult = await databaseManagementFunctions.executeDatabaseSQL(deleteOldestLocalityAgentLocationSQL, deleteOldestLocalityAgentLocationValues);
            if (deleteOldestLocalityAgentLocationResult.success){
              const insertLocalityAgentLocationSQL = `INSERT INTO LocalityAgentLocations (localityAgentLocationLocalityAgentID, localityAgentLocationLatitude, localityAgentLocationLongitude, localityAgentLocationDateTime) VALUES (?,?,?,?);`;
              const localityAgentLocationDateTime = new Date().toString();
              const insertLocalityAgentLocationValues = [localityAgentLocationLocalityAgentID, localityAgentLocationLatitude, localityAgentLocationLongitude, localityAgentLocationDateTime];
              const insertLocalityAgentLocationResult = await databaseManagementFunctions.executeDatabaseSQL(insertLocalityAgentLocationSQL, insertLocalityAgentLocationValues);
              insertLocalityAgentLocationPromiseResolve(JSON.stringify(insertLocalityAgentLocationResult));      
            } else {
              insertLocalityAgentLocationPromiseResolve(JSON.stringify(deleteOldestLocalityAgentLocationResult));      
            }
          } else {
            const insertLocalityAgentLocationSQL = `INSERT INTO LocalityAgentLocations (localityAgentLocationLocalityAgentID, localityAgentLocationLatitude, localityAgentLocationLongitude, localityAgentLocationDateTime) VALUES (?,?,?,?);`;
            const localityAgentLocationDateTime = new Date().toString();
            const insertLocalityAgentLocationValues = [localityAgentLocationLocalityAgentID, localityAgentLocationLatitude, localityAgentLocationLongitude, localityAgentLocationDateTime];
            const insertLocalityAgentLocationResult = await databaseManagementFunctions.executeDatabaseSQL(insertLocalityAgentLocationSQL, insertLocalityAgentLocationValues);
            insertLocalityAgentLocationPromiseResolve(JSON.stringify(insertLocalityAgentLocationResult));      
          }
        } else {
          insertLocalityAgentLocationPromiseResolve(JSON.stringify({success: false}));      
        }
      } else {
        insertLocalityAgentLocationPromiseResolve(JSON.stringify(countLocalityAgentLocationsResult));      
      }
    });
  },



  









   
  returnWhatsappConversation: async function(whatsappConversationRecipientPhoneNumber, whatsappConversationID, whatsappInvoiceID){
    return new Promise(async (returnWhatsappConversationPromiseResolve) => {
      const selectWhatsappActiveConversationByPhoneNumberSQL = `SELECT whatsappConversationID FROM WhatsappConversations WHERE whatsappConversationRecipientPhoneNumber=(?) AND whatsappConversationIsActive=(?);`;
      const selectWhatsappActiveConversationByPhoneNumberValues = [whatsappConversationRecipientPhoneNumber, true];
      const selectWhatsappActiveConversationByPhoneNumberResult = await databaseManagementFunctions.executeDatabaseSQL(selectWhatsappActiveConversationByPhoneNumberSQL, selectWhatsappActiveConversationByPhoneNumberValues);
      if (selectWhatsappActiveConversationByPhoneNumberResult.success){
        if (selectWhatsappActiveConversationByPhoneNumberResult.result.length == 0){
          const deleteWhatsappInvoiceSQL = `DELETE FROM WhatsappInvoices WHERE whatsappInvoiceID=(?);`;
          const deleteWhatsappInvoiceValues = [whatsappInvoiceID];
          const deleteWhatsappInvoiceResult = await databaseManagementFunctions.executeDatabaseSQL(deleteWhatsappInvoiceSQL, deleteWhatsappInvoiceValues);
          if (deleteWhatsappInvoiceResult.success){
            const updateWhatsappConversationSQL =  `UPDATE WhatsappConversations SET whatsappConversationIsActive=(?), whatsappConversationCloseComment=(?), whatsappConversationProducts=(?), whatsappConversationLocalityName=(?), whatsappConversationAmount=(?) WHERE whatsappConversationID=(?);`;
            const updateWhatsappConversationValues = [true, '', '[]', null, 0, whatsappConversationID];
            const updateWhatsappConversationResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappConversationSQL, updateWhatsappConversationValues);
            if (updateWhatsappConversationResult.success){
              returnWhatsappConversationPromiseResolve(JSON.stringify(updateWhatsappConversationResult));
            } else {
              returnWhatsappConversationPromiseResolve(JSON.stringify({success: false, result: 4}));
            }
          } else {
            returnWhatsappConversationPromiseResolve(JSON.stringify({success: false, result: 3}));
          }
        } else {
          returnWhatsappConversationPromiseResolve(JSON.stringify({success: false, result: 2}));
        }
      } else {
        returnWhatsappConversationPromiseResolve(JSON.stringify({success: false, result: 1}));
      }
    });
  },
  
  

}