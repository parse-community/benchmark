const testPost = require('../benchmarks/post');
const testGet = require('../benchmarks/get');
const Parse = require('../src/parse');

describe('benchmarks', () => {
  it('simple-post', async () => {
    const requests = await testPost.getRequests();
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
    const requests = await testGet.getRequests();
    expect(requests.length).toBe(1);
    expect(requests[0].method).toBe('GET');
    expect(requests[0].path).toBe('/classes/TestObject/uid1');
  });
});
