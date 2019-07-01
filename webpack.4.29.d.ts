/**
 * This is not complete/correct. My personal exploration of webpack data.
 */

// based on Webpack 4.29.0 <25bccd4c4>

import * as Tapable from "tapable";

declare namespace webpack {
  interface Configuration {
    cache: boolean;
    context: string;
    devtool: string;
    entry: string;
    mode: "developement" | "production" | "none";
    module: {
      defaultRules: Array<Configuration.Rule>;
      rules: Array<Configuration.Rule>;
    };
    externals: Configuration.Externals | Array<Configuration.Externals>;
    node: {
      __dirname: boolean | "mock";
      __filename: boolean | "mock";
      Buffer: boolean | "mock";
      console: boolean | "mock";
      global: boolean | "mock";
      process: boolean | "mock";
      setImmediate: boolean | "mock";
    };
    // ...
  }

  namespace Configuration {
    interface Rule {
      // shortcut for resource.test
      test?: RegExp | string | ((path: string) => boolean);
      use?:  RuleUse | RuleUse[];
    }

    interface RuleUse {
      loader?: string;
      options?: string | { [k: string]: string };
    }

    type Externals = string | RegExp | ExternalsObject | ExternalsFunction;

    interface ExternalsObject {
      [key: string]: boolean | string | Array<string> | ExternalsObject;
    }

    interface ExternalsFunction {
      // (context, request, callback): void;
    }
  }

  interface MultiCompiler {
    compilers: Array<Compiler>;
    hooks: {
      // MultiCompilerHooks?
      // hooks.done.tap('name', handler)
      // MultiCompiler.hooks.done is SyncHook not AsyncSeriesHook
      done: Tapable.SyncHook<MultiStats>;
      // invalid: Tapable.MultiHook;
      // run: Tapable.MultiHook;
      // watchClose: Tapable.SyncHook;
      // watchRun: Tapable.MultiHook;
    };
    // both input & output file system:
    //   get -> throws an error
    //   set -> set the input (or output) file system for "all" compilers
    inputFileSystem: never; // throws an error
    outputFileSystem: never; // throws an error
    // common `output.path` across all compilers
    // e.g. <root>/dist/client/ and <root>/dist/server/ -> <root>/dist/
    outputPath: string;
    // watch(WatchOptions, Handler)
    // run(DoneCallback)
    // running: boolean; (private)
  }

  interface Compiler {
    context: string; // absolute path
    hooks: {
      done: Tapable.AsyncSeriesHook<Stats>;
    };
    // inputFileSystem: IFileSystem;
    name: undefined | string;
    options: Configuration;
    // outputFileSystem: IFileSystem;
    outputPath: string;
    // watchFileSystem
    watchMode: boolean;
  }

  interface MultiStats {
    stats: Array<webpack.Stats>;
    hash: string;
  }

  interface Stats {
    compilation: Compilation;
    startTime: number;
    endTime: number;
    hash: string;
  }

  interface Compilation {
    _modules: Map<string /* absolute path of the module */, Module>;

    assets: {
      // such as 'js/main-da900a1a04ae7b32a54f.js'
      [outputFilename: string]: {
        // ** the object is actually CachedSource from webpack-source
        emitted: boolean;
        // output location (absolute path)
        // e.g. '/Users/me/project/dist/client/js/main-da900a1a04ae7b32a54f.js'
        existedAt: string;
        size(): number;
        source(): string | Array<string>; // not sure
        // sourceAndMap: Function;
        // _cachedMaps: {};
        // _cacheSize: number;
        // _cachedSource: string; // string of source content
        // _source
        // listMap(options)
        // node(options)
      };
    };
    bail: undefined | unknown;
    chunkGroups: Array<Entrypoint | ChunkGroup>;
    chunks: Array<Chunk>;
    compiler: Compiler;
    entrypoints: Map<string /* entry key like 'main' */, Entrypoint>;
    errors: Array<unknown>;
    fullHash: string;
    hash: string;
    hooks: {};
    // inputFileSystem: InputFileSystem;
    name: undefined | string;
    options: Configuration;
    outputOptions: {
      chunkFilename: string;
      crossOriginLoading: boolean;
      filename: string;
      // library
      // libraryTarget
      path: string;
      pathinfo: boolean;
      publicPath: string;
    };
    performance: boolean;
    profile: undefined | unknown;
    warnings: Array<unknown>;
    //
    getStats(): webpack.Stats;
  }  

  interface ToJsonStats {
    _showErrors: boolean;
    _showWarnings: boolean;
    assets: Array<JsonStats.Asset>;
    assetsByChunkName: {
      // example for filename: 'assets/js/[name]-[contenthash].js'
      // output -> { main: 'assets/js/main-659e0a70620de71b6acb.js' }
      [chunkName: string]: string;
    };
    builtAt: number;
    children: Array<unknown>;
    chunks: Array<unknown>;
    entrypoints: Array<unknown>;
    // errors: unknown;
    // number of modules excluded from stats via `stats.excludeAssets` config
    // or by passing { excludeAssets } to `toJson` method
    filteredAssets: number;
    // number of modules excluded from stats via `stats.excludeModules` config
    // or by passing { excludeModules } to `toJson` method
    filteredModules: number;
    hash: string;
    modules: Array<unknown>;
    namedChunkGroups: {};
    outputPath: string;
    publicPath: string;
    time: number;
    version: number;
    // warnings: unknown;
  }

  // https://webpack.js.org/api/stats/#structure
  namespace JsonStats {
    interface Asset {
      // the chunk names that this asset contains
      chunkNames: Array<string> /* e.g. ['locale0'] */;
      // the chunk IDs that this asset contains
      chunks: Array<JsonStats.Chunk["id"]> /* e.g. ['locale0'] or [32] */;
      // whether asset made it to the output directory
      emitted: boolean;
      name: string /* e.g. 'locale0-d282404aea4a08425082.js' */;
      size: number;
    }

    interface Chunk {
      // whether the chunk contains webpack runtime
      entry: boolean;
      // array of filenames that has this chunk
      files: Array<string> /* e.g. ['locale0-d282404aea4a08425082.js'] */;
      // same as ToJsonStats.filteredModules
      filteredModules: number;
      // I believe this is chunkhash (not the compilation hash)
      hash: string;
      id: string | number /* e.g. 'locale0' or 32 */;
      // whether this is an entry chunk (or on-demand)
      initial: boolean;
      modules: Array<JsonStats.Module>;
      // chunk names that's contained (not children) in this chunk
      names: Array<string>;
      origins: Array<JsonStats.ChunkOrigin>;
      // parent chunk ids
      parents: Array<
        string | number
      > /* e.g. ['main', 'runtime~main', 'vendors~main'] */;
      // whether the chunk went through code generation
      rendered: boolean;
      size: number;
      /*
      children:Array(0) [] ?
      childrenByOrder:Object {} ?
      reason:undefined
      recorded:undefined
      siblings:Array(0) []
      */
    }

    interface ChunkOrigin {
      /*
      loc
      module
      moduleId
      moduleIdentifier
      moduleName
      name
      reasons
      */
    }

    interface Module {
      // so far I've only seen this as an empty array
      assets: Array<JsonStats.Asset>;
      // whether the module went through loaders, parsing, and code generation
      built: boolean;
      cacheable: boolean;
      // ids of chunks that contain this module
      chunks: Array<JsonStats.Chunk["id"]>;
      // num errors when resolving or processing this module
      errors: number;
      // whether the compilation is failed on this module
      failed: boolean;
      id: string /* e.g. './src/locale/en-US.json' */;
      identifier: string /* e.g. '/Users/username/path-to-project/src/locale/en-US.json' */;
      name: string;
      optional: boolean; // ?
      prefetch: boolean;
      // profile: undefined | {};
      reasons: Array<JsonStats.ModuleReason>;
      size: number;
      // stringified raw source code of the module
      source: string;
      // num warnings when resolving or processing this module
      warnings: number;
    }

    // describe why the module is included in the dependency graph
    interface ModuleReason {
      /*
      loc
      module
      moduleId
      moduleIdentifier
      moduleName
      type
      userRequest
      */
    }
  }

  interface Module {}
  interface NormalModule extends Module {
    loaders: Loader[];
    parser: Parser;
    build(/* ... */): unknown;
  }

  interface Chunk {
    id: string; // e.g. 'about'
    name: string; // e.g. 'about'
    debugId: number; // e.g. 1001
    rendered: boolean;
    contentHash: unknown; // { javascript: 'e02d79a2951c6d984828' }
    hash: undefined | string;
    renderedHash: undefined | string; // seems to be len20 truncated version of hash

    entryModule: Module; // always NormalModule?
    files: string[]; // e.g. ['about-e02d79a2951c6d984828.js']
    filenameTemplate: undefined | string;

    // groupsIterable: Set<ChunkGroup>;
    // modulesIterable: Set<>;

    // DEPRECATED
    // blocks -> getBlocks()
    // chunks -> getChildren()
    // entry -> hasRuntime()
    // entrypoints -> Use Chunks.groupsIterable and filter by instanceof Entrypoint instead
    // initial
    // parents -> ChunkGroup.getParents()
  }

  interface ChunkGroup {}
  interface ChunkHash {}
  interface Dependency {}
  interface Entrypoint {}

  interface Loader {
    ident: string; // e.g. ref--4
    loader: string // absolute path
    options: unknown;
  }
  interface Parser {}

  /*
  interface SplitChunksOptions {
    cacheGroups?: CacheGroupsOptions;
  }

  interface CacheGroupsOptions {
    minSize?: number;
    minChunks?: number; // min shared that shares the module before splitting
    maxInitialRequests?: number;
    maxAsyncRequests?: number;

    name?: string | boolean;
    chunks?: 'initial' | 'async' | 'all';
    reuseExistingChunk?: boolean;
    test?: ((...args: Array<unknown>) => boolean) | string | RegExp;
    priority?: number;
  }
  */
}
