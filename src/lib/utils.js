export async function messageWithResult(
    msg,
    timeout = null,
    target = self,
    transfer = []
) {
    return new Promise((resolve, reject) => {
        let to;
        if (timeout) {
            to = setTimeout(() => {
                reject(Error(`message timeout: ${msg}`));
            }, timeout);
        }
        const channel = new MessageChannel();
        channel.port1.onmessage = (m) => {
            clearTimeout(to);
            resolve(m.data);
        };
        target.postMessage(msg, [channel.port2, ...transfer]);
    });
}

export function seedRandom(seed) {
    return seedrandom(seed);
}

export async function includeUrl(
    url,
    context = {},
    parse = (content) => content
) {
    const body = await fetch(url);
    const content = parse(await body.text());

    function evalInContext() {
        eval(`${content}`);
    }
    evalInContext.call(context);

    return context;
}

/***********************************************************************************************
 *  file handling
 */

export async function storeJson(path, data) {
    path = fixPath(path, '.json');
    const match = path.match(/\/?([^\/]+)\/([^\/]+$)/);
    if (match) {
        const json = JSON.stringify(data);
        const projectId = match[1] === 'global' ? 0 : undefined;
        const msg = {
            type: MessageType.JSON_STORE,
            projectId,
            fileName: match[2],
            json,
        };

        await messageWithResult(msg, 1000).catch((_) => {
            throw Error(`could not store file ${match[2]}`);
        });
    }
}

export async function loadJson(path) {
    path = fixPath(path, '.json');
    const json = await getFileContent(path);
    return JSON.parse(json);
}

export async function getFileContent(path) {
    path = fixPath(path);
    const body = await fetch(path);
    if (body.status !== 200) throw Error(`could not open file '${path}'`);
    return await body.text();
}

export function fixPath(path, ending = '') {
    if (!/^\//.test(path)) path = '/' + path;
    if (!/^\/(project|global)\//.test(path)) {
        path = '/project' + path;
    }
    if (!path.endsWith(ending)) path += ending;
    return path;
}

/***********************************************************************************************
 *  local storage emulation
 */
let localStorageCache;

export async function initLocalStorage() {
    try {
        localStorageCache = new Map(await loadJson('localstorage'));
    } catch (_) {
        localStorageCache = new Map();
    }
}

function saveLocalStorage() {
    storeJson('localstorage', localStorageCache);
}

export const localStorage = {
    get length() {
        return localStorageCache.size;
    },

    key(n) {
        if (n < 0 || n >= localStorageCache.size) return null;
        return Array.from(localStorageCache.keys())[n];
    },

    setItem(key, value) {
        localStorageCache.set(key, value);
        saveLocalStorage();
    },

    getItem(key) {
        if (!localStorageCache.has(key)) return null;
        return localStorageCache.get(key);
    },

    removeItem(key) {
        if (localStorageCache.delete(key)) saveLocalStorage();
    },

    clear() {
        localStorageCache.clear();
        saveLocalStorage();
    },
};

/***********************************************************************************************
 *  gui interaction
 */
export function getCanvas(id = 0) {
    return self.__canvas;
}

export async function sleep(ms) {
    return new Promise((resolve, _) => {
        setTimeout(resolve, ms);
    });
}

export async function setMessages(html) {
    const msg = {
        type: MessageType.HTML,
        action: 'set',
        html,
    };
    await messageWithResult(msg);
}

export async function addMessage(html) {
    const msg = {
        type: MessageType.HTML,
        action: 'add',
        html,
    };
    await messageWithResult(msg);
}

let images = new Map();
export async function loadImages(paths) {
    const newImages = await Promise.all(
        paths.map(async (path) => {
            const match = path.match(/\/([^\/]+)\.(png|jpeg)$/);
            let name = path;
            if (match && match.length > 1) {
                name = match[1];
            }
            const bitmap = await createImageBitmap(
                await fetch(path).then((r) => r.blob())
            );
            return { name, bitmap };
        })
    );
    for (const image of newImages) {
        images.set(image.name, image.bitmap);
    }
}

export function getImage(name) {
    return images.get(name);
}

export function onVideoFrameUpdate(callback) {
    // @ts-ignore
    self.__onVideoFrameUpdate = callback;
}

export function onMouseDown(callback) {
    self.onmousedown = callback;
}

export function onMouseMove(callback) {
    self.onmousemove = callback;
}

export function onMouseUp(callback) {
    self.onmouseup = callback;
}

/*
Copyright 2019 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

const global = self;
const pool = [];
const math = Math;
//
// The following constants are related to IEEE 754 limits.
//

var width = 256, // each RC4 output is 0 <= x < 256
    chunks = 6, // at least six RC4 outputs for each double
    digits = 52, // there are 52 significant digits in a double
    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
    startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,
    nodecrypto; // node.js crypto module, initialized at the bottom.

//
// seedrandom()
// This is the seedrandom function described above.
//
function seedrandom(seed, options, callback) {
    var key = [];
    options = options == true ? { entropy: true } : options || {};

    // Flatten the seed string or build one from local entropy if needed.
    var shortseed = mixkey(
        flatten(
            options.entropy
                ? [seed, tostring(pool)]
                : seed == null
                ? autoseed()
                : seed,
            3
        ),
        key
    );

    // Use the seed to initialize an ARC4 generator.
    var arc4 = new ARC4(key);

    // This function returns a random double in [0, 1) that contains
    // randomness in every bit of the mantissa of the IEEE 754 value.
    var prng = function () {
        var n = arc4.g(chunks), // Start with a numerator n < 2 ^ 48
            d = startdenom, //   and denominator d = 2 ^ 48.
            x = 0; //   and no 'extra last byte'.
        while (n < significance) {
            // Fill up all significant digits by
            n = (n + x) * width; //   shifting numerator and
            d *= width; //   denominator and generating a
            x = arc4.g(1); //   new least-significant-byte.
        }
        while (n >= overflow) {
            // To avoid rounding up, before adding
            n /= 2; //   last byte, shift everything
            d /= 2; //   right using integer math until
            x >>>= 1; //   we have exactly the desired bits.
        }
        return (n + x) / d; // Form the number within [0, 1).
    };

    prng.int32 = function () {
        return arc4.g(4) | 0;
    };
    prng.quick = function () {
        return arc4.g(4) / 0x100000000;
    };
    prng.double = prng;

    // Mix the randomness into accumulated entropy.
    mixkey(tostring(arc4.S), pool);

    // Calling convention: what to return as a function of prng, seed, is_math.
    return (
        options.pass ||
        callback ||
        function (prng, seed, is_math_call, state) {
            if (state) {
                // Load the arc4 state from the given state if it has an S array.
                if (state.S) {
                    copy(state, arc4);
                }
                // Only provide the .state method if requested via options.state.
                prng.state = function () {
                    return copy(arc4, {});
                };
            }

            // If called as a method of Math (Math.seedrandom()), mutate
            // Math.random because that is how seedrandom.js has worked since v1.0.
            if (is_math_call) {
                math[rngname] = prng;
                return seed;
            }

            // Otherwise, it is a newer calling convention, so return the
            // prng directly.
            else return prng;
        }
    )(
        prng,
        shortseed,
        'global' in options ? options.global : this == math,
        options.state
    );
}

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
function ARC4(key) {
    var t,
        keylen = key.length,
        me = this,
        i = 0,
        j = (me.i = me.j = 0),
        s = (me.S = []);

    // The empty key [] is treated as [0].
    if (!keylen) {
        key = [keylen++];
    }

    // Set up S using the standard key scheduling algorithm.
    while (i < width) {
        s[i] = i++;
    }
    for (i = 0; i < width; i++) {
        s[i] = s[(j = mask & (j + key[i % keylen] + (t = s[i])))];
        s[j] = t;
    }

    // The "g" method returns the next (count) outputs as one number.
    (me.g = function (count) {
        // Using instance members instead of closure state nearly doubles speed.
        var t,
            r = 0,
            i = me.i,
            j = me.j,
            s = me.S;
        while (count--) {
            t = s[(i = mask & (i + 1))];
            r =
                r * width +
                s[mask & ((s[i] = s[(j = mask & (j + t))]) + (s[j] = t))];
        }
        me.i = i;
        me.j = j;
        return r;
        // For robust unpredictability, the function call below automatically
        // discards an initial batch of values.  This is called RC4-drop[256].
        // See http://google.com/search?q=rsa+fluhrer+response&btnI
    })(width);
}

//
// copy()
// Copies internal state of ARC4 to or from a plain object.
//
function copy(f, t) {
    t.i = f.i;
    t.j = f.j;
    t.S = f.S.slice();
    return t;
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
    var result = [],
        typ = typeof obj,
        prop;
    if (depth && typ == 'object') {
        for (prop in obj) {
            try {
                result.push(flatten(obj[prop], depth - 1));
            } catch (e) {}
        }
    }
    return result.length ? result : typ == 'string' ? obj : obj + '\0';
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
    var stringseed = seed + '',
        smear,
        j = 0;
    while (j < stringseed.length) {
        key[mask & j] =
            mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
    }
    return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto and Node crypto
// module if available.
//
function autoseed() {
    try {
        var out;
        if (nodecrypto && (out = nodecrypto.randomBytes)) {
            // The use of 'out' to remember randomBytes makes tight minified code.
            out = out(width);
        } else {
            out = new Uint8Array(width);
            (global.crypto || global.msCrypto).getRandomValues(out);
        }
        return tostring(out);
    } catch (e) {
        var browser = global.navigator,
            plugins = browser && browser.plugins;
        return [+new Date(), global, plugins, global.screen, tostring(pool)];
    }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
    return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to interfere with deterministic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);
