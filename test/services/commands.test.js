const assert = require('assert');
const app = require('../../src/app');

describe('\'commands\' service', () => {
  it('registered the service', () => {
    const service = app.service('commands');

    assert.ok(service, 'Registered the service');
  });
});
