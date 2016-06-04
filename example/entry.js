console.info('entry', JSON.stringify(__webpack_chunks__));

require.ensure([], function (require) {
  require('./chunk1');
  console.info('entry loaded chunk1', JSON.stringify(__webpack_chunks__));
});
