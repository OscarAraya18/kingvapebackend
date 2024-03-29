const constants = require('../constants.js');
const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');

const databaseFileManager = require('fs');
const puppeteer = require('puppeteer');

const sharp = require('sharp');
sharp.cache({files : 0});

const fs = require('fs');


module.exports = {
  insertContact: async function(contactPhoneNumber, contactID, contactName, contactEmail, contactLocationDetails, contactNote){
    return new Promise(async (insertContactPromiseResolve) => {
      const insertContactSQL = `INSERT IGNORE INTO Contacts (contactPhoneNumber, contactID, contactName, contactEmail, contactLocations, contactLocationDetails, contactNote) VALUES (?, ?, ?, ?, ?, ?, ?);`;
      const contactLocations = JSON.stringify
      ({
        CASA: {latitude: 0, longitude: 0},
        TRABAJO: {latitude: 0, longitude: 0},
        OTRO: {latitude: 0, longitude: 0}
      });
      const insertContactValues = [contactPhoneNumber, contactID, contactName, contactEmail, contactLocations, contactLocationDetails, contactNote];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(insertContactSQL, insertContactValues);
      if (databaseResult.success){
        const websocketMessageContent = 
        {
          success: true,
          result: 
          {
            contactPhoneNumber: contactPhoneNumber,
            contactID: contactID,
            contactName: contactName,
            contactEmail: contactEmail,
            contactLocations: contactLocations,
            contactLocationDetails: contactLocationDetails,
            contactNote: contactNote
          }
        };
        console.log(contactPhoneNumber + ': ' + contactName + ' is ready');
        insertContactPromiseResolve(JSON.stringify(websocketMessageContent));
      } else {
        console.log('ERROR en ' + contactPhoneNumber + ': ' + contactName);

        insertContactPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  insertOrUpdateContact: async function(contactPhoneNumber, contactID, contactName, contactEmail, contactLocations, contactLocationDetails, contactNote){
    return new Promise(async (insertOrUpdateContactPromiseResolve) => {
      const insertOrUpdateContact = 
      `INSERT INTO Contacts (contactPhoneNumber, contactID, contactName, contactEmail, contactLocations, contactLocationDetails, contactNote) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      contactID = VALUES(contactID),
      contactName = VALUES(contactName),
      contactEmail = VALUES(contactEmail),
      contactLocations = VALUES(contactLocations),
      contactLocationDetails = VALUES(contactLocationDetails),
      contactNote = VALUES(contactNote);
      `;
      const insertOrUpdateContactValues = [contactPhoneNumber, contactID, contactName, contactEmail, contactLocations, contactLocationDetails, contactNote];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(insertOrUpdateContact, insertOrUpdateContactValues);
      insertOrUpdateContactPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  updateContact: async function(originalContactPhoneNumber, editedContactPhoneNumber, contactID, contactName, contactEmail, contactLocationDetails, contactNote){
    return new Promise(async (updateContactPromiseResolve) => {
      const updateContactSQL = `UPDATE Contacts SET contactPhoneNumber=(?), contactID=(?), contactName=(?), contactEmail=(?), contactLocationDetails=(?), contactNote=(?) WHERE contactPhoneNumber=(?);`;
      const updateContactValues = [editedContactPhoneNumber, contactID, contactName, contactEmail, contactLocationDetails, contactNote, originalContactPhoneNumber];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(updateContactSQL, updateContactValues);
      if (databaseResult.success){
        const websocketMessageContent = 
        {
          success: true,
          result: 
          {
            contactPhoneNumber: editedContactPhoneNumber,
            contactID: contactID,
            contactName: contactName,
            contactEmail: contactEmail,
            contactLocationDetails: contactLocationDetails,
            contactNote: contactNote
          }
        };
        updateContactPromiseResolve(JSON.stringify(websocketMessageContent));
      } else {
        updateContactPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  deleteContact: async function(contactPhoneNumber){
    return new Promise(async (deleteContactPromiseResolve) => {
      const deleteContactSQL = `DELETE FROM Contacts WHERE contactPhoneNumber=(?);`;
      const deleteContactValues = [contactPhoneNumber];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(deleteContactSQL, deleteContactValues);
      deleteContactPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectContactsFromStartingLetter: async function (startingLetter){
    return new Promise(async (selectContactsFromStartingLetterPromiseResolve) => {
      if (startingLetter != 'Todo'){
        const selectContactsFromStartingLetterSQL = `SELECT * FROM Contacts WHERE contactName LIKE (?);`;
        const selectContactsFromStartingLetterValues = [startingLetter + '%'];
        const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectContactsFromStartingLetterSQL, selectContactsFromStartingLetterValues);
        selectContactsFromStartingLetterPromiseResolve(JSON.stringify(databaseResult));
      } else {
        const selectContactsFromStartingLetterSQL = `SELECT * FROM Contacts;`;
        const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectContactsFromStartingLetterSQL);
        selectContactsFromStartingLetterPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },

  selectContact: async function (contactPhoneNumber){
    return new Promise(async (selectContactPromiseResolve) => {
      const selectContactSQL = `SELECT * FROM Contacts WHERE contactPhoneNumber=(?);`;
      const selectContactValues = [contactPhoneNumber];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectContactSQL, selectContactValues);
      selectContactPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  verifyClient: async function (clientID){
    return new Promise(async (verifyClientPromiseResolve) => {
      try {
        const webBrowser = await puppeteer.launch({headless: true});
        const webPage = await webBrowser.newPage();
        await webPage.goto('https://servicioselectorales.tse.go.cr/chc/consulta_cedula.aspx');
        const inputElement = await webPage.$('input[name="txtcedula"]');
        await inputElement.type(clientID);
        await webPage.click('#btnConsultaCedula');
        await webPage.waitForNavigation();
        try {
          const clientName = await webPage.evaluate(() => {
            const clientNameWordsToParse = document.getElementById('lblnombrecompleto').textContent.match(/\b[A-Z]+\b/g);
            const clientName = clientNameWordsToParse.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            return clientName;
          });
          const clientVerified = await webPage.evaluate(() => {
            const clientAgeWordsToParse = document.getElementById('lbledad').textContent.match(/\b(\d+)\s+AÑOS\b/i);
            const clientAge = parseInt(clientAgeWordsToParse[1], 10);
            return clientAge > 18 ? true : false;
          });
          await webPage.close();
          await webBrowser.close();
          verifyClientPromiseResolve(JSON.stringify({success: true, result: {clientName: clientName, clientVerified: clientVerified}}));
        } catch {
          await webPage.close();
          await webBrowser.close();
          verifyClientPromiseResolve(JSON.stringify({success: false, result: '1'}));
        }
      } catch {
        verifyClientPromiseResolve(JSON.stringify({success: false, result: e}));
      }
    });
  },

  loadContact: async function(){
    try {
      const contactDatabase = JSON.parse(databaseFileManager.readFileSync('contactModule/contactDatabase.json', 'utf8'));
      for (var contactPhoneNumber in contactDatabase){
        const contactID = contactDatabase[contactPhoneNumber].contactID;
        const contactName = contactDatabase[contactPhoneNumber].contactName;
        const insertContactResult = await this.insertContact(contactPhoneNumber, contactID, contactName, 'NA', 'NA', 'NA');
      }
      return JSON.stringify({success: true});
    } catch (error) {
      console.log(error);
      return JSON.stringify({success: false});
    }
  },


  insertFeedback: async function (whatsappConversationID, answerOne, answerTwo, answerThree, answerFour, answerFive, answerSix){
    return new Promise(async (insertFeedbackPromiseResult) => {
      const selectWhatsappConversationIDSQL = `SELECT whatsappConversationID FROM WhatsappConversations WHERE whatsappConversationID=(?) AND whatsappConversationIsActive=(?);`
      const whatsappConversationIsActive = false;
      const selectWhatsappConversationIDValues = [whatsappConversationID, whatsappConversationIsActive];
      const selectWhatsappConversationIDResult = await databaseManagementFunctions.executeDatabaseSQL(selectWhatsappConversationIDSQL, selectWhatsappConversationIDValues);
      if (selectWhatsappConversationIDResult.success){
        if (selectWhatsappConversationIDResult.result.length == 1){
          const selectFeedbackWhatsappConversationIDSQL = `SELECT whatsappFeedbackWhatsappConversationID FROM WhatsappFeedbacks WHERE whatsappFeedbackWhatsappConversationID=(?);`
          const selectFeedbackWhatsappConversationIDValues = [whatsappConversationID];
          const selectFeedbackWhatsappConversationIDResult = await databaseManagementFunctions.executeDatabaseSQL(selectFeedbackWhatsappConversationIDSQL, selectFeedbackWhatsappConversationIDValues);
          if (selectFeedbackWhatsappConversationIDResult.success){
            if (selectFeedbackWhatsappConversationIDResult.result.length == 0){
              const insertWhatsappFeedbackSQL = `INSERT INTO WhatsappFeedbacks (whatsappFeedbackWhatsappConversationID, whatsappFeedbackOne, whatsappFeedbackTwo, whatsappFeedbackThree, whatsappFeedbackFour, whatsappFeedbackFive, whatsappFeedbackSix, whatsappFeedbackDateTime) VALUES (?,?,?,?,?,?,?,?);`
              const whatsappFeedbackDateTime = new Date().toString()
              const insertWhatsappFeedbackValues = [whatsappConversationID, answerOne, answerTwo, answerThree, answerFour, answerFive, answerSix, whatsappFeedbackDateTime]
              const insertWhatsappFeedbackResult = await databaseManagementFunctions.executeDatabaseSQL(insertWhatsappFeedbackSQL, insertWhatsappFeedbackValues);
              if (insertWhatsappFeedbackResult.success){
                insertFeedbackPromiseResult(JSON.stringify(insertWhatsappFeedbackResult));
              } else {
                insertFeedbackPromiseResult(JSON.stringify({success: false, result: 5}));
              }
            } else {
              insertFeedbackPromiseResult(JSON.stringify({success: false, result: 4}));
            }
          } else {
            insertFeedbackPromiseResult(JSON.stringify({success: false, result: 3}));
          }
        } else {
          insertFeedbackPromiseResult(JSON.stringify({success: false, result: 2}));
        }
      } else {
        insertFeedbackPromiseResult(JSON.stringify({success: false, result: 1}));
      }
    });
  },

  selectNotResolvedWhatsappFeedback: async function (){
    return new Promise(async (selectNotResolvedWhatsappFeedbackPromiseResolve) => {
      const selectNotResolvedWhatsappFeedbackSQL = 
      `
      SELECT 
        WhatsappConversations.whatsappConversationID,
        WhatsappConversations.whatsappConversationRecipientPhoneNumber,
        WhatsappConversations.whatsappConversationRecipientProfileName,
        Agents.agentName,
        (WhatsappConversations.whatsappConversationAmount) AS whatsappConversationResult,
        WhatsappConversations.whatsappConversationLocalityName,
        WhatsappConversations.whatsappConversationEndDateTime,
        WhatsappFeedbacks.whatsappFeedbackOne,
        WhatsappFeedbacks.whatsappFeedbackTwo,
        WhatsappFeedbacks.whatsappFeedbackThree,
        WhatsappFeedbacks.whatsappFeedbackFour,
        WhatsappFeedbacks.whatsappFeedbackFive,
        WhatsappFeedbacks.whatsappFeedbackSix,
        WhatsappFeedbacks.whatsappFeedbackDateTime,
        ((WhatsappFeedbacks.whatsappFeedbackOne + WhatsappFeedbacks.whatsappFeedbackTwo +  WhatsappFeedbacks.whatsappFeedbackThree + WhatsappFeedbacks.whatsappFeedbackFour)/4) AS whatsappFeedbackTotal,
        (WhatsappFeedbacks.whatsappFeedbackID) AS whatsappFeedbackAction,
        (1 = 0) AS whatsappFeedbackLoading 
      FROM WhatsappConversations
      LEFT JOIN WhatsappFeedbacks ON WhatsappFeedbacks.whatsappFeedbackWhatsappConversationID = WhatsappConversations.whatsappConversationID
      LEFT JOIN Agents ON WhatsappConversations.whatsappConversationAssignedAgentID = Agents.agentID
      WHERE WhatsappFeedbacks.whatsappFeedbackResolved=(?)
      ;`;
      const selectNotResolvedWhatsappFeedbackValues = [false];
      const selectNotResolvedWhatsappFeedbackResult = await databaseManagementFunctions.executeDatabaseSQL(selectNotResolvedWhatsappFeedbackSQL, selectNotResolvedWhatsappFeedbackValues);
      selectNotResolvedWhatsappFeedbackPromiseResolve(JSON.stringify(selectNotResolvedWhatsappFeedbackResult));
    });
  },

  updateWhatsappFeedback: async function (whatsappFeedbackID){
    return new Promise(async (updateWhatsappFeedbackPromiseResolve) => {
      const updateWhatsappFeedbackSQL = `UPDATE WhatsappFeedbacks SET whatsappFeedbackResolved=(?) WHERE whatsappFeedbackID=(?);`;
      const whatsappFeedbackResolved = true;
      const updateWhatsappFeedbackValues = [whatsappFeedbackResolved, whatsappFeedbackID];
      const updateWhatsappFeedbackResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappFeedbackSQL, updateWhatsappFeedbackValues);
      updateWhatsappFeedbackPromiseResolve(JSON.stringify(updateWhatsappFeedbackResult));
    });
  },


  
  compress: async function (){
    return new Promise(async (compressPromiseResult) => {
      const selectCurrentWhatsappImageMessageIDSSQL = 
      `
      SELECT whatsappImageMessageID
      FROM WhatsappImageMessagesCurrent
      WHERE whatsappImageMessageCompressed=(?)
      `;
      const selectCurrentWhatsappImageMessageIDSValues = [false];
      const selectCurrentWhatsappImageMessagesIDSResult = await databaseManagementFunctions.executeDatabaseSQL(selectCurrentWhatsappImageMessageIDSSQL, selectCurrentWhatsappImageMessageIDSValues);
      if (selectCurrentWhatsappImageMessagesIDSResult.success){
        var currentWhatsappImageMessageIDS = selectCurrentWhatsappImageMessagesIDSResult.result.sort(() => Math.random() - 0.5);
        for (var whatsappImageMessageIndex in currentWhatsappImageMessageIDS){
          const whatsappImageMessageID = currentWhatsappImageMessageIDS[whatsappImageMessageIndex].whatsappImageMessageID;
          
          const selectCurrentWhatsappImageMessageSQL = 
          `
          SELECT *
          FROM WhatsappImageMessagesCurrent
          WHERE whatsappImageMessageID=(?)
          `;
          const selectCurrentWhatsappImageMessageValues = [whatsappImageMessageID];
          const selectCurrentWhatsappImageMessageResult = await databaseManagementFunctions.executeDatabaseSQL(selectCurrentWhatsappImageMessageSQL, selectCurrentWhatsappImageMessageValues);
          if (selectCurrentWhatsappImageMessageResult.success){
            const whatsappImageMessageFile = selectCurrentWhatsappImageMessageResult.result[0].whatsappImageMessageFile;
            const whatsappImageMessageCaption = selectCurrentWhatsappImageMessageResult.result[0].whatsappImageMessageCaption;
            const whatsappImageMessageType = selectCurrentWhatsappImageMessageResult.result[0].whatsappImageMessageType;
            sharp(whatsappImageMessageFile)
            .resize({ width: 200 })
            .webp({ quality: 80 })
            .toColorspace('srgb')
            .toBuffer()
            .then(async whatsappImageMessageFileCompressed => {
              if (Buffer.byteLength(whatsappImageMessageFileCompressed) < Buffer.byteLength(whatsappImageMessageFile)){
                const insertWhatsappImageMessageSQL = `INSERT INTO WhatsappImageMessages (whatsappImageMessageID, whatsappImageMessageFile, whatsappImageMessageCaption, whatsappImageMessageType) VALUES (?,?,?,?)`;
                const insertWhatsappImageMessageValues = [whatsappImageMessageID, whatsappImageMessageFileCompressed, whatsappImageMessageCaption, whatsappImageMessageType];
                const insertWhatsappImageMessageResult = await databaseManagementFunctions.executeDatabaseSQL(insertWhatsappImageMessageSQL, insertWhatsappImageMessageValues);
                if (insertWhatsappImageMessageResult.success){
                  const updateWhatsappImageMessageSQL = `UPDATE WhatsappImageMessagesCurrent SET whatsappImageMessageCompressed=(?) WHERE whatsappImageMessageID=(?);`;
                  const updateWhatsappImageMessageValues = [true, whatsappImageMessageID];
                  const updateWhatsappImageMessageResult = await databaseManagementFunctions.executeDatabaseSQL(updateWhatsappImageMessageSQL, updateWhatsappImageMessageValues);
                  if (updateWhatsappImageMessageResult.success){
                    console.log('COMPRESSED ' + whatsappImageMessageID);
                  } else {
                    console.log('ERROR ON UPDATE');
                  }
                }
              } else {
                console.log('EVEN BIGGER')
              }
            })
          }
          
        }
        console.log('END');
      }
    });
  },
  
}