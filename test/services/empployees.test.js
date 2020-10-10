const assert = require('assert');
const app = require('../../src/app');

describe('\'empployees\' service', () => {
  it('registered the service', () => {
    const service = app.service('empployees');

    assert.ok(service, 'Registered the service');
  });
});
