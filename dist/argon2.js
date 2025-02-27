var Module = (() => {
    var _scriptDir =
        typeof document !== 'undefined' && document.currentScript
            ? document.currentScript.src
            : undefined;

    return function (Module = {}) {
        var Module = typeof Module != 'undefined' ? Module : {};
        var readyPromiseResolve, readyPromiseReject;
        Module['ready'] = new Promise(function (resolve, reject) {
            readyPromiseResolve = resolve;
            readyPromiseReject = reject;
        });
        const document = this;
        var moduleOverrides = Object.assign({}, Module);
        var arguments_ = [];
        var thisProgram = './this.program';
        var quit_ = (status, toThrow) => {
            throw toThrow;
        };
        var ENVIRONMENT_IS_WEB = true;
        var ENVIRONMENT_IS_WORKER = false;
        var scriptDirectory = '';
        function locateFile(path) {
            if (Module['locateFile']) {
                return Module['locateFile'](path, scriptDirectory);
            }
            return scriptDirectory + path;
        }
        var read_, readAsync, readBinary, setWindowTitle;
        if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
            if (ENVIRONMENT_IS_WORKER) {
                scriptDirectory = self.location.href;
            } else if (
                typeof document != 'undefined' &&
                document.currentScript
            ) {
                scriptDirectory = document.currentScript.src;
            }
            if (_scriptDir) {
                scriptDirectory = _scriptDir;
            }
            if (scriptDirectory.indexOf('blob:') !== 0) {
                scriptDirectory = scriptDirectory.substr(
                    0,
                    scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1
                );
            } else {
                scriptDirectory = '';
            }
            {
                read_ = (url) => {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, false);
                    xhr.send(null);
                    return xhr.responseText;
                };
                if (ENVIRONMENT_IS_WORKER) {
                    readBinary = (url) => {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', url, false);
                        xhr.responseType = 'arraybuffer';
                        xhr.send(null);
                        return new Uint8Array(xhr.response);
                    };
                }
                readAsync = (url, onload, onerror) => {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.responseType = 'arraybuffer';
                    xhr.onload = () => {
                        if (
                            xhr.status == 200 ||
                            (xhr.status == 0 && xhr.response)
                        ) {
                            onload(xhr.response);
                            return;
                        }
                        onerror();
                    };
                    xhr.onerror = onerror;
                    xhr.send(null);
                };
            }
            setWindowTitle = (title) => (document.title = title);
        } else {
        }
        var out = Module['print'] || console.log.bind(console);
        var err = Module['printErr'] || console.warn.bind(console);
        Object.assign(Module, moduleOverrides);
        moduleOverrides = null;
        if (Module['arguments']) arguments_ = Module['arguments'];
        if (Module['thisProgram']) thisProgram = Module['thisProgram'];
        if (Module['quit']) quit_ = Module['quit'];
        var wasmBinary;
        if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
        var noExitRuntime = Module['noExitRuntime'] || true;
        if (typeof WebAssembly != 'object') {
            abort('no native wasm support detected');
        }
        var wasmMemory;
        var ABORT = false;
        var EXITSTATUS;
        var UTF8Decoder =
            typeof TextDecoder != 'undefined'
                ? new TextDecoder('utf8')
                : undefined;
        function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
            var endIdx = idx + maxBytesToRead;
            var endPtr = idx;
            while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
            if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
                return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
            }
            var str = '';
            while (idx < endPtr) {
                var u0 = heapOrArray[idx++];
                if (!(u0 & 128)) {
                    str += String.fromCharCode(u0);
                    continue;
                }
                var u1 = heapOrArray[idx++] & 63;
                if ((u0 & 224) == 192) {
                    str += String.fromCharCode(((u0 & 31) << 6) | u1);
                    continue;
                }
                var u2 = heapOrArray[idx++] & 63;
                if ((u0 & 240) == 224) {
                    u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
                } else {
                    u0 =
                        ((u0 & 7) << 18) |
                        (u1 << 12) |
                        (u2 << 6) |
                        (heapOrArray[idx++] & 63);
                }
                if (u0 < 65536) {
                    str += String.fromCharCode(u0);
                } else {
                    var ch = u0 - 65536;
                    str += String.fromCharCode(
                        55296 | (ch >> 10),
                        56320 | (ch & 1023)
                    );
                }
            }
            return str;
        }
        function UTF8ToString(ptr, maxBytesToRead) {
            return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
        }
        var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
        function updateMemoryViews() {
            var b = wasmMemory.buffer;
            Module['HEAP8'] = HEAP8 = new Int8Array(b);
            Module['HEAP16'] = HEAP16 = new Int16Array(b);
            Module['HEAP32'] = HEAP32 = new Int32Array(b);
            Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
            Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
            Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
            Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
            Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
        }
        var wasmTable;
        var __ATPRERUN__ = [];
        var __ATINIT__ = [];
        var __ATPOSTRUN__ = [];
        var runtimeInitialized = false;
        function preRun() {
            if (Module['preRun']) {
                if (typeof Module['preRun'] == 'function')
                    Module['preRun'] = [Module['preRun']];
                while (Module['preRun'].length) {
                    addOnPreRun(Module['preRun'].shift());
                }
            }
            callRuntimeCallbacks(__ATPRERUN__);
        }
        function initRuntime() {
            runtimeInitialized = true;
            callRuntimeCallbacks(__ATINIT__);
        }
        function postRun() {
            if (Module['postRun']) {
                if (typeof Module['postRun'] == 'function')
                    Module['postRun'] = [Module['postRun']];
                while (Module['postRun'].length) {
                    addOnPostRun(Module['postRun'].shift());
                }
            }
            callRuntimeCallbacks(__ATPOSTRUN__);
        }
        function addOnPreRun(cb) {
            __ATPRERUN__.unshift(cb);
        }
        function addOnInit(cb) {
            __ATINIT__.unshift(cb);
        }
        function addOnPostRun(cb) {
            __ATPOSTRUN__.unshift(cb);
        }
        var runDependencies = 0;
        var runDependencyWatcher = null;
        var dependenciesFulfilled = null;
        function addRunDependency(id) {
            runDependencies++;
            if (Module['monitorRunDependencies']) {
                Module['monitorRunDependencies'](runDependencies);
            }
        }
        function removeRunDependency(id) {
            runDependencies--;
            if (Module['monitorRunDependencies']) {
                Module['monitorRunDependencies'](runDependencies);
            }
            if (runDependencies == 0) {
                if (runDependencyWatcher !== null) {
                    clearInterval(runDependencyWatcher);
                    runDependencyWatcher = null;
                }
                if (dependenciesFulfilled) {
                    var callback = dependenciesFulfilled;
                    dependenciesFulfilled = null;
                    callback();
                }
            }
        }
        function abort(what) {
            if (Module['onAbort']) {
                Module['onAbort'](what);
            }
            what = 'Aborted(' + what + ')';
            err(what);
            ABORT = true;
            EXITSTATUS = 1;
            what += '. Build with -sASSERTIONS for more info.';
            var e = new WebAssembly.RuntimeError(what);
            readyPromiseReject(e);
            throw e;
        }
        var dataURIPrefix = 'data:application/octet-stream;base64,';
        function isDataURI(filename) {
            return filename.startsWith(dataURIPrefix);
        }
        var wasmBinaryFile;
        wasmBinaryFile = 'argon2.wasm';
        if (!isDataURI(wasmBinaryFile)) {
            wasmBinaryFile = locateFile(wasmBinaryFile);
        }
        function getBinary(file) {
            try {
                if (file == wasmBinaryFile && wasmBinary) {
                    return new Uint8Array(wasmBinary);
                }
                if (readBinary) {
                    return readBinary(file);
                }
                throw 'both async and sync fetching of the wasm failed';
            } catch (err) {
                abort(err);
            }
        }
        function getBinaryPromise(binaryFile) {
            if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
                if (typeof fetch == 'function') {
                    return fetch(binaryFile, { credentials: 'same-origin' })
                        .then(function (response) {
                            if (!response['ok']) {
                                throw (
                                    "failed to load wasm binary file at '" +
                                    binaryFile +
                                    "'"
                                );
                            }
                            return response['arrayBuffer']();
                        })
                        .catch(function () {
                            return getBinary(binaryFile);
                        });
                }
            }
            return Promise.resolve().then(function () {
                return getBinary(binaryFile);
            });
        }
        function instantiateArrayBuffer(binaryFile, imports, receiver) {
            return getBinaryPromise(binaryFile)
                .then(function (binary) {
                    return WebAssembly.instantiate(binary, imports);
                })
                .then(function (instance) {
                    return instance;
                })
                .then(receiver, function (reason) {
                    err('failed to asynchronously prepare wasm: ' + reason);
                    abort(reason);
                });
        }
        function instantiateAsync(binary, binaryFile, imports, callback) {
            return WebAssembly.instantiate(binary, imports).then((instance) =>
                callback({ instance })
            );
        }
        function createWasm() {
            var info = { a: wasmImports };
            function receiveInstance(instance, module) {
                var exports = instance.exports;
                Module['asm'] = exports;
                wasmMemory = Module['asm']['c'];
                updateMemoryViews();
                wasmTable = Module['asm']['k'];
                addOnInit(Module['asm']['d']);
                removeRunDependency('wasm-instantiate');
                return exports;
            }
            addRunDependency('wasm-instantiate');
            function receiveInstantiationResult(result) {
                receiveInstance(result['instance']);
            }
            if (Module['instantiateWasm']) {
                try {
                    return Module['instantiateWasm'](info, receiveInstance);
                } catch (e) {
                    err(
                        'Module.instantiateWasm callback failed with error: ' +
                            e
                    );
                    readyPromiseReject(e);
                }
            }
            instantiateAsync(
                wasmBinary,
                wasmBinaryFile,
                info,
                receiveInstantiationResult
            ).catch(readyPromiseReject);
            return {};
        }
        function callRuntimeCallbacks(callbacks) {
            while (callbacks.length > 0) {
                callbacks.shift()(Module);
            }
        }
        function _emscripten_memcpy_big(dest, src, num) {
            HEAPU8.copyWithin(dest, src, src + num);
        }
        function getHeapMax() {
            return 2147418112;
        }
        function emscripten_realloc_buffer(size) {
            var b = wasmMemory.buffer;
            try {
                wasmMemory.grow((size - b.byteLength + 65535) >>> 16);
                updateMemoryViews();
                return 1;
            } catch (e) {}
        }
        function _emscripten_resize_heap(requestedSize) {
            var oldSize = HEAPU8.length;
            requestedSize = requestedSize >>> 0;
            var maxHeapSize = getHeapMax();
            if (requestedSize > maxHeapSize) {
                return false;
            }
            let alignUp = (x, multiple) =>
                x + ((multiple - (x % multiple)) % multiple);
            for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
                var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
                overGrownHeapSize = Math.min(
                    overGrownHeapSize,
                    requestedSize + 100663296
                );
                var newSize = Math.min(
                    maxHeapSize,
                    alignUp(Math.max(requestedSize, overGrownHeapSize), 65536)
                );
                var replacement = emscripten_realloc_buffer(newSize);
                if (replacement) {
                    return true;
                }
            }
            return false;
        }
        var ALLOC_NORMAL = 0;
        var ALLOC_STACK = 1;
        function allocate(slab, allocator) {
            var ret;
            if (allocator == ALLOC_STACK) {
                ret = stackAlloc(slab.length);
            } else {
                ret = _malloc(slab.length);
            }
            if (!slab.subarray && !slab.slice) {
                slab = new Uint8Array(slab);
            }
            HEAPU8.set(slab, ret);
            return ret;
        }
        var wasmImports = {
            b: _emscripten_memcpy_big,
            a: _emscripten_resize_heap,
        };
        var asm = createWasm();
        var ___wasm_call_ctors = function () {
            return (___wasm_call_ctors = Module['asm']['d']).apply(
                null,
                arguments
            );
        };
        var _argon2_hash = (Module['_argon2_hash'] = function () {
            return (_argon2_hash = Module['_argon2_hash'] =
                Module['asm']['e']).apply(null, arguments);
        });
        var _malloc = (Module['_malloc'] = function () {
            return (_malloc = Module['_malloc'] = Module['asm']['f']).apply(
                null,
                arguments
            );
        });
        var _free = (Module['_free'] = function () {
            return (_free = Module['_free'] = Module['asm']['g']).apply(
                null,
                arguments
            );
        });
        var _argon2_verify = (Module['_argon2_verify'] = function () {
            return (_argon2_verify = Module['_argon2_verify'] =
                Module['asm']['h']).apply(null, arguments);
        });
        var _argon2_error_message = (Module['_argon2_error_message'] =
            function () {
                return (_argon2_error_message = Module[
                    '_argon2_error_message'
                ] =
                    Module['asm']['i']).apply(null, arguments);
            });
        var _argon2_encodedlen = (Module['_argon2_encodedlen'] = function () {
            return (_argon2_encodedlen = Module['_argon2_encodedlen'] =
                Module['asm']['j']).apply(null, arguments);
        });
        var _argon2_hash_ext = (Module['_argon2_hash_ext'] = function () {
            return (_argon2_hash_ext = Module['_argon2_hash_ext'] =
                Module['asm']['l']).apply(null, arguments);
        });
        var _argon2_verify_ext = (Module['_argon2_verify_ext'] = function () {
            return (_argon2_verify_ext = Module['_argon2_verify_ext'] =
                Module['asm']['m']).apply(null, arguments);
        });
        var ___errno_location = function () {
            return (___errno_location =
                Module['asm']['__errno_location']).apply(null, arguments);
        };
        var stackAlloc = function () {
            return (stackAlloc = Module['asm']['n']).apply(null, arguments);
        };
        Module['UTF8ToString'] = UTF8ToString;
        Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
        Module['allocate'] = allocate;
        var calledRun;
        dependenciesFulfilled = function runCaller() {
            if (!calledRun) run();
            if (!calledRun) dependenciesFulfilled = runCaller;
        };
        function run() {
            if (runDependencies > 0) {
                return;
            }
            preRun();
            if (runDependencies > 0) {
                return;
            }
            function doRun() {
                if (calledRun) return;
                calledRun = true;
                Module['calledRun'] = true;
                if (ABORT) return;
                initRuntime();
                readyPromiseResolve(Module);
                if (Module['onRuntimeInitialized'])
                    Module['onRuntimeInitialized']();
                postRun();
            }
            if (Module['setStatus']) {
                Module['setStatus']('Running...');
                setTimeout(function () {
                    setTimeout(function () {
                        Module['setStatus']('');
                    }, 1);
                    doRun();
                }, 1);
            } else {
                doRun();
            }
        }
        if (Module['preInit']) {
            if (typeof Module['preInit'] == 'function')
                Module['preInit'] = [Module['preInit']];
            while (Module['preInit'].length > 0) {
                Module['preInit'].pop()();
            }
        }
        run();

        return Module.ready;
    };
})();
if (typeof exports === 'object' && typeof module === 'object')
    module.exports = Module;
else if (typeof define === 'function' && define['amd'])
    define([], function () {
        return Module;
    });
else if (typeof exports === 'object') exports['Module'] = Module;
