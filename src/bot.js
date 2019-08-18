const ChildProcess = require('child_process');

module.exports = app => {
  const queue = ChildProcessQueue(app);

  app.log('Bot was loaded!');
  app.on('pull_request.closed', async context => {
    const pr = context.payload.pull_request;
    if (pr.merged_at) {
      queue.spawn('npm', ['run', 'benchmarks'], {
        stdio: 'inherit',
        env: Object.assign({
          SHA1: pr.merge_commit_sha,
        }, process.env),
      });
    }
  });
};
let unique_id = 0;

const ChildProcessQueue = function (app) {
  const MAX_PROCESSES = 1;
  const PROCESSES = [];
  const QUEUE = [];

  const tryToReleaseQueue = function () {
    if (PROCESSES.length >= MAX_PROCESSES || !QUEUE.length) {
      return false;
    }
    const next = QUEUE.shift();

    const process = ChildProcess[next.func](...next.args);
    PROCESSES.push(process);

    app.log(`[ChildProcessQueue: Run #${next.id}`);
    process.on('exit', function () {
      app.log(`[ChildProcessQueue: Terminate #${next.id}`);
      removeTerminatedProcess(process);
    });
    return true;
  };

  const removeTerminatedProcess = function (process) {
    for (let i = 0; i < PROCESSES.length; i++) {
      if (PROCESSES[i] === process) {
        PROCESSES.splice(i, 1);
        break;
      }
    }
    setImmediate(tryToReleaseQueue);
  };

  const any = function(func) {
    return function(/* command, options, callback */) {
      const args = Array.prototype.slice.call(arguments, 0);
      const task = {
        id: '_' + unique_id++,
        args,
        func,
      };
      app.log(`[ChildProcessQueue: Queue ${task.id}`);
      QUEUE.push(task);

      tryToReleaseQueue();

      return task.id;
    };
  };

  return {
    spawn: any('spawn'),
    exec: any('exec'),
  };
};
