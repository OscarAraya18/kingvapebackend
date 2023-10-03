const constants = require('./constants.js');
const generalFunctions = require('./generalFunctions.js');
const databaseManagementFunctions = require('./databaseManagementFunctions.js');
const websocketManagementFunctions = require('./websocketManagementFunctions.js');

module.exports = {
    agentLogin: function(agentUsername, agentPassword){
        const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        for (var agentID in agentsDatabase){
            if (agentsDatabase[agentID].agentUsername == agentUsername){
                if (agentsDatabase[agentID].agentPassword == agentPassword){
                    return {'agentID': agentID, 'agentName': agentsDatabase[agentID].agentName, 'agentType': agentsDatabase[agentID].agentType};
                }
            }
        }
        return {'agentID': null, 'agentName': null, 'agentType': null};
    },

    createAgent: function(request){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        agentsDatabase[request.agentID] = 
        {
            "agentName": request.agentName,
            "agentUsername": request.agentUsername,
            "agentPassword": request.agentPassword,
            "agentActiveConversations": [],
            "agentFinishedConversations": [],
            "agentReceivedMessages": 0,
            "agentReadedMessages": 0,
            "agentSendedMessages": 0,
            "agentAverageResponseTime": 0,
            "agentAverageConversationTime": 0,
            "agentStatus": "offline",
            "agentType": "agent",
            "favoriteMessages": ["Mensaje favorito 1", "Mensaje favorito 2", "Mensaje favorito 3"],
            "welcomeMessage": "Mensaje de bienvenida",
            "endMessage": "Mensaje de despedida",
            "welcomeImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJCwgGBggLDAoKCwoKDBAMDAwMDAwQDA4PEA8ODBMTFBQTExwbGxscHx8fHx8fHx8fHwEHBwcNDA0YEBAYGhURFRofHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f/8AAEQgAjgBoAwERAAIRAQMRAf/EAK0AAAEEAwEAAAAAAAAAAAAAAAABBAYHAwUIAgEBAAMAAwEAAAAAAAAAAAAAAAECAwQFBgcQAAECBAQDAwgHAwgLAAAAAAECAwARBAVhEhQGITETQVEHcZHRIpJTkxWBoTJCUiNUwTMIsWJygrKzVheicyRkdJSk1OQWGBEAAgEDAgIIBQIHAAAAAAAAAAECERIDIQQxBVFxkaGxMlIUQWEiExXhI/CBwdFCYnL/2gAMAwEAAhEDEQA/AJz/ABA+O9bs15G29tdM351sO1dY4AsUqF/YCUH1VOKHretwAlwM+GWTJTQHLF53lvO9Pqeut7rqxajMh2ocKR/RRPKkYARg5sg1utun6t/4i/TC4Brbp+rf+Iv0wuAa26fq3/iL9MLgGtun6t/4i/TC4Brbp+rf+Iv0wuAa26fq3/iL9MLgGtun6t/4i/TC4Brbp+rf+Iv0wuAa26fq3/iL9MLgP7Tuzd1neD1rvVdROAzmxUOoB8oCpHl2wvB0/wDw/ePlw3RWJ2rupSV3koUq33FKQjUhsZltuJTJIcCQVApABAPaPW2x5K6MFA+KFY/dPEXcla+SVLuNQhM+YbacLTaf6qEARxJz+pkEX0+EVuAafCFwDT4QuAafCFwDT4QuAafCFwDT4QuAafCFwDT4QuAafCFwDT4QuBvNi1L9t3pYq9gkO09fTLEjKYDqZp8ihwMTGeqBsd60895X4y53Gr/v1xjkl9T6waXTYRS4BpsIXANNhC4BpsIXANNhC4BpsIXANNhC4Ex8OPCi/b6uSmaICmt9ORrbi4JobB4hKRwK1nsSPpIjXFjc3oDpXa38P3hrYmmy9bk3esSPXqbh+aFHBn9yB/VJxjsIYIr5k0JYrYex1N9JW3bYW5SyGjp8su6WSNLI9BJCd3fw5+Hd8p1qt9KbHXkfl1FJPpT7M7CjkI/o5TjGU9vF8NCKHO118Pb9szfVttt2aHGrYXTVTcyy831U+shRA+kHiI4MouEkmQYN40893Xsy53Cq/vlRxMsvqfWQajTYRS4BpsIXANNhC4BpsIXANNhC4BpsIXAyU9ueqahqnZRneeWlttA5lSjIDzmJUqg7Y2RtOh2ptmistIE/7OgGodAl1X1cXHD2+srl3CQ7I77FjUIpFyvfF/xrqdtVxsO3223bqhIVWVbozoYzCaUJR95cjMz4DHs4u53djtjxIbKib8bfFRFQHvnalmcy2pinKDhl6fLyRwveZOkipefhF4uJ3m27b7k0ilvtKjqKS3MNPtTAK0AklJSSMyZ4jtl2G23X3NHxJTJF4g7Npdz2dttTYNfb326ygd+8lxpQUpAPc4kFPmPZG2bHcvmiWcu7rtVYrdN4UKdwhVdUkEIVIgvKwjz2Wt762UNJpsIyuIDTYQuAqaRSlBKUkqUZADmSYXAu7/5fT/iT/ov/ACI7f8b/ALd36lrSmrtaPl91rKDP1dI+4x1JZc3TWUZpTMpy5Tjqp/S2ugqNdNhFbgbHblSLXf7dctMavRVLVQKYKKeoWlhYTmAVLiO4xfHktknxoC6//om4f4Sd/wCaV/28dn+Tfp7/ANC1xSW4Kx+7324XR9Bbdrah19TZOYo6iyrJOQ+zOXKOsyZbpN9JUYabCKXAm/gsH2PEuzlqfrl5DgHagsOTn5OccrZS/dRKOrY9CXCAOSd4bXqLDuOutryClLbilU6pcFMqM21Dyp+uPJ7iDxzcWZs02mwjC4gkOwNsu3vdtuo0oKmUupeqjKYDLSgpc/L9nymORtIPJkSJR1dHqzQ5e8VtuvWvfNyzIIZrnDWsLPJQfJWqXkczCPMb6Dhlfz1M2RHTYRw7iCe+C22ai4b0p64IOktYL77nZmKSltM+8qM/IDHYcuxueRP4RLROj332mGHH3lZGmkqW4o8glImT5o9E3RVZc47uK1VtwqqxQkqpeceIxcUVftjx88lW30mQUdmr61wN0dM7UuEyCGkKWSfIkGEU5cFUF3+DvhfW2SoVf7y30a5SC3R0hkVNpX9pa5clEcAOwTnHecv2coO+XEukWxHaliK7L3gzd3q+2VCwLnbqh5soPNxlLighae+QklXn7Y4O03ayOUX5ot9hCZsNy7PsG5KdLV1pg4pv9y+g5HUT55VjswPCN8+2hlVJINEKPgFtzrTFwq+j+D8rN7WWX+jHX/h4V8zItJrtjZ1g21TqZtdPkW5LrVCzmdXLlmV3YDhHPwbaGJUiiUjHcd6Weg3LR2F9YFTVpJLk/VbUZdJCsXOMvo74rk3kI5FjfF/wu0VMm6Nn2LctImnujJUWySy+2crrZPPKrjz7jwi2420MqpINEMa8BNtJfzOV1WtkGfTm2CcCrL+yOAuT468WRaT6yWG0WOhTQ2umTTU6TMhMypSjzUtRmpRxMdliwxxqkVRFqEC8Yd6s0tuc27QuBVbVjLWqSf3TJ4lB/nOcpfh8ojq+ab1Rj9uPmfH5IrJlIaePO3FDrCziVooR/u7X9gR7fF5F1Go7jQBAHNl2cqaTc9fVUrimahusfU26glKknqK5ER4XNkccsmnRqT8TJ8SaWbxku9O2lq6UaK3Lw67auks4qElJJ8ko7PDzyaVJq7uJUzd/502bJP5fU5/wzbl55/sjl/ncfpZN5pbz4y3V9pTVqokUZVwFQ6rqrGKUySkHyzji5ueSapBW95DmVzUqqKmocqahxTr7qitx1ZJUpR7STHSyyOTq3qVJ1tzxZvltYRTXBoXJhAkhxSih4AdhXJQV9InjHa7bnM4Kklcu8spEl/zqtHTn8uqep+GaMvtT/ZHO/O46eVk3kdv3i7fq5pTFtZTbWlcC6FdR6WCiEpT7M8Y4W451kmqQVviQ5FfuNuOOKccUVuLJUtaiSSTzJJjqHOvEqJp8Ii4Gyp7/ALjplJUxc6tvIJJAeckAOyU5SjeO7yLhKXaTUs/w78R6y5VSLReSFVTgOlqwAnOQJ5FgcJy5ER33LeaPJKyfH4MtGRY8d6XKArLNWXLclyYpUBSw/UOLKlJQlKErJUtSlEJAEeDyYpZM0lHpl4mNNTAvbNw1bFIyWaqoqJ9NFM8099nnmKFEJ+mKPbTuUVSTfQ0/AUH9Bst52tXS1LzIWaZ95ksvsrTnZTMBxSSpKRm5zjfFsm5WtryyejT4dPQTQZP7TvLVXT0nQDrtWCaYtLQ4hYT9ohaSU+rLjM8IxltMqko0q5cKNOv8yKCVO1rqwunSG0viqX0mHKdxDyFOfgzNlQCuPIxE9rkjTStzoqNPXo0FDONoXBqqpU1QQaZ6oRTOusOtvdNa1AFKigryql3xp7OakruDklo06dhNDLW7Mq0V1eimU2mhpKldMmpqnmmQpaeOWaygFWXjwi2TZSUpJUtjKlW0vEUGFHtyvrbp8spQ29VHNlyOIKDlGY5Vg5TwHfGGPbznk+3Gjl1rxIobxPhju1sEqom1gEKl1UE8J8OCo5q5RuF/iu1E2sifQjqriodCFwNht5taL/bVoJCxVMlJH+sEb7ST+7CnqXiSjoiPoJsUomsFBua4vqfdp0qdqEKU0028VBSyClSHSlBScY8Es/29xN1a1lwSfx6HoY/EeL3Ja26ykdap1OhLT7Fa/wBJmmccQ+MoyoZmgFscj2xu+YY1KLSrpJSdIxbr8lpoTUY01VYaB59VEapxNRR1FOrrIbSQt1GVBGVZ9Xjxjjwz4cbdlzrCS1S4tafEjQcW/cdLSUdqpyy4sUqaxqrAkmbdXITbVM+skDtEaYeYRhGEaP6b0+qXQSmeqLcNvtKKNm2tvPtMVeseXUBLalHplrIkIKwPVUeM+cTj38MKisabSlc66fClNKitDxTXezW5ksW9NS43UVTD9Sp9KElLdOsrShASpWZXHiokeSIhu8WNUhc05RbrThF101FRx/7HRrqq9w1NQzT1VUuoRTaWmqU+sAAo9ZXqrlwMo0/IQcpOskpSbpbGXi+IqM6K8UTG8mrtTM6Wi64PSAAytrGRZkngOBJkIxxbyEd0skVbC7u4MV1LqBBAIMweIIj3hqU7vLZtZa696pYaU5bXVFbbiQSG5meRcuUuwx4jmfLp4ZuSVcb7vkzKUaEY6UdRUqTjw/2bVuXBq7VrRapac52ErBCnF/dIB+6nnOPQ8n5dOU1kmqRXD5svGJZ7jiG0KccUEoSJqUeQEeslJJVZoUdeUD5vXf8AEO/2zHzbdv8Adn/0/EwYzyCOPUgMghUBkEKgMghUBkEKgMghUBkEKgn+zd8MssN226rypbGWnqjyCexC+6XYY9RynnMYxWPK+HCX9H/c0jInzbrbqEuNLC21cUrSQQRgRHqYyUlVao0MaaKjS51EsNhwGYWEJBn5ZRRYoJ1oqgWpqqalZU9UupZaT9payEj64nJljBXSdECvdx7z+Z11Pb7eSmhDzZdcIkXSFggS7Ex5Tf8AN/vTjjx+S5VfTr4GblUjm5qVdLf69lQl+etaZ/hWc6fqVHT8xxuGeafqffqVlxNZHCKhABABACwAQAQASgBxSXG40ZJpKl1ifPprUkHygGNsW4yY/JJx6mTUfndm5SJfMHpeWR88cr8pufXIm5muqaysql56p9x9f4nFFZ+smOJkyzm6ybl1kDix0rlVeaJhAmVvInLsAUCo/QBONdlic80Ir1ILiWRu/Z6LyE1VMpLde2Ms1cEuJHYqXaOwx7DmvKluPqjpNd5rKNSua2xXSidLVTTqSsdiZLHnTOPJ5eX5oOji/HwM6Mb6Gq9yv2T6Iz9pl9MuxkUF0NV7lfsmHtMvpl2MUDRVXuV+yYe0y+mXYxQNDVe5X7Jh7TL6ZdjFBdDU+5X7Jh7TL6ZdjFA0VV7lfsn0RPtMvpl2MUDQ1PuV+yfRD2mX0y7GKC6Gp9yv2TD2mX0y7GTQNDU+5X7Jh7TL6ZdjIoZ6Sy3KrdDTFOpSzyB9X61SEaY9hmm6KL8PEmjLB2hs35Ss1tYUrrVDKhKeKWwefHtUY9RyrlP2HfPWfgaRjQdbguT4WaSnUUAD81aeBM/ugx2OfI+CJZHtLhHEtIDSjuhaA0uELQLpcIWgNLhC0BpcIm0BpR3QtAulHdC0BpcIWgNLhC0BpcIWg31huD6XRSvqK21cG1K4lJHZPujlYMjrRkow1TRXVOqPMrV/LFJrVgxafCK2kBp8IUAunwhaSGnwhaA0+ELQLp8IWgNPhC0gUUxJkBMnkIm0kdNWWpWJkBA/nc/qjRYWxQy/IF+8T5jE+3YoYXbPUtieULHenj9UVeFoUMTDBS82oc0qB8xisY6gfuU83FnvUf5Y1cdQedNhEWgNMO6FoF0+ETaA02ELQLp8IWgNPhC0C6fCFoHtNSoaE5eueZ7o2jChJmUpKRMmUXqDz128fNFbkD2CCJjjFgYHqZClBxIkoHjjFJQ+IFDfrk+XsnCgF6aSRw+qUTQB05niByPZCgANp4THHjCgF6YMpiXGFAGQdoHPhCgDIJngOfdOFAAQM85cIUBkiwMak5jMxVoCdMQoD0hMjBA9xYCcIgBwgA4QAcIAOEAHCADhEgOEALwgA4QAcIAOEAEAf//Z",
        }
        databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
    },

    deleteAgent: function(agentID){
      var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
      delete agentsDatabase[agentID];
      databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
    },

    updateAgent: function(request){
      var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
      agentsDatabase[request.agentID]['agentName'] = request.agentName;
      agentsDatabase[request.agentID]['agentUsername'] = request.agentUsername;
      agentsDatabase[request.agentID]['agentPassword'] = request.agentPassword;
      databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
    },

    deleteAllAgentsActiveConversations: function (){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        for (var agentID in agentsDatabase){
            agentsDatabase[agentID].agentActiveConversations = [];
        }
        databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
    },

    getAgentActiveConversations: function (agentID){
        const conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        const agentActiveConversationsIDS = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase)[agentID].agentActiveConversations;
        var agentActiveConversations = {};
        for (var conversationID in conversationsDatabase){
            if (agentActiveConversationsIDS.includes(conversationID)){
                agentActiveConversations[conversationID] = conversationsDatabase[conversationID];
            }
        }
        return agentActiveConversations;
    },

    getAssignedAgentToConversationID: function (searchedConversationID){
        const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        for (var agentID in agentsDatabase){
            for (var conversationID in agentsDatabase[agentID].agentActiveConversations){
                if (searchedConversationID.includes(conversationID) != false){
                    return agentID;
                }
            }
        }
        return null;
    },

    getAllAgents: function (){
        const agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        return agentsDatabase;
    },

    getAllFavoriteImages: function (){
      const favoriteImagesDatabase = databaseManagementFunctions.readDatabase(constants.routes.favoriteImagesDatabase);
      return favoriteImagesDatabase;
  },

    updateAssignedAgentToConversation: function(previousAgentID, activeConversationID, newAgentID, products, websocketConnection){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        const activeConversationIndex = agentsDatabase[previousAgentID].agentActiveConversations.indexOf(activeConversationID);
        if (activeConversationIndex !== -1) {
            agentsDatabase[previousAgentID].agentActiveConversations.splice(activeConversationIndex, 1);
        }
        agentsDatabase[newAgentID].agentActiveConversations.push(activeConversationID);
        conversationsDatabase[activeConversationID].assignedAgentID = newAgentID;
        conversationsDatabase[activeConversationID].products = products;
        conversationsDatabase[activeConversationID].transferHistory.push({previousAgentName: agentsDatabase[previousAgentID].agentName, newAgentName: agentsDatabase[newAgentID].agentName, transferDate: generalFunctions.getCurrentDateAsStringWithFormat(), transferHour: generalFunctions.getCurrentHourAsStringWithFormat()});
        databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
        databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
        websocketManagementFunctions.transferConversation(websocketConnection, conversationsDatabase[activeConversationID], activeConversationID, newAgentID, agentsDatabase[newAgentID].agentName, false);
    },

    assignNewConversationToAgentWithLessActiveConversations: function (newConversationID, agentID){
        var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        var agentsWithLessActiveConversations = [];
        if (agentID == null){
            for (var agentID in agentsDatabase){
                if (agentsDatabase[agentID].agentStatus != 'offline'){
                    if (agentsWithLessActiveConversations.length == 0){
                        agentsWithLessActiveConversations.push(agentID);
                    } else {
                        if (agentsDatabase[agentID].agentActiveConversations.length < agentsDatabase[agentsWithLessActiveConversations[0]].agentActiveConversations.length){
                            agentsWithLessActiveConversations = [agentID];
                        } else if (agentsDatabase[agentID].agentActiveConversations.length == agentsDatabase[agentsWithLessActiveConversations[0]].agentActiveConversations.length) {
                            agentsWithLessActiveConversations.push(agentID);
                        }
                    }
                }
            }
            if (agentsWithLessActiveConversations.length != 0){
                const agentWithLessActiveConversations = agentsWithLessActiveConversations[Math.floor(Math.random()*agentsWithLessActiveConversations.length)]; 
                conversationsDatabase[newConversationID].assignedAgentID = agentWithLessActiveConversations;
                agentsDatabase[agentWithLessActiveConversations].agentActiveConversations.push(newConversationID);
                databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
                databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
            }
        } else {
            conversationsDatabase[newConversationID].assignedAgentID = agentID;
            agentsDatabase[agentID].agentActiveConversations.push(newConversationID);
            databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
            databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
        }
    },

    assignConversationToAgent: function (conversationID, agentID){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        agentsDatabase[agentID].agentActiveConversations.push(conversationID);
        databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
    },

    updateAgentStatus: function (requestQuery, frontedResponse, websocketConnection){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        agentsDatabase[requestQuery.agentID].agentStatus = requestQuery.agentStatus;
        databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
        websocketManagementFunctions.updateAgentStatus(websocketConnection, requestQuery.agentID, requestQuery.agentStatus)
        frontedResponse.end();
    },

    getAgentStatus: function (requestQuery, frontedResponse){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        frontedResponse.end(JSON.stringify({'agentStatus':agentsDatabase[requestQuery.agentID].agentStatus}));
    },

    updateAgentInformation: function (requestQuery, frontedResponse){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        agentsDatabase[requestQuery.agentID].welcomeMessage = requestQuery.agentWelcomeMessage;
        agentsDatabase[requestQuery.agentID].endMessage = requestQuery.agentEndMessage;
        agentsDatabase[requestQuery.agentID].welcomeImage = requestQuery.welcomeImage;
        databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
        frontedResponse.end();
    },

    grabPendingConversation: function (requestQuery, websocketConnection){
        var agentsDatabase = databaseManagementFunctions.readDatabase(constants.routes.agentsDatabase);
        var conversationsDatabase = databaseManagementFunctions.readDatabase(constants.routes.conversationsDatabase);
        agentsDatabase[requestQuery.agentID].agentActiveConversations.push(requestQuery.conversationID);
        conversationsDatabase[requestQuery.conversationID].assignedAgentID = requestQuery.agentID;
        databaseManagementFunctions.saveDatabase(constants.routes.agentsDatabase, agentsDatabase);
        databaseManagementFunctions.saveDatabase(constants.routes.conversationsDatabase, conversationsDatabase);
        websocketManagementFunctions.transferConversation(websocketConnection, conversationsDatabase[requestQuery.conversationID], requestQuery.conversationID, requestQuery.agentID, agentsDatabase[requestQuery.agentID].agentName, true);
    }
}