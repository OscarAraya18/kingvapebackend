const constants = require('./constants.js');
const databaseManagementFunctions = require('./databaseManagementFunctions.js');

module.exports = {
    getContact: function(contactPhoneNumber){
        const contactsDatabase = databaseManagementFunctions.readDatabase(constants.routes.contactsDatabase);
        if (contactPhoneNumber in contactsDatabase){
            return contactsDatabase[contactPhoneNumber];
        } else {    
            return null;
        }
    },

    getAllContacts: function(){
        const contactsDatabase = databaseManagementFunctions.readDatabase(constants.routes.contactsDatabase);
        return contactsDatabase;
    },

    createContact: function(contactInformation, frontendResponse){
        const contactsDatabase = databaseManagementFunctions.readDatabase(constants.routes.contactsDatabase);
        contactsDatabase[contactInformation.contactPhoneNumber] = contactInformation;
        databaseManagementFunctions.saveDatabase(constants.routes.contactsDatabase, contactsDatabase);
        frontendResponse.end();
    },

    updateContact: function(request){
      var contactsDatabase = databaseManagementFunctions.readDatabase(constants.routes.contactsDatabase);
      contactsDatabase[request.contactID]['contactName'] = request.contactName;
      contactsDatabase[request.contactID]['contactEmail'] = request.contactEmail;
      contactsDatabase[request.contactID]['contactLocationDetails'] = request.contactLocationDetails;
      contactsDatabase[request.contactID]['contactNote'] = request.contactNote;
      databaseManagementFunctions.saveDatabase(constants.routes.contactsDatabase, contactsDatabase);
    },

    deleteContact: function(contactID){
      var contactsDatabase = databaseManagementFunctions.readDatabase(constants.routes.contactsDatabase);
      delete contactsDatabase[contactID];
      databaseManagementFunctions.saveDatabase(constants.routes.contactsDatabase, contactsDatabase);
    },

    createContactFromContactsPage: function(request){
      var contactsDatabase = databaseManagementFunctions.readDatabase(constants.routes.contactsDatabase);
      contactsDatabase[request.contactID] = 
      {
        'contactName': request.contactName,
        'contactPhoneNumber': request.contactID,
        'contactEmail': request.contactEmail,
        'contactLocation': {
          'latitude': '0',
          'longitude': '0'
        },
        'contactLocationDetails': request.contactLocationDetails,
        'contactNote': request.contactNote
      };
      databaseManagementFunctions.saveDatabase(constants.routes.contactsDatabase, contactsDatabase);

    }
}