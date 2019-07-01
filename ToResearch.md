## To Research
Topics I'm researching to build scalable, server-side render web servers.

### Development Workflow

- [X] Multicompiler 1 client, 1 server (ssr react)
  - client & server share webpack cache
- [X] The distinction/boundary between server (render) bundle and dev server ("import" server bundle)
- [X] Hooking up webpack (watch) to a running dev server
  - how webpackDevMiddleware does it
  - pass compiler instance to create middleware and just listen to the compiler hooks
- [X] Dev Server respond only after the first compilation finishes
  - must finish both client & server
- [X] Dev Server holds the response if there's running recompilation
  - must finish both client & server
- [X] Live update the rebuilt server bundle without restart the dev server
  - how webpackHotServerMiddleware does it
  - the key is to update handler function when compilation hook "done" is fired
- [X] How to get information about static assets to server render
  - for initial assets: the information is available in clientStats use in server render handler
  - for on-demand assets: nothing to do. the information is automatically handle via webpack runtime on the client-side
- [ ] How to compile only related subtree of the requesting page/entry
- [X] VSCode debugging attach to the bundled server runtime (server/render not server/index)

### Production Workflow

brain dump a.k.a. wip:
- build client & build server into bundles
- web server (production) just "import" server (render) bundle
  - client asset manifest (stats)? - assetsByChunkName

### Verify these issues are solved

- [chunkhash/contenthash can vary between builds](https://github.com/webpack/webpack/issues/7179)
  - tool to compare files whose chunkhashes change between two builds?
  - **very important** to verify
- [using runtime chunks force entry chunks to use chunkFilename rather than filename](https://github.com/webpack/webpack/issues/6598)
  - [will be fixed in webpack 5](https://github.com/webpack/webpack/pull/7401#issuecomment-392757853)
  - it might still be workable for me without this is fix

## Ideas: how to "defer" response during active compilation

### Option 1
- always register to the Done observable
- when "done" is fire, synchronously execute all registered callbacks (drain)
- if it's already done, execute the callback nextTick (like promise that resolve immediately)

### Option 2
- have an object that we keep swapping out the "done" promise
- just always `.then` to the done promise - let the promise takes care of the rest
- harder because how we must handle "compiling" state

### Option 3
- do like webpack-dev-middleware just set flag and keep mutate the object containing that flag
- then keep an array of callbacks if the flag is false
- or execute the function right away if the flag is true
