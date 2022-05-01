'use strict';
const test = require('tape');
const { Plugin } = require('../index');

test('should randomly update the naughtyString on each access', function (t) {
  t.plan(4);

  let script1 = {
    config: { plugins: { fuzzer: { same: false, random: true } } },
    scenarios: []
  };

  let script2 = {
    config: { plugins: { fuzzer: { same: false, random: true } } },
    scenarios: []
  };

  t.doesNotThrow(() => {
    t.ok(new Plugin(script1));
    t.ok(new Plugin(script2));

    let ctx1 = { vars: {} };
    let ctx2 = { vars: {} };
    let fn1 = script1.config.processor.fuzzerPluginCreateVariable;
    let fn2 = script2.config.processor.fuzzerPluginCreateVariable;
    fn1(ctx1, {}, () => {
      fn2(ctx2, {}, () => {
        let ns1a = new Array(100).fill().map(() => ctx1.vars.naughtyString);
        let ns2a = new Array(100).fill().map(() => ctx2.vars.naughtyString);
        t.notDeepEqual(ns1a, ns2a, 'all naughtyStrings should be different');
      });
    });
  });
});
