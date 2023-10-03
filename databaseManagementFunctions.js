const databaseFileManager = require('fs');

module.exports = {
    readDatabase: function (databaseRoute){
        return JSON.parse(databaseFileManager.readFileSync(databaseRoute, 'utf8'));
    },

    saveDatabase: function (databaseRoute, databaseAsJSON){
        databaseFileManager.writeFileSync(databaseRoute, JSON.stringify(databaseAsJSON));
    },

    clearDatabase: function (databaseRoute){
        databaseFileManager.writeFileSync(databaseRoute, JSON.stringify({}));
    }
}