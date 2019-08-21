const child_process = require('child_process');

module.exports = function (app) {
  const MAX_PROCESSES = 1;
  const PROCESSES = [];
  const QUEUE = [];
  let uniqueId = 0;

  function tryToReleaseQueue() {
    if (PROCESSES.length >= MAX_PROCESSES || !QUEUE.length) {
      return false;
    }
    const next = QUEUE.shift();

    const process = child_process[next.func](...next.args);
    PROCESSES.push(process);

    app.log(`ProcessQueue: Run ${next.id}`);
    process.on('exit', function () {
      app.log(`ProcessQueue: Terminate ${next.id}`);
      removeTerminatedProcess(process);
    });
    return true;
  }

  function removeTerminatedProcess(process) {
    for (let i = 0; i < PROCESSES.length; i++) {
      if (PROCESSES[i] === process) {
        PROCESSES.splice(i, 1);
        break;
      }
    }
    setImmediate(tryToReleaseQueue);
  }

  function getProcesses() {
    return PROCESSES;
  }

  function getQueue() {
    return QUEUE;
  }

  function any(func) {
    return function(/* command, options, callback */) {
      const args = Array.prototype.slice.call(arguments, 0);
      const task = {
        id: '_' + uniqueId++,
        args,
        func,
      };
      app.log(`ProcessQueue: Queue ${task.id}`);
      QUEUE.push(task);
      tryToReleaseQueue();

      return task;
    };
  }

  function flush() {
    PROCESSES.forEach(p => p.exit(0));
    uniqueId = 0;
  }

  return {
    spawn: any('spawn'),
    exec: any('exec'),
    flush,
    getQueue,
    getProcesses,
    tryToReleaseQueue,
    removeTerminatedProcess,
  };
};
