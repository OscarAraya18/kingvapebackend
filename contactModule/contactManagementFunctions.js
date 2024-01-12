const constants = require('../constants.js');
const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');

const databaseFileManager = require('fs');
const puppeteer = require('puppeteer');


module.exports = {
  insertContact: async function(contactPhoneNumber, contactID, contactName, contactEmail, contactLocationDetails, contactNote){
    return new Promise(async (insertContactPromiseResolve) => {
      const insertContactSQL = `INSERT INTO Contacts (contactPhoneNumber, contactID, contactName, contactEmail, contactLocations, contactLocationDetails, contactNote) VALUES (?, ?, ?, ?, ?, ?, ?);`;
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
        insertContactPromiseResolve(JSON.stringify(websocketMessageContent));
      } else {
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
          verifyClientPromiseResolve(JSON.stringify({success: true, result: {clientName: clientName, clientVerified: clientVerified}}));
        } catch {
          await webPage.close();
          verifyClientPromiseResolve(JSON.stringify({success: false, result: '1'}));
        }
      } catch (e) {
        console.log(e);
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
        if (insertContactResult.success == false){
          return JSON.stringify({success: false});
        }
        console.log(contactPhoneNumber);
        console.log(contactPhoneNumber + ': ' + contactName + ' is ready');
      }
      return JSON.stringify({success: true});
    } catch (error) {
      console.log(error);
      return JSON.stringify({success: false});
    }
  }
}