## To Research
Topics I'm researching to build scalable, server-side render web servers.

### Development Workflow

- [X] Multicompiler 1 client, 1 server (ssr react)
- [X] The distinction/boundary between server (render) bundle and dev server ("import" server bundle)
- [ ] Hooking up webpack (watch) to a running dev server
- [ ] Dev Server respond only after the first compilation finishes
  - must finish both client & server
- [ ] Dev Server holds the response if there's running recompilation
  - must finish both client & server
- [X] Live update the rebuilt server bundle without restart the dev server
  - how webpackHotServerMiddleware does it
  - the key is to update handler function when compilation hook "done" is fired
- [X] How to get information about static assets to server render
  - for initial assets: the information is available in clientStats use in server render handler
  - for on-demand assets: nothing to do. the information is automatically handle via webpack runtime on the client-side
- [ ] How to compile only related subtree of the requesting page/entry

### Production Workflow

brain dump a.k.a. wip:
- build client & build server into bundles
- web server (production) just "import" server (render) bundle
  - client asset manifest (stats)? - assetsByChunkName