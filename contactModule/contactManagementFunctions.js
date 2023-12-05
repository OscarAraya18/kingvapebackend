const constants = require('../constants.js');
const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');


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
  }

}