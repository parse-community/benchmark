'use strict';
const events = require('events');

const child_process = {
  spawn: () => {
    const taskProcess = new events.EventEmitter();
    taskProcess.exit = () => {
      taskProcess.emit('exit');
    };
    return taskProcess;
  },
};

module.exports = child_process;
