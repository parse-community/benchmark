jest.mock('ora');
jest.mock('pidusage');
jest.mock('../src/http-benchmark');
jest.mock('../src/utils');

const { fork } = require('child_process');
const httpBenchmark = require('../src/http-benchmark');
const bench = require('../src/bench');
const utils = require('../src/utils');
const Parse = require('../src/parse');
const spinner = require('ora');
const path = require('path');

const data = [{
  'mongo get': {
    requests: { average: 5 },
    latency: { average: 1.5, max: 2 },
    throughput: { average: 130000000, max: 200000000 },
    cpu: 93.75,
    memory: 120000000,
  }
}];

describe('bench', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    spinner.mockReturnValue({
      start: () => {
        return {
          fail: () => {},
          succeed: () => {},
        };
      },
    });
  });

  it('start', async () => {
    jest.spyOn(httpBenchmark, 'run').mockImplementation(() => data[0]['mongo get']);

    const opts = { output: 'test.json' };
    await bench.start(opts, ['mongo'], ['get']);
    expect(utils.cliTable).toHaveBeenCalled();
    expect(utils.saveToFile).toHaveBeenCalledWith('test.json', data);
  });

  it('start with index greater than 1', async () => {
    jest.spyOn(httpBenchmark, 'run').mockImplementation(() => data[0]['mongo get']);

    const opts = { output: 'test.json' };
    await bench.start(opts, ['mongo'], ['get'], [], 1);
    expect(utils.cliTable).toHaveBeenCalled();
    expect(utils.saveToFile).toHaveBeenCalledWith('test.json', []);
  });

  it('start should catch error', async () => {
    jest.spyOn(utils, 'cliTable').mockImplementation(() => { throw 'error here'; });
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const opts = { output: 'test.json' };
    await bench.start(opts, [], [], 0);
    expect(console.error).toHaveBeenCalledWith('error here');
  });

  it('runTest', (done) => {
    jest.spyOn(httpBenchmark, 'run').mockImplementation(() => data[0]['mongo get']);
    const opts = { output: 'test.json' };
    bench.runTest(opts, 'mongo', ['get']).then((results) => {
      expect(results).toEqual(data);
      done();
    });
  });

  it('runTest should print error', (done) => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(httpBenchmark, 'run').mockImplementation(() => { throw 'error here'; });
    const opts = { output: 'test.json' };
    bench.runTest(opts, 'mongo', ['get']).then(() => {
      expect(console.error).toHaveBeenCalledWith('error here');
      done();
    });
  });

  it('should clear database', async (done) => {
    const serverPath = path.join(__dirname, '..', 'servers', 'mongo');
    const serverProcess = fork(serverPath);

    serverProcess.on('message', async (m) => {
      if (m.start) {
        const object = new Parse.Object('TestObject');
        object.set('hello', 'world');
        await object.save();

        const query = new Parse.Query('TestObject');
        const result = await query.get(object.id);
        expect(result.get('hello', 'world'));

        serverProcess.kill('SIGINT');
      }
    });
    serverProcess.on('close', () => {
      const newProcess = fork(serverPath);

      newProcess.on('message', async (m) => {
        if (m.start) {
          const query = new Parse.Query('TestObject');
          const results = await query.find();
          expect(results.length).toBe(0);

          newProcess.kill('SIGINT');
        }
      });
      newProcess.on('close', () => {
        done();
      });
    });
  });
});
