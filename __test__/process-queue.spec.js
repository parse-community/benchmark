jest.mock('child_process');
jest.useFakeTimers();

const ProcessQueue = require('../src/process-queue');

const mockApp = {
  log: () => {},
};

describe('process-queue', () => {
  let appSpy;
  let queue;
  beforeEach(() => {
    jest.restoreAllMocks();
    appSpy = jest.spyOn(mockApp, 'log');
    queue = ProcessQueue(mockApp);
  });

  afterEach(() => {
    queue.flush();
  });

  it('can queue one task', () => {
    const task = queue.spawn('npm', ['run', 'benchmarks']);
    expect(task).toEqual({
      id: '_0',
      args: [ 'npm', [ 'run', 'benchmarks' ] ],
      func: 'spawn',
    });
    expect(appSpy.mock.calls).toEqual([
      ["ProcessQueue: Queue _0"],
      ["ProcessQueue: Run _0"],
    ]);
    expect(queue.getQueue().length).toBe(0);
    expect(queue.getProcesses().length).toBe(1);

    const taskProcess = queue.getProcesses()[0];
    appSpy.mockClear();
    taskProcess.exit(0);
    expect(appSpy.mock.calls).toEqual([
      ["ProcessQueue: Terminate _0"],
    ]);
    expect(queue.getQueue().length).toBe(0);
    expect(queue.getProcesses().length).toBe(0);
  });

  it('can queue two tasks', () => {
    const task1 = queue.spawn();
    const task2 = queue.spawn();
    expect(task1.id).toBe('_0');
    expect(task2.id).toBe('_1');
    expect(appSpy.mock.calls).toEqual([
      ["ProcessQueue: Queue _0"],
      ["ProcessQueue: Run _0"],
      ["ProcessQueue: Queue _1"],
    ]);
    expect(queue.getQueue().length).toBe(1);
    expect(queue.getProcesses().length).toBe(1);

    const task1Process = queue.getProcesses()[0];
    appSpy.mockClear();
    task1Process.exit(0);
    jest.runAllImmediates();
    expect(appSpy.mock.calls).toEqual([
      ["ProcessQueue: Terminate _0"],
      ["ProcessQueue: Run _1"],
    ]);
    expect(queue.getQueue().length).toBe(0);
    expect(queue.getProcesses().length).toBe(1);

    const task2Process = queue.getProcesses()[0];
    appSpy.mockClear();
    task2Process.exit(0);
    jest.runAllImmediates();
    expect(appSpy.mock.calls).toEqual([
      ["ProcessQueue: Terminate _1"],
    ]);
    expect(queue.getQueue().length).toBe(0);
    expect(queue.getProcesses().length).toBe(0);
  });

  it('can queue 5 tasks', () => {
    queue.spawn();
    queue.spawn();
    queue.spawn();
    queue.spawn();
    queue.spawn();
    expect(queue.getQueue().length).toBe(4);
    expect(queue.getProcesses().length).toBe(1);

    queue.getProcesses()[0].exit(0);
    jest.runAllImmediates();
    queue.getProcesses()[0].exit(0);
    jest.runAllImmediates();
    queue.getProcesses()[0].exit(0);
    jest.runAllImmediates();
    queue.getProcesses()[0].exit(0);
    jest.runAllImmediates();
    queue.getProcesses()[0].exit(0);
    jest.runAllImmediates();

    expect(appSpy.mock.calls).toEqual([
      [ 'ProcessQueue: Queue _0' ],
      [ 'ProcessQueue: Run _0' ],
      [ 'ProcessQueue: Queue _1' ],
      [ 'ProcessQueue: Queue _2' ],
      [ 'ProcessQueue: Queue _3' ],
      [ 'ProcessQueue: Queue _4' ],
      [ 'ProcessQueue: Terminate _0' ],
      [ 'ProcessQueue: Run _1' ],
      [ 'ProcessQueue: Terminate _1' ],
      [ 'ProcessQueue: Run _2' ],
      [ 'ProcessQueue: Terminate _2' ],
      [ 'ProcessQueue: Run _3' ],
      [ 'ProcessQueue: Terminate _3' ],
      [ 'ProcessQueue: Run _4' ],
      [ 'ProcessQueue: Terminate _4' ]
    ]);
  });

  it('can flush', () => {
    queue.spawn();
    queue.spawn();
    queue.flush();
    jest.runAllImmediates();
    expect(appSpy.mock.calls).toEqual([
      [ 'ProcessQueue: Queue _0' ],
      [ 'ProcessQueue: Run _0' ],
      [ 'ProcessQueue: Queue _1' ],
      [ 'ProcessQueue: Terminate _0' ],
      [ 'ProcessQueue: Run _1' ]
    ]);
  });
});
