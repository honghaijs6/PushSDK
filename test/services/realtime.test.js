const assert = require('assert');
const app = require('../../src/app');

describe('\'realtime\' service', () => {
  it('registered the service', () => {
    const service = app.service('realtime');

    assert.ok(service, 'Registered the service');
  });
});
