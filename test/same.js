'use strict';
const test = require('tape');
const { Plugin } = require('../index');

test('should keep the same naughtyString by default', function (t) {
  t.plan(4);

  let script = {
    config: {},
    scenarios: []
  };

  t.doesNotThrow(() => {
    t.ok(new Plugin(script));

    let ctx = { vars: {} };
    let fn = script.config.processor.fuzzerPluginCreateVariable;
    t.ok(fn, 'should create the fuzzerPluginCreateVariable function');
    fn(ctx, {}, () => {
      t.equal(ctx.vars.naughtyString, ctx.vars.naughtyString, 'should be the same');
    });
  });
});

test('should change the same naughtyString on each access', function (t) {
  t.plan(4);

  let script = {
    config: { plugins: { fuzzer: { same: false, random: false } } },
    scenarios: []
  };

  t.doesNotThrow(() => {
    t.ok(new Plugin(script));

    let ctx = { vars: {} };
    let fn = script.config.processor.fuzzerPluginCreateVariable;
    t.ok(fn, 'should create the fuzzerPluginCreateVariable function');
    fn(ctx, {}, () => {
      t.notEqual(ctx.vars.naughtyString, ctx.vars.naughtyString, 'should not be the same');
    });
  });
});

test('should sequentially update the naughtyString on each access', function (t) {
  t.plan(5);

  let script1 = {
    config: { plugins: { fuzzer: { same: false, random: false } } },
    scenarios: []
  };

  let script2 = {
    config: { plugins: { fuzzer: { same: false, random: false } } },
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
        t.notEqual(ns1a[0], ns1a[1], 'should have different naughtyStrings');
        t.deepEqual(ns1a, ns2a, 'all naughtyStrings should be the same');
      });
    });
  });
});
