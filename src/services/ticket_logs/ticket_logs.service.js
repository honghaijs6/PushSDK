// Initializes the `ticket_logs` service on path `/ticket-logs`
const { TicketLogs } = require('./ticket_logs.class');
const createModel = require('../../models/ticket_logs.model');
const hooks = require('./ticket_logs.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/ticket-logs', new TicketLogs(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('ticket-logs');

  service.hooks(hooks);
};
