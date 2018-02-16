const test = require('tape');
const pull = require('pull-stream');
const fromPullStream = require('./readme');

test('it sends sync pull-stream data to a puller sink', t => {
  t.plan(13);
  const pullsource = pull(
    pull.values([1, 2, 3]),
    pull.map(x => x * 10)
  );

  const downwardsExpectedTypes = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [1, 'number'],
    [2, 'undefined'],
  ];
  const downwardsExpected = [10, 20, 30];

  const source = fromPullStream(pullsource);

  let talkback;
  source(0, (type, data) => {
    const et = downwardsExpectedTypes.shift();
    t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
    t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);

    if (type === 0) {
      talkback = data;
      talkback(1);
      return;
    }
    if (type === 1) {
      const e = downwardsExpected.shift();
      t.equals(data, e, 'downwards data is expected: ' + e);
      talkback(1);
    }
  });
});

test('it sends ASYNC pull-stream data to a puller sink', t => {
  t.plan(14);
  const pullsource = pull(
    pull.values([1, 2, 3]),
    pull.asyncMap((x, cb) => {
      setTimeout(() => cb(null, x * 10), 100);
    })
  );

  const downwardsExpectedTypes = [
    [0, 'function'],
    [1, 'number'],
    [1, 'number'],
    [1, 'number'],
    [2, 'undefined'],
  ];
  const downwardsExpected = [10, 20, 30];

  const source = fromPullStream(pullsource);

  let talkback;
  source(0, (type, data) => {
    const et = downwardsExpectedTypes.shift();
    t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
    t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);

    if (type === 0) {
      talkback = data;
      talkback(1);
      return;
    }
    if (type === 1) {
      const e = downwardsExpected.shift();
      t.equals(data, e, 'downwards data is expected: ' + e);
      talkback(1);
    }
  });

  setTimeout(() => {
    t.pass('nothing else happens');
    t.end();
  }, 700);
});

