console.info('chunk1', JSON.stringify(__webpack_chunks__));

require.ensure([], function (require) {
  require('./chunk2');
  console.info('chunk1 loaded chunk2', JSON.stringify(__webpack_chunks__));
});
