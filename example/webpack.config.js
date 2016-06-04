const ChunksApiPlugin = require('webpack-chunks-api-plugin').default;
const path = require('path');

module.exports = {
  entry: './entry.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
  plugins: [
    new ChunksApiPlugin(),
  ],
};
