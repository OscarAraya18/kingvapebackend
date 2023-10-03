const constants = require('./constants.js');

module.exports = {
    getCurrentDateAsString: function(){
        const currentYear = Date().toString().slice(11,15);
        const currentMonth = constants.fromMonthNameToMonthNumber[Date().toString().slice(4,7)];
        const currentDay = Date().toString().slice(8,10);
        return currentDay+currentMonth+currentYear;
    },

    getCurrentDateAsStringWithFormat: function(){
        var currentDateAsString = this.getCurrentDateAsString();
        return currentDateAsString.slice(0,2)+'/'+currentDateAsString.slice(2,4)+'/'+currentDateAsString.slice(4,8);
    },

    getCurrentHourAsStringWithFormat: function(){
        return Date().toString().slice(16,24);
    },

    getCurrentDateObject: function(){
        return Date().toString();
    },

    fromBase64ToByteArray: function(base64){
        const binaryString = atob(base64.split(',')[1]);
        const byteArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }
        return byteArray;
    }

}