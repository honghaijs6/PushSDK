const assert = require('assert');
const app = require('../../src/app');

describe('\'command_logs\' service', () => {
  it('registered the service', () => {
    const service = app.service('command-logs');

    assert.ok(service, 'Registered the service');
  });
});
