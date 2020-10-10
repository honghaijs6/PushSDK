const assert = require('assert');
const app = require('../../src/app');

describe('\'renew_tickets\' service', () => {
  it('registered the service', () => {
    const service = app.service('renew-tickets');

    assert.ok(service, 'Registered the service');
  });
});
