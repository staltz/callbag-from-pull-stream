/**
 * callbag-from-pull-stream
 * ------------------------
 *
 * Convert a pull-stream to a pullable callbag source.
 *
 * `npm install callbag-from-pull-stream`
 *
 * Example:
 *
 *     const pull = require('pull-stream');
 *     const {pipe, filter, forEach} = require('callbag-basics');
 *     const fromPullStream = require('callbag-from-pull-stream');
 *
 *     const source = pull(
 *       pull.values([1,3,5,7,9]),
 *       pull.filter(x => x !== 5), // 1,3,7,9
 *       pull.map(x => x * 10) // 10,30,70,90
 *     )
 *
 *     pipe(
 *       fromPullStream(source),
 *       filter(x => x !== 30), // 10,70,90
 *       forEach(x => console.log(x))
 *     )
 */

const fromPullStream = read => (start, sink) => {
  if (start !== 0) return;
  sink(0, (t, d) => {
    if (t === 1) read(null, (end, data) => {
      if (end === true) sink(2);
      else if (end) sink(2, end);
      else sink(1, data);
    });
    if (t === 2) read(d || true, () => {});
  });
};

module.exports = fromPullStream;
