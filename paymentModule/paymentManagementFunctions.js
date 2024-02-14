const PDFDocument = require("pdfkit-table");
const fs = require('fs');


const databaseManagementFunctions = require('../databaseModule/databaseManagementFunctions.js');

module.exports = {
  localityLogin: async function(localityUsername, localityPassword){
    return new Promise(async (localityLoginPromiseResolve) => {
      const localityLoginSQL = `SELECT localityID, localityName, localityPassword FROM Localities WHERE localityUsername=(?) AND localityPassword=(?);`;
      const localityLoginValues = [localityUsername, localityPassword];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(localityLoginSQL, localityLoginValues);
      if (databaseResult.success){
        if (databaseResult.result.length == 0){
          const localityLoginResult = {success: false};
          localityLoginPromiseResolve(JSON.stringify(localityLoginResult));
        } else {
          const localityID = databaseResult.result[0].localityID;
          const localityName = databaseResult.result[0].localityName;
          const localityPassword = databaseResult.result[0].localityPassword;
          const localityLoginResult = 
          {
            success: true,
            result: 
            {
              localityID: localityID,
              localityName: localityName,
              localityPassword: localityPassword
            }
          };
          localityLoginPromiseResolve(JSON.stringify(localityLoginResult));
        }
      } else {
        localityLoginPromiseResolve(JSON.stringify(databaseResult));
      }
    });
  },


  selectNotUsedTransactions: async function(){
    return new Promise(async (selectNotUsedTransactionsPromiseResolve) => {
      const selectNotUsedTransactionsSQL = `SELECT * FROM Transactions WHERE transactionUsed = (?);`;
      const selectNotUsedTransactionsValues = [false];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectNotUsedTransactionsSQL, selectNotUsedTransactionsValues);
      selectNotUsedTransactionsPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectUsedTransactions: async function(initialDate, endDate){
    return new Promise(async (selectUsedTransactionsPromiseResolve) => {
      const conditions = [];
            
      if (initialDate != ''){
        initialDate = new Date(initialDate);
        initialDate.setHours(initialDate.getHours() + 6);
        initialDate = initialDate.toString();
        initialDate = initialDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(transactionApprovedDate, '%a %b %d %Y %H:%i:%s GMT+0000') >= STR_TO_DATE('${initialDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      if (endDate != ''){
        endDate = new Date(endDate);
        endDate.setHours(endDate.getHours() + 6);
        endDate = endDate.toString();
        endDate = endDate.replace('GMT-0600', 'GMT+0000');
        conditions.push(`STR_TO_DATE(transactionApprovedDate, '%a %b %d %Y %H:%i:%s GMT+0000') <= STR_TO_DATE('${endDate}', '%a %b %d %Y %H:%i:%s GMT+0000')`);
      }

      const whereClause = conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '';
      
      var selectUsedTransactionsSQL = 
      `
        SELECT 
          Transactions.transactionID,
          Transactions.transactionNote,
          Transactions.transactionAmount,
          Transactions.transactionDate,
          Transactions.transactionRelatedMessageID,
          Transactions.transactionApprovedDate,
          Transactions.transactionSystemDate,
          LocalityAgents.localityAgentName,
          Agents.agentName,
          Localities.localityName
        FROM Transactions
        LEFT JOIN LocalityAgents ON Transactions.transactionApprover = LocalityAgents.localityAgentID
        LEFT JOIN Agents ON Transactions.transactionApprover = Agents.agentID
        LEFT JOIN Localities ON Transactions.transactionStore = Localities.localityID
        WHERE transactionUsed = (?)
      `;

      selectUsedTransactionsSQL = selectUsedTransactionsSQL + whereClause;
      const selectUsedTransactionsValues = [true];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectUsedTransactionsSQL, selectUsedTransactionsValues);
      selectUsedTransactionsPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectLocalityAgents: async function(localityAgentLocalityID){
    return new Promise(async (selectLocalityAgentsPromiseResolve) => {
      const selectLocalityAgentsSQL = `SELECT * FROM LocalityAgents WHERE localityAgentLocalityID = (?) AND localityAgentIsActive = (?);`;
      const localityAgentIsActive = true;
      const selectLocalityAgentsValues = [localityAgentLocalityID, localityAgentIsActive];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectLocalityAgentsSQL, selectLocalityAgentsValues);
      selectLocalityAgentsPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectAllLocalityAgents: async function(){
    return new Promise(async (selectAllLocalityAgentsPromiseResolve) => {
      const agentsResult = [];
      const selectAllLocalityAgentsSQL = `SELECT localityAgentID, localityAgentLocalityID, localityAgentName FROM LocalityAgents WHERE localityAgentIsActive=(?);`;
      const localityAgentIsActive = true;
      const selectAllLocalityAgentsValues = [localityAgentIsActive];
      const selectAllLocalityAgentsResult = await databaseManagementFunctions.executeDatabaseSQL(selectAllLocalityAgentsSQL, selectAllLocalityAgentsValues);
      if (selectAllLocalityAgentsResult.success){
        const selectAllAgentsSQL = `SELECT agentID, agentName FROM Agents WHERE agentIsActive=(?);`;
        const agentIsActive = true;
        const selectAllAgentsValues = [agentIsActive];
        const selectAllAgentsResult = await databaseManagementFunctions.executeDatabaseSQL(selectAllAgentsSQL, selectAllAgentsValues);
        if (selectAllAgentsResult.success){
          for (var localityAgentIndex in selectAllLocalityAgentsResult.result){
            const localityAgent = selectAllLocalityAgentsResult.result[localityAgentIndex];
            agentsResult.push({agentID: localityAgent.localityAgentID, agentName: localityAgent.localityAgentName, localityID: localityAgent.localityAgentLocalityID});
          }
          for (var agentIndex in selectAllAgentsResult.result){
            const agent = selectAllAgentsResult.result[agentIndex];
            agentsResult.push({agentID: agent.agentID, agentName: agent.agentName, localityID: 0});
          }
          selectAllLocalityAgentsPromiseResolve(JSON.stringify({success: true, result: agentsResult}));
        } else {
          selectAllLocalityAgentsPromiseResolve(JSON.stringify(selectAllAgentsResult));
        }
      } else {
        selectAllLocalityAgentsPromiseResolve(JSON.stringify(selectAllLocalityAgentsResult));
      }
    });
  },

  syncTransaction: async function(websocketConnection, transactionID, transactionStore, transactionApprover, transactionRelatedMessageID){
    return new Promise(async (syncTransactionPromiseResolve) => {
      const transactionApprovedDate = new Date().toString();
      const transactionUsed = true;
      const syncTransactionSQL = `UPDATE Transactions SET transactionStore=(?), transactionApprover=(?), transactionRelatedMessageID=(?), transactionApprovedDate=(?), transactionUsed=(?) WHERE transactionID=(?);`;
      const syncTransactionValues = [transactionStore, transactionApprover, transactionRelatedMessageID, transactionApprovedDate, transactionUsed, transactionID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(syncTransactionSQL, syncTransactionValues);
      syncTransactionPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  reverseTransaction: async function(websocketConnection, transactionID){
    return new Promise(async (reverseTransactionPromiseResolve) => {
      const transactionStore = null;
      const transactionApprover = null;
      const transactionRelatedMessageID = null;
      const transactionApprovedDate = null;
      const transactionUsed = false;
      const reverseTransactionSQL = `UPDATE Transactions SET transactionStore=(?), transactionApprover=(?), transactionRelatedMessageID=(?), transactionApprovedDate=(?), transactionUsed=(?) WHERE transactionID=(?);`;
      const reverseTransactionValues = [transactionStore, transactionApprover, transactionRelatedMessageID, transactionApprovedDate, transactionUsed, transactionID];
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(reverseTransactionSQL, reverseTransactionValues);
      reverseTransactionPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  selectLocalities: async function(){
    return new Promise(async (selectLocalitiesPromiseResolve) => {
      const selectLocalitiesSQL = `SELECT * FROM Localities;`;
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectLocalitiesSQL);
      selectLocalitiesPromiseResolve(JSON.stringify(databaseResult));
    });
  },

  parseDateTime(originalHour){
    const parsingDate = new Date(originalHour);
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    var formattedDate = parsingDate.toLocaleString('en-GB', options);
    if (formattedDate.slice(-2) == 'am'){
      formattedDate = formattedDate.slice(0,-2) + 'AM'
    } else if (formattedDate.slice(-2) == 'pm') {
      formattedDate = formattedDate.slice(0,-2) + 'PM'
    }
    if (formattedDate.includes('00') && formattedDate.includes('PM')){
      formattedDate = formattedDate.replace('00', '12');
    }
    return formattedDate;
  },

  parseDate(originalHour){
    const parsingDate = new Date(originalHour);
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    var formattedDate = parsingDate.toLocaleString('en-GB', options).slice(0,-10);
    return formattedDate;
  },

  generateTodayInvoice: async function(transactionStore){
    return new Promise(async (generateTodayInvoicePromiseResolve) => {
      let currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 6);
      let hourPart = currentDate.toISOString().substring(11, 13);
      let hour = parseInt(hourPart, 10);
      var selectInvoiceInformationSQL = '';
      if (hour >= 18){
        selectInvoiceInformationSQL = 
        `
        SELECT
          Transactions.transactionID,
          Transactions.transactionNote,
          Transactions.transactionAmount,
          Transactions.transactionDate,
          Transactions.transactionSystemDate,
          Localities.localityName,
          COALESCE(Agents.agentName, LocalityAgents.localityAgentName) as transactionApprover,
          Transactions.transactionApprovedDate
        FROM Transactions
        LEFT JOIN Agents ON Agents.agentID = Transactions.transactionApprover
        LEFT JOIN LocalityAgents ON LocalityAgents.localityAgentID = Transactions.transactionApprover
        LEFT JOIN Localities ON Localities.localityID = Transactions.transactionStore
        WHERE 
          Transactions.transactionUsed=(?)
          AND 
          Transactions.transactionStore=(?)
          AND 
          STR_TO_DATE(transactionApprovedDate, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%Y-%m-%d 6:00:00')
          AND
          STR_TO_DATE(transactionApprovedDate, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 6 HOUR, '%Y-%m-%d 06:00:00')
        `;
      } else {
        selectInvoiceInformationSQL = 
        `
        SELECT
          Transactions.transactionID,
          Transactions.transactionNote,
          Transactions.transactionAmount,
          Transactions.transactionDate,
          Transactions.transactionSystemDate,
          Localities.localityName,
          COALESCE(Agents.agentName, LocalityAgents.localityAgentName) as transactionApprover,
          Transactions.transactionApprovedDate
        FROM Transactions
        LEFT JOIN Agents ON Agents.agentID = Transactions.transactionApprover
        LEFT JOIN LocalityAgents ON LocalityAgents.localityAgentID = Transactions.transactionApprover
        LEFT JOIN Localities ON Localities.localityID = Transactions.transactionStore
        WHERE 
          Transactions.transactionUsed=(?)
          AND 
          Transactions.transactionStore=(?)
          AND 
          STR_TO_DATE(transactionApprovedDate, '%a %b %d %Y %T GMT+0000') >= DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00')
          AND
          STR_TO_DATE(transactionApprovedDate, '%a %b %d %Y %T GMT+0000') <= DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%Y-%m-%d 06:00:00')
        `;
      }
      const transactionUsed = true;
      const selectInvoiceInformationValues = [transactionUsed, transactionStore]
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectInvoiceInformationSQL, selectInvoiceInformationValues);
      console.log(databaseResult);
      if (databaseResult.success){
        var rows = [];
        for (var transactionIndex in databaseResult.result){
          rows.push([
            databaseResult.result[transactionIndex].transactionID,
            databaseResult.result[transactionIndex].transactionNote,
            `${parseFloat(databaseResult.result[transactionIndex].transactionAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}`,
            this.parseDate(databaseResult.result[transactionIndex].transactionDate),
            this.parseDateTime(databaseResult.result[transactionIndex].transactionSystemDate),
            databaseResult.result[transactionIndex].localityName,
            databaseResult.result[transactionIndex].transactionApprover,
            this.parseDateTime(databaseResult.result[transactionIndex].transactionApprovedDate)
          ]);
        }

        const generatePDFPromise = new Promise((resolve, reject) => {
          const invoicePDF = new PDFDocument({margin: 30, size: 'A4'});
          invoicePDF.pipe(fs.createWriteStream('Invoice.pdf'));
      
          invoicePDF.on('finish', () => {
              resolve();
          });
      
          invoicePDF.on('error', (error) => {
              reject(error);
          });
      
          const transactionsTable = {
              title: '',
              headers: ['Número de referencia', 'Descripción', 'Cantidad', 'Fecha del banco', 'Fecha del sistema', 'Localidad', 'Aprovador por', 'Fecha de aprobación'],
              rows: rows
          };
      
          invoicePDF.table(transactionsTable, {width: 530, x: null, y: 100});
          invoicePDF.image('assets/logo.png', 15, 0, {width: 100});
          invoicePDF.fontSize(20).font('Helvetica-Bold').text('Reporte de transacciones', 130, 40);
          invoicePDF.end();
        });

        generatePDFPromise.then(() => {
          const invoiceFile = fs.readFileSync('Invoice.pdf', {encoding: 'base64'});
          generateTodayInvoicePromiseResolve(JSON.stringify({success: true, result: invoiceFile}));
        }).catch((error) => {
            console.error('Error generating PDF:', error);
        });

        /*
        const invoicePDF = new PDFDocument({margin: 30, size: 'A4'});
        invoicePDF.pipe(fs.createWriteStream('Invoice.pdf'));
        
        ;(async function(){
          const transactionsTable = {
            title: '',
            headers: ['Número de referencia', 'Descripción', 'Cantidad', 'Fecha del banco', 'Fecha del sistema', 'Localidad', 'Aprovador por', 'Fecha de aprobación'], 
            rows: rows
          };
          await invoicePDF.table(transactionsTable, {width: 530, x: null, y: 100});
          await invoicePDF.image('assets/logo.png', 15, 0, {width: 100});
          await invoicePDF.fontSize(20).font('Helvetica-Bold').text('Reporte de transacciones', 130, 40);
          
          await invoicePDF.end();

          const invoiceFile = fs.readFileSync('Invoice.pdf', {encoding: 'base64'});
          generateTodayInvoicePromiseResolve(JSON.stringify({success: true, result: invoiceFile}));
        })();
        */


      } else {
        generateTodayInvoicePromiseResolve(JSON.stringify(databaseResult))
      }
    
    });
  },

  generateInvoice: async function(initialDate, endDate, localities, agents){
    return new Promise(async (generateInvoicePromiseResolve) => {
      const dateConditions = []; 
      if (initialDate != ''){
        initialDate = new Date(initialDate);
        initialDate.setHours(initialDate.getHours() + 6);
        initialDate = initialDate.toISOString();
        dateConditions.push(`STR_TO_DATE(transactionApprovedDate, '%a %b %d %Y %H:%i:%s GMT+0000') >= STR_TO_DATE('${initialDate}', '%Y-%m-%dT%H:%i:%s.%fZ')`);
      }
      if (endDate != ''){
        endDate = new Date(endDate);
        endDate.setHours(endDate.getHours() + 30);
        endDate = endDate.toISOString();
        dateConditions.push(`STR_TO_DATE(transactionApprovedDate, '%a %b %d %Y %H:%i:%s GMT+0000') <= STR_TO_DATE('${endDate}', '%Y-%m-%dT%H:%i:%s.%fZ')`);
      }
      const dateWhereClause = dateConditions.length > 0 ? `AND ${dateConditions.join(' AND ')}` : '';

      const localityConditions = [];
      if (localities.length > 0) {
        localities.forEach(locality => {
          localityConditions.push(`transactionStore = '${locality}'`);
        });
      }
      const localityWhereClause = localityConditions.length > 0 ? `AND (${localityConditions.join(' OR ')})` : '';

      const agentConditions = [];
      if (agents.length > 0) {
        agents.forEach(agent => {
          agentConditions.push(`transactionApprover = '${agent}'`);
        });
      }
      const agentWhereClause = agentConditions.length > 0 ? `AND (${agentConditions.join(' OR ')})` : '';

      var selectInvoiceInformationSQL = 
      `
      SELECT
        Transactions.transactionID,
        Transactions.transactionNote,
        Transactions.transactionAmount,
        Transactions.transactionDate,
        Transactions.transactionSystemDate,
        Localities.localityName,
        COALESCE(Agents.agentName, LocalityAgents.localityAgentName) as transactionApprover,
        Transactions.transactionApprovedDate
      FROM Transactions
      LEFT JOIN Agents ON Agents.agentID = Transactions.transactionApprover
      LEFT JOIN LocalityAgents ON LocalityAgents.localityAgentID = Transactions.transactionApprover
      LEFT JOIN Localities ON Localities.localityID = Transactions.transactionStore
      WHERE transactionUsed = (?)
      `;
      selectInvoiceInformationSQL = selectInvoiceInformationSQL + dateWhereClause + localityWhereClause + agentWhereClause;

      const transactionUsed = true;
      const selectInvoiceInformationValues = [transactionUsed]
      const databaseResult = await databaseManagementFunctions.executeDatabaseSQL(selectInvoiceInformationSQL, selectInvoiceInformationValues);
      if (databaseResult.success){
        var rows = [];
        for (var transactionIndex in databaseResult.result){
          rows.push([
            databaseResult.result[transactionIndex].transactionID,
            databaseResult.result[transactionIndex].transactionNote,
            `${parseFloat(databaseResult.result[transactionIndex].transactionAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}`,
            this.parseDate(databaseResult.result[transactionIndex].transactionDate),
            this.parseDateTime(databaseResult.result[transactionIndex].transactionSystemDate),
            databaseResult.result[transactionIndex].localityName,
            databaseResult.result[transactionIndex].transactionApprover,
            this.parseDateTime(databaseResult.result[transactionIndex].transactionApprovedDate)
          ]);
        }

        const invoicePDF = new PDFDocument({margin: 30, size: 'A4'});
        invoicePDF.pipe(fs.createWriteStream('Invoice.pdf'));
        
        ;(async function(){
          const transactionsTable = {
            title: '',
            headers: ['Número de referencia', 'Descripción', 'Cantidad', 'Fecha del banco', 'Fecha del sistema', 'Localidad', 'Aprovador por', 'Fecha de aprobación'], 
            rows: rows
          };
          await invoicePDF.table(transactionsTable, {width: 530, x: null, y: 100});
          await invoicePDF.image('assets/logo.png', 15, 0, {width: 100});
          await invoicePDF.fontSize(20).font('Helvetica-Bold').text('Reporte de transacciones', 130, 40);
          
          await invoicePDF.end();

          const invoiceFile = fs.readFileSync('Invoice.pdf', {encoding: 'base64'});
          generateInvoicePromiseResolve(JSON.stringify({success: true, result: invoiceFile}));

        })();


      } else {
        generateInvoicePromiseResolve(JSON.stringify(databaseResult))
      }
    
    });
  },


}