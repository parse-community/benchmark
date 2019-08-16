'use strict';

const Parse = require('../parse');

module.exports = {
  getRequests: async () => {
    const object = new Parse.Object('TestObject');
    object.set('foo', 'bar');
    await object.save();

    return [{
      path: '/classes/TestObject',
      method: 'GET',
      body: JSON.stringify({ objectId: object.id }),
    }];
  }
};
