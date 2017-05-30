# webpack-chunks-api-plugin

[![Greenkeeper badge](https://badges.greenkeeper.io/elliottsj/webpack-chunks-api-plugin.svg)](https://greenkeeper.io/)
[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)
[![npm](https://img.shields.io/npm/v/webpack-chunks-api-plugin.svg)](https://www.npmjs.com/package/webpack-chunks-api-plugin)

webpack plugin to make chunk information available to the bundle via `__webpack_chunks__`

### Installation
```bash
npm install webpack@1 webpack-chunks-api-plugin
```

### Usage
```js
// webpack.config.js
const ChunksApiPlugin = require('webpack-chunks-api-plugin');

module.exports = {
  // ...
  plugins: [
    new ChunksApiPlugin(),
  ],
};
```

Then, in your bundle, you can access the IDs and paths of dynamically-loaded chunks via `__webpack_chunks__`. *Note: `__webpack_chunks__` only includes dynamically-loaded chunks; the entry chunk is not included.*

### Example
```js
console.info(JSON.stringify(__webpack_chunks__));
// [{"id":1,"path":"1.bundle.js"},{"id":2,"path":"2.bundle.js"}]
```

See [example/](example) for more.
