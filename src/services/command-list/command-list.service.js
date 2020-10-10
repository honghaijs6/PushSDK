// Initializes the `commandList` service on path `/command-list`
const { CommandList } = require('./command-list.class');
const createModel = require('../../models/command-list.model');
const hooks = require('./command-list.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/command-list', new CommandList(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('command-list');

  service.hooks(hooks);
};
