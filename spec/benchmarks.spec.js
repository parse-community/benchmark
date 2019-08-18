const simplePost = require('../benchmarks/simple-post');
const simpleGet = require('../benchmarks/simple-get');
const Parse = require('../src/parse');

describe('benchmarks', () => {
  it('simple-post', () => {
    const requests = simplePost.getRequests();
    expect(requests.length).toBe(1);
    expect(requests[0].method).toBe('POST');
    expect(requests[0].path).toBe('/classes/TestObject');
    expect(requests[0].body).toBe('{"testValue":1}');
  });

  it('simple-get', async () => {
    Parse.CoreManager.setRESTController({
      request() {
        return Promise.resolve({
          objectId: 'uid1'
        }, 200);
      },
      ajax() {}
    });
    const requests = await simpleGet.getRequests();
    expect(requests.length).toBe(1);
    expect(requests[0].method).toBe('GET');
    expect(requests[0].path).toBe('/classes/TestObject');
    expect(requests[0].body).toBe('{"objectId":"uid1"}');
  });
});
