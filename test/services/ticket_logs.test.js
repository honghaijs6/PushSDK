const assert = require('assert');
const app = require('../../src/app');

describe('\'ticket_logs\' service', () => {
  it('registered the service', () => {
    const service = app.service('ticket-logs');

    assert.ok(service, 'Registered the service');
  });
});
