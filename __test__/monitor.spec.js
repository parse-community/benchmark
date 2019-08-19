const monitor = require('../src/monitor');

describe('monitor', () => {
  it('usage', () => {
    jest.spyOn(process, 'memoryUsage')
      .mockImplementationOnce(() => {
        return { rss: 100, heapUsed: 200, heapTotal: 300 };
      })
      .mockImplementationOnce(() => {
        return { rss: 200, heapUsed: 400, heapTotal: 600 };
      });

    const m = new monitor();

    process.cpuUsage = jest.fn(() => {
      return { user: 4000, system: 8000 };
    });
    process.hrtime = jest.fn(() => {
      return [ 2, 0 ];
    });

    const meter = m.stop('test');

    expect(meter).toEqual({
      ram: 100,
      heapUsed: 200,
      heapTotal: 300,
      cpu: 6,
    });
  });

  it('debug', () => {
    process.env.DEBUG = true;
    jest.spyOn(console, 'log');

    const m = new monitor();
    m.stop('test');

    expect(console.log).toHaveBeenCalledTimes(6);
  });
});
