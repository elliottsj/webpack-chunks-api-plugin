import ConstDependency from 'webpack/lib/dependencies/ConstDependency';
import BasicEvaluatedExpression from 'webpack/lib/BasicEvaluatedExpression';

export default class ChunksApiPlugin {
  apply(compiler) {
    compiler.plugin('compilation', (compilation) => {
      compilation.mainTemplate.plugin(
        'require-ensure',
        function requireEnsurePlugin(source, chunk, hash) {
          /*
           * Stolen from
           * https://github.com/webpack/webpack/blob/01ea02a95cf8c446fd1dc9e82fae0febe9332034/lib/JsonpMainTemplatePlugin.js#L43-L61
           */
          const filename = this.outputOptions.filename || 'bundle.js';
          const chunkFilename = this.outputOptions.chunkFilename || `[id].${filename}`;
          const chunkMaps = chunk.getChunkMaps();
          const assetPath = this.applyPluginsWaterfall(
            'asset-path',
            JSON.stringify(chunkFilename),
            {
              hash: `" + ${this.renderCurrentHashCode(hash)} + "`,
              hashWithLength: length => `" + ${this.renderCurrentHashCode(hash, length)} + "`,
              chunk: {
                id: '" + chunkId + "',
                hash: `" + ${JSON.stringify(chunkMaps.hash)}[chunkId] + "`,
                hashWithLength: (length) => {
                  const shortChunkHashMap = Object.keys(chunkMaps.hash)
                    .filter(chunkId => typeof chunkMaps.hash[chunkId] === 'string')
                    .reduce((acc, chunkId) => ({
                      ...acc,
                      [chunkId]: chunkMaps.hash[chunkId].substr(0, length),
                    }), {});
                  return `" + ${JSON.stringify(shortChunkHashMap)}[chunkId] + "`;
                },
                name: `" + (${JSON.stringify(chunkMaps.name)}[chunkId]||chunkId) + "`,
              },
            }
          );

          /*
           * Wrap the normal requireEnsure function (`source`) in an IIFE with a modified callback
           * function, which appends the loaded chunk info to `__webpack_requre__.c`
           */
          return this.asString([
            '(function loadChunk(callback) {',
            this.indent(source),
            '}(function() {',
            this.indent([
              `if (${this.requireFn}.c.filter(function (chunk) {`,
              this.indent([
                'return chunk.id === chunkId;',
              ]),
              '}).length !== 0) {',
              this.indent([
                `${this.requireFn}.c.push({`,
                this.indent([
                  'id: chunkId,',
                  `path: ${this.requireFn}.p + ${assetPath}`,
                ]),
                '});',
              ]),
              '}',
              'callback.apply(this, arguments);',
            ]),
            '}));',
          ]);
        }
      );

      /*
       * Initialize the `__webpack_require__.c` array
       */
      compilation.mainTemplate.plugin(
        'require-extensions',
        function requireExtensionPlugin(source) {
          return this.asString([
            source,
            '',
            '// __webpack_chunks__',
            `${this.requireFn}.c = [];`,
          ]);
        }
      );
    });

    /*
     * Below is stolen from
     * https://github.com/webpack/webpack/blob/01ea02a95cf8c446fd1dc9e82fae0febe9332034/lib/HotModuleReplacementPlugin.js#L162-L170
     */

    /*
     * Transform `__webpack_chunks__` expressions to `__webpack_require__.c`
     */
    compiler.parser.plugin(
      'expression __webpack_chunks__',
      function webpackChunksExpressionPlugin(expr) {
        const dep = new ConstDependency('__webpack_require__.c', expr.range);
        dep.loc = expr.loc;
        this.state.current.addDependency(dep);
        return true;
      }
    );

    /*
     * Transform `typeof __webpack_chunks__` expressions to `'string'`
     */
    compiler.parser.plugin('evaluate typeof __webpack_chunks__',
      expr => new BasicEvaluatedExpression().setString('string').setRange(expr.range)
    );
  }
}
