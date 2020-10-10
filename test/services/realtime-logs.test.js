const assert = require('assert');
const app = require('../../src/app');

describe('\'realtimeLogs\' service', () => {
  it('registered the service', () => {
    const service = app.service('realtime-logs');

    assert.ok(service, 'Registered the service');
  });
});
