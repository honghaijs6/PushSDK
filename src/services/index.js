
const commands = require('./commands/commands.service.js');
const commandList = require('./command-list/command-list.service.js');
const devices = require('./devices/devices.service.js');
const realtimeLogs = require('./realtime-logs/realtime-logs.service.js');


//NEDB
const employees = require('./employees/employees.service.js');


// MYSQL DB
//const tickets = require('./tickets/tickets.service.js');
//const ticketLogs = require('./ticket_logs/ticket_logs.service.js');


// NEDB
const commandLogs = require('./command_logs/command_logs.service.js');
const queryLogs = require('./query_logs/query_logs.service.js');



const renewTickets = require('./renew_tickets/renew_tickets.service.js');



const liveCode = require('./live-code/live-code.service.js');



const realtime = require('./realtime/realtime.service.js');



// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(commands);
  app.configure(commandList);
  app.configure(devices);
  app.configure(realtimeLogs);


  app.configure(employees);
  //app.configure(tickets);
  //app.configure(ticketLogs);
  app.configure(commandLogs);
  app.configure(queryLogs);
  app.configure(renewTickets);
  app.configure(liveCode);
  app.configure(realtime);
};
