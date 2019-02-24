# My Webpack Knowledge Base

Notes and examples related to parts of Webpack that are not easy to understand for new comers.

Based on Webpack 4.


## Configuration

- `entry` object is used to map multiple chunk entries - it's agnostic from how you serve the assets (or routing/navigation). these are how you want webpack to start bundling your app based on js source code
- general confusion: `output.path` vs `output.publicPath`
- `output.path` is the location (directory) where the output assets will be emitted to. Think file system. Very simple. Must be an absolute path.
- `output.publicPath` is the path (think URL) where the assets can be loaded **from browsers**.
  - This can be like `/static/` (server-root relative), `static/` (document relative-generally is not used) or url like `https://my.cdn.com/`.
  - Many webpack plugins (affecting extracted css, css image-url) uses this information to resolve the correct file paths.
  - webpack-dev-middleware/server also uses this information to serve assets (js bundles, on-demand chunks, css, images).
  - > For loaders that embed `<script>` or `<link>` tags or reference assets like images, `publicPath` is used as the `href` or `url()` to the file when it's different than their location on disk (as specified by `path`). [Ref](https://github.com/webpack/docs/wiki/configuration#outputpublicpath)
  - avaiable at runtime global as `__webpack_public_path__`
- general confusion: `output.filename` vs `output.chunkFilename`
- `output.filename` is the name pattern to use for entry chunks
- `output.chunkFilename` is the name pattern to use for non-entry chunks (on-demand, code splitted chunks)
  - part that I don't understand is that when I use `optimization.runtimeChunk: true` all chunks (like main, vendor~main) uses the `chunkFilename` pattern except that `runtime~main` uses the `output.filename` pattern. [related webpack issue](https://github.com/webpack/webpack/issues/6598)
- `[hash]` is the hash of the entire compilation—all assets will use the same hash
- `[chunkhash]` is the hash of the content of the entry's chunk
- `[contenthash]` is the hash of only the content (e.g. extracted css content)
- `externals` is a way to "exclude" modules/node_modules from the output bundle
  - the bundle will rely on those modules from the runtime environment
  - no external means anything that is imported will be part of the output bundle
- `optimization.splitChunks.chunks` tells the type of chunk splitting to use
  - accepts 3 values `"async" | "initial" | "all"`
  - the __default__ is `"async"` meaning all code-splitting (via `import()`) will be splitted and extract into a separate bundle hence if you do not use `"all"` you don't see the common modules like React extracted into a separate chunk.
  - `"all"` will split on-demand (async) chunks (like `"async"`) as well as sync chunks (e.g. `import React from 'react'`). It is not enabled by default because your html generation needs a way to include the dynamic initial assets (number of assets and their names).
  - `"initial"` will split only initial (dub: entry, sync) chunks
  - example of the 3 `chunks` modes [Webpack 4 — Mysterious SplitChunks Plugin @ Hemal Patel](https://medium.com/dailyjs/webpack-4-splitchunks-plugin-d9fbbe091fd0)
  - how SplitChunksPlugin works -> [RIP CommonsChunkPlugin @ Sokra](https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693) | [webpack 4: Code Splitting, chunk graph and the splitChunks optimization @ Sokra](https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366)
- `runtimeChunk`:
  - `'single'` or `true` will generates a single runtime chunk that contains all module mappings that is used across all entry chunks
  - `'multiple'` is more optimized an will generate one runtime chunk for each entry which contains only the mapping of the modules that is part of that entry


## Terminology

- **chunk** (vs module vs emitted assets)
- **entry chunk** ...
- ?? what's the difference between "emit" and "done"
- ?? output -> libraryTarget: 'jsonp'


## Webpack Philosophy

- build dependency graph(s) of dependent modules
  - at the very high-level, webpack just build dependency graph of modules and doesn't care what type of file that module is (just delegate to loaders)
- everything is a module i.e. a javascript file can "import" css files or image files


## What is in webpack-dev-middleware
WebpackDevMiddleware is used internally in WebpackDevServer, (Next.js)[https://github.com/zeit/next.js/blob/98cf0a83116270150fabee595264dd7a848f3304/packages/next/package.json#L87] and 

- webpack compilation uses in-memory file system (can write to disk)
- middleware that serves webpack-bundled assets
- defer action (e.g. binds server to port) until the compilation is ready
- lazy compilation (rebuild only when receiving request)
  - default is watch mode (rebuild on file changes)
- supports for hot module replacement (HMR)


## Brain dump

- always use absolute path for entry/output - be explicit and use node's `path` module to resolve the absolute path for everything (well except `output.publicPath`)
- `stats.toJson()` is a great way to work with stats to build html response instead of working directly on the `stats` instance. The json stats looks like [this](https://webpack.js.org/api/stats/#structure).
- loaders (modules) vs plugins (chunks)


## Webpack 3 <> 4 Interopt for Plugins

```javascript
if (compiler.hooks) {
  // Webpack 4
  compiler.hooks.done.tap('PluginName', handler);
} else {
  // Webpack 3
  compiler.plugin('done', handler);
}
```

compiler hooks

Compile

-> `normalModuleFactory`
-> `contextModuleFactory`
>>
-> `beforeCompile`
-> `compile`
-> { newCompilation(params) }
-> `thisCompilation`
-> `compilation`
-> `make`
-> { compilation.finish() }
-> { compilation.seal() }
-> `afterCompile`
