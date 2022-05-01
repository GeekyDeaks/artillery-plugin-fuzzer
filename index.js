'use strict';

const blns = require('./data/blns.json');
const debug = require('debug')('plugin:fuzzer');

module.exports.Plugin = FuzzerPlugin;
module.exports.pluginInterfaceVersion = 2;

function FuzzerPlugin (script, events) {
  this.script = script;
  this.events = events;

  if (!script.config.processor) {
    script.config.processor = {};
  }

  script.config.processor.fuzzerPluginCreateVariable = fuzzerPluginCreateVariable;

  script.scenarios.forEach(function (scenario) {
    if (!scenario.beforeRequest) {
      scenario.beforeRequest = [];
    }

    scenario.beforeRequest.push('fuzzerPluginCreateVariable');

    if (['socketio', 'ws'].includes(scenario.engine)) {
      scenario.flow.unshift({function: 'fuzzerPluginCreateVariable'});
    }
  });

  let config = Object.assign({ same: true, random: true },
    script.config.plugins && script.config.plugins.fuzzer);

  let index = 0;
  function nextNaughtyString () {
    let ns;
    if (config.random) {
      ns = blns[Math.floor(Math.random() * blns.length)];
    } else {
      ns = blns[index];
      index = (index + 1) % blns.length;
    }
    debug(`nextNaughtyString: '${ns}'`);
    return ns;
  }

  function fuzzerPluginCreateVariable (req, userContext, events, done) {
    let ctx = userContext;
    let cb = done;

    if (arguments.length === 3) {
      // called as a "function"
      ctx = req;
      cb = events;
    }

    if (config.same) {
      ctx.vars.naughtyString = nextNaughtyString();
    } else {
      Object.defineProperty(ctx.vars, 'naughtyString', {
        get: nextNaughtyString
      });
    }
    return cb();
  }

  debug('Plugin initialized');
  return this;
}
