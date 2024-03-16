const constants = require('../constants.js');
const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');

const axios = require('axios');


module.exports = {
  
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
          WhatsappInvoices.whatsappInvoiceCentralDateTime,
          WhatsappInvoices.whatsappInvoiceLocalityDateTime,
          WhatsappInvoices.whatsappInvoiceShippingDateTime,
          WhatsappInvoices.whatsappInvoiceDeliveredDateTime,
          WhatsappInvoices.whatsappInvoiceClientName,
          WhatsappInvoices.whatsappInvoiceClientPhoneNumber,
          WhatsappInvoices.whatsappInvoiceClientLocation,
          WhatsappInvoices.whatsappInvoiceAmount,
          WhatsappInvoices.whatsappInvoiceShippingMethod,
          WhatsappInvoices.whatsappInvoicePaymentMethod,
          WhatsappInvoices.whatsappInvoicePaymentState,
          WhatsappInvoices.whatsappInvoiceLocationNote,
          WhatsappInvoices.whatsappInvoiceShippingNote,
          WhatsappInvoices.whatsappInvoiceProducts,
          Agents.agentName,
          LocalityAgents.localityAgentName,
          Localities.localityName
        FROM WhatsappInvoices
          LEFT JOIN Agents ON WhatsappInvoices.whatsappInvoiceAgentID = Agents.agentID
          LEFT JOIN LocalityAgents ON WhatsappInvoices.whatsappInvoiceLocalityAgentID = LocalityAgents.localityAgentID
          LEFT JOIN Localities ON WhatsappInvoices.whatsappInvoiceLocalityID = Localities.localityID
        WHERE WhatsappInvoices.whatsappInvoiceState!=(?) AND WhatsappInvoices.whatsappInvoiceState!=(?);
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
          WhatsappInvoices.whatsappInvoiceCentralDateTime,
          WhatsappInvoices.whatsappInvoiceLocalityDateTime,
          WhatsappInvoices.whatsappInvoiceShippingDateTime,
          WhatsappInvoices.whatsappInvoiceDeliveredDateTime,
          WhatsappInvoices.whatsappInvoiceClientName,
          WhatsappInvoices.whatsappInvoiceClientPhoneNumber,
          WhatsappInvoices.whatsappInvoiceClientLocation,
          WhatsappInvoices.whatsappInvoiceAmount,
          WhatsappInvoices.whatsappInvoiceShippingMethod,
          WhatsappInvoices.whatsappInvoicePaymentMethod,
          WhatsappInvoices.whatsappInvoicePaymentState,
          WhatsappInvoices.whatsappInvoiceLocationNote,
          WhatsappInvoices.whatsappInvoiceShippingNote,
          WhatsappInvoices.whatsappInvoiceProducts,
          Agents.agentName,
          LocalityAgents.localityAgentName,
          Localities.localityName
        FROM WhatsappInvoices 
        LEFT JOIN Agents ON WhatsappInvoices.whatsappInvoiceAgentID = Agents.agentID
        LEFT JOIN LocalityAgents ON WhatsappInvoices.whatsappInvoiceLocalityAgentID = LocalityAgents.localityAgentID
        LEFT JOIN Localities ON WhatsappInvoices.whatsappInvoiceLocalityID = Localities.localityID
        WHERE WhatsappInvoices.whatsappInvoiceState!=(?) AND WhatsappInvoices.whatsappInvoiceState!=(?) AND WhatsappInvoices.whatsappInvoiceLocalityID=(?);
      `;
      const selectAllActiveWhatsappInvoiceValues = ['E', 'X', localityID];
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
        WhatsappInvoices.whatsappInvoiceCentralDateTime,
        WhatsappInvoices.whatsappInvoiceLocalityDateTime,
        WhatsappInvoices.whatsappInvoiceShippingDateTime,
        WhatsappInvoices.whatsappInvoiceDeliveredDateTime,
        WhatsappInvoices.whatsappInvoiceClientName,
        WhatsappInvoices.whatsappInvoiceClientPhoneNumber,
        WhatsappInvoices.whatsappInvoiceClientLocation,
        WhatsappInvoices.whatsappInvoiceAmount,
        WhatsappInvoices.whatsappInvoiceShippingMethod,
        WhatsappInvoices.whatsappInvoicePaymentMethod,
        WhatsappInvoices.whatsappInvoicePaymentState,
        WhatsappInvoices.whatsappInvoiceLocationNote,
        WhatsappInvoices.whatsappInvoiceShippingNote,
        WhatsappInvoices.whatsappInvoiceProducts,
        Agents.agentName,
        LocalityAgents.localityAgentName,
        Localities.localityName
      FROM WhatsappInvoices 
      LEFT JOIN Agents ON WhatsappInvoices.whatsappInvoiceAgentID = Agents.agentID
      LEFT JOIN LocalityAgents ON WhatsappInvoices.whatsappInvoiceLocalityAgentID = LocalityAgents.localityAgentID
      LEFT JOIN Localities ON WhatsappInvoices.whatsappInvoiceLocalityID = Localities.localityID
      WHERE WhatsappInvoices.whatsappInvoiceState!=(?) AND WhatsappInvoices.whatsappInvoiceState!=(?) AND WhatsappInvoices.whatsappInvoiceLocalityAgentID=(?);
      `;
      const selectAllActiveWhatsappInvoiceFromLocalityAgentValues = ['E', 'X', localityAgentID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectAllActiveWhatsappInvoiceFromLocalityAgentSQL, selectAllActiveWhatsappInvoiceFromLocalityAgentValues);
      selectAllActiveWhatsappInvoiceFromLocalityAgentPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceState: async function(whatsappInvoiceID, whatsappInvoiceState, whatsappInvoiceStateDateTime, whatsappInvoiceLocalityID, whatsappInvoiceLocalityAgentID){
    return new Promise(async (updateWhatsappInvoiceStatePromiseResolve) => {
      var updateWhatsappInvoiceStateSQL = '';
      var updateWhatsappInvoiceStateValues = [];
      if (whatsappInvoiceState == 'C'){
        updateWhatsappInvoiceStateSQL = 
        `
        UPDATE WhatsappInvoices 
        SET whatsappInvoiceState=(?), whatsappInvoiceLocalityID=(?), whatsappInvoiceLocalityAgentID=(?)
        WHERE whatsappInvoiceID=(?);
        `;
        whatsappInvoiceLocalityID = null;
        updateWhatsappInvoiceStateValues = [whatsappInvoiceState, whatsappInvoiceLocalityID, whatsappInvoiceID];
      } else if (whatsappInvoiceState == 'S'){
        updateWhatsappInvoiceStateSQL = 
        `
        UPDATE WhatsappInvoices 
        SET whatsappInvoiceState=(?), whatsappInvoiceLocalityDateTime=(?), whatsappInvoiceLocalityAgentID=(?)
        WHERE whatsappInvoiceID=(?);
        `;
        whatsappInvoiceLocalityAgentID = null;
        updateWhatsappInvoiceStateValues = [whatsappInvoiceState, whatsappInvoiceStateDateTime, whatsappInvoiceLocalityAgentID, whatsappInvoiceID];
      } else if (whatsappInvoiceState == 'R'){
        updateWhatsappInvoiceStateSQL = 
        `
        UPDATE WhatsappInvoices 
        SET whatsappInvoiceState=(?), whatsappInvoiceShippingDateTime=(?), whatsappInvoiceLocalityAgentID=(?)
        WHERE whatsappInvoiceID=(?);
        `;
        updateWhatsappInvoiceStateValues = [whatsappInvoiceState, whatsappInvoiceStateDateTime, whatsappInvoiceLocalityAgentID, whatsappInvoiceID];
      } else if (whatsappInvoiceState == 'E') {
        updateWhatsappInvoiceStateSQL = 
        `
        UPDATE WhatsappInvoices 
        SET whatsappInvoiceState=(?), whatsappInvoiceDeliveredDateTime=(?)
        WHERE whatsappInvoiceID=(?);
        `;
        updateWhatsappInvoiceStateValues = [whatsappInvoiceState, whatsappInvoiceStateDateTime, whatsappInvoiceID];
      }
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceStateSQL, updateWhatsappInvoiceStateValues);
      updateWhatsappInvoiceStatePromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceClientName: async function(whatsappInvoiceID, whatsappInvoiceClientName){
    return new Promise(async (updateWhatsappInvoiceClientNamePromiseResolve) => {
      const updateWhatsappInvoiceClientNameSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceClientName=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceClientNameValues = [whatsappInvoiceClientName, whatsappInvoiceID]
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceClientNameSQL, updateWhatsappInvoiceClientNameValues);
      updateWhatsappInvoiceClientNamePromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceClientPhoneNumber: async function(whatsappInvoiceID, whatsappInvoiceClientPhoneNumber){
    return new Promise(async (updateWhatsappInvoiceClientPhoneNumberPromiseResolve) => {
      const updateWhatsappInvoiceClientPhoneNumberSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceClientPhoneNumber=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceClientPhoneNumberValues = [whatsappInvoiceClientPhoneNumber, whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceClientPhoneNumberSQL, updateWhatsappInvoiceClientPhoneNumberValues);
      console.log(databaseResult);
      updateWhatsappInvoiceClientPhoneNumberPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceAmount: async function(whatsappInvoiceID, whatsappInvoiceAmount){
    return new Promise(async (updateWhatsappInvoiceAmountPromiseResolve) => {
      const updateWhatsappInvoiceAmountSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceAmount=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceAmountValues = [whatsappInvoiceAmount, whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceAmountSQL, updateWhatsappInvoiceAmountValues);
      updateWhatsappInvoiceAmountPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceAgentID: async function(whatsappInvoiceID, whatsappInvoiceAgentID){
    return new Promise(async (updateWhatsappInvoiceAgentIDPromiseResolve) => {
      const updateWhatsappInvoiceAgentIDSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceAgentID=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceAgentIDValues = [whatsappInvoiceAgentID, whatsappInvoiceID];
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

  updateWhatsappInvoiceLocalityID: async function(whatsappInvoiceID, whatsappInvoiceLocalityID, whatsappInvoiceLocalityAgentID){
    return new Promise(async (updateWhatsappInvoiceLocalityIDPromiseResolve) => {
      const updateWhatsappInvoiceLocalityIDSQL = 
      `
      UPDATE WhatsappInvoices 
      SET whatsappInvoiceLocalityID=(?), whatsappInvoiceLocalityAgentID=(?)
      WHERE whatsappInvoiceID=(?);
      `;
      const updateWhatsappInvoiceLocalityIDValues = [whatsappInvoiceLocalityID, whatsappInvoiceLocalityAgentID, whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceLocalityIDSQL, updateWhatsappInvoiceLocalityIDValues);
      updateWhatsappInvoiceLocalityIDPromiseResolve(JSON.stringify(databaseResult));      
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
        SET whatsappInvoiceShippingMethod=(?), whatsappInvoiceLocalityAgentID=(?)
        WHERE whatsappInvoiceID=(?);`;
        updateWhatsappInvoiceShippingMethodValues = [whatsappInvoiceShippingMethod, whatsappInvoiceLocalityAgentID, whatsappInvoiceID];
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
      const updateWhatsappInvoicePaymentMethodSQL = `UPDATE WhatsappInvoices SET whatsappInvoicePaymentMethod=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoicePaymentMethodValues = [whatsappInvoicePaymentMethod, whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoicePaymentMethodSQL, updateWhatsappInvoicePaymentMethodValues);
      updateWhatsappInvoicePaymentMethodPromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoicePaymentState: async function(whatsappInvoiceID, whatsappInvoicePaymentState){ 
    return new Promise(async (updateWhatsappInvoicePaymentStatePromiseResolve) => {
      const updateWhatsappInvoicePaymentStateSQL = `UPDATE WhatsappInvoices SET whatsappInvoicePaymentState=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoicePaymentStateValues = [whatsappInvoicePaymentState, whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoicePaymentStateSQL, updateWhatsappInvoicePaymentStateValues);
      updateWhatsappInvoicePaymentStatePromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceClientLocation: async function(whatsappInvoiceID, whatsappInvoiceClientLocation, whatsappInvoiceLocationID){
    return new Promise(async (updateWhatsappInvoiceClientLocationPromiseResolve) => {
      const updateWhatsappInvoiceClientLocationSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceClientLocation=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceClientLocationValues = [whatsappInvoiceClientLocation, whatsappInvoiceID];
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

  updateWhatsappInvoiceLocationNote: async function(whatsappInvoiceID, whatsappInvoiceLocationNote){
    return new Promise(async (updateWhatsappInvoiceLocationNotePromiseResolve) => {
      const updateWhatsappInvoiceLocationNoteSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceLocationNote=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceLocationNoteValues = [whatsappInvoiceLocationNote, whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceLocationNoteSQL, updateWhatsappInvoiceLocationNoteValues);
      updateWhatsappInvoiceLocationNotePromiseResolve(JSON.stringify(databaseResult));      
    });
  },

  updateWhatsappInvoiceShippingNote: async function(whatsappInvoiceID, whatsappInvoiceShippingNote){
    return new Promise(async (updateWhatsappInvoiceShippingNotePromiseResolve) => {
      const updateWhatsappInvoiceShippingNoteSQL = `UPDATE WhatsappInvoices SET whatsappInvoiceShippingNote=(?) WHERE whatsappInvoiceID=(?);`;
      const updateWhatsappInvoiceShippingNoteValues = [whatsappInvoiceShippingNote, whatsappInvoiceID];
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
      const selectLocalityAgentNamesSQL = `SELECT * FROM LocalityAgents WHERE localityAgentLocalityID=(?) AND localityAgentType=(?);`;
      const localityAgentType = 'Mensajero';
      const selectLocalityAgentNamesValues = [localityAgentLocalityID, localityAgentType];
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
          const localityAgentLoginResult = 
          {
            success: true,
            result: 
            {
              'localityAgentID': localityAgentID,
              'localityAgentLocalityID': localityAgentLocalityID,
              'localityAgentName': localityAgentName
            }
          };
          localityAgentLoginPromiseResolve(JSON.stringify(localityAgentLoginResult));
        }
      } else {
        localityAgentLoginPromiseResolve(JSON.stringify(databaseResult));      
      }
    });
  },












  conversationTest: async function(){
    return new Promise((sendWhatsappMessagePromiseResolve) => {
      const sendWhatsappMessageURL = `https://graph.facebook.com/${constants.credentials.apiVersion}/${constants.credentials.phoneNumberID}/message_qrdls`;
      const sendWhatsappMessageHeaders = {'Content-Type': 'application/json', 'Authorization': `Bearer ${constants.credentials.apiKey}`};
      const sendWhatsappMessageData = {
        "prefilled_message": "Hola, me encantaría realizar un pedido de: ",
        "generate_qr_image": "PNG"
      }
      axios.post(sendWhatsappMessageURL, sendWhatsappMessageData, {headers: sendWhatsappMessageHeaders}).then((response) => {
        console.log(response.data);
        sendWhatsappMessagePromiseResolve({success: true, result: whatsappMessageID});
      })
      .catch((error) => {
        sendWhatsappMessagePromiseResolve({success: false, result: error});
      });  
    });
  },


  /*
  returnWhatsappInvoice: async function(whatsappInvoiceID, whatsappInvoiceShippingNote){
    return new Promise(async (returnWhatsappInvoicePromiseResolve) => {
      const returnWhatsappInvoiceSQL = 
      `
      UPDATE FROM WhatsappInvoices SET whatsappInvoiceShippingNote=(?) WHERE whatsappInvoiceID=(?);
      `;
      const returnWhatsappInvoice = [whatsappInvoiceShippingNote, whatsappInvoiceID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappInvoiceShippingNoteSQL, updateWhatsappInvoiceShippingNoteValues);
      returnWhatsappInvoicePromiseResolve(JSON.stringify(databaseResult));      
    });
  },
  */
  

}