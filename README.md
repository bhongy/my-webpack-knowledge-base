# My Webpack Knowledge Base

Notes and examples related to parts of Webpack that are not easy to understand for new comers.

Based on Webpack 4.


## Configuration

- `entry` object is used to map multiple chunk entries - it's agnostic from how you serve the assets (or routing/navigation). these are how you want webpack to start bundling your app based on js source code
- `output.filename` is the name pattern to use for entry chunks
- `output.chunkFilename` is the name pattern to use for non-entry chunks (on-demand, code splitted chunks)
  - part that I don't understand is that when I use `optimization.runtimeChunk: true` all chunks (like main, vendor~main) uses the `chunkFilename` pattern except that `runtime~main` uses the `output.filename` pattern.
- `[hash]` is the hash of the entire compilation—all assets will use the same hash
- `[chunkhash]` is the hash of the content of the entry's chunk
- `[contenthash]` is the hash of only the content (e.g. extracted css content)
- `optimization.splitChunks.chunks` tells the type of chunk splitting to use
  - accepts 3 values `"async" | "initial" | "all"`
  - the __default__ is `"async"` meaning all code-splitting (via `import()`) will be splitted and extract into a separate bundle hence if you do not use `"all"` you don't see the common modules like React extracted into a separate chunk.
  - `"all"` will on-demand (async) chunks (like `"async"`) as well as sync chunks (e.g. `import React from 'react'`). It is not enabled by default because your html generation needs a way to include the dynamic initial assets (number of assets and their names).
  - I still don't really understand `"initial"`
  - example of the 3 `chunks` modes [Webpack 4 — Mysterious SplitChunks Plugin @ Hemal Patel](https://medium.com/dailyjs/webpack-4-splitchunks-plugin-d9fbbe091fd0)
  - how SplitChunksPlugin works -> [RIP CommonsChunkPlugin @ Sokra](https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693) | [webpack 4: Code Splitting, chunk graph and the splitChunks optimization @ Sokra](https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366)

## Terminology

- **chunk** (vs module vs emitted assets)
- **entry chunk** ...
