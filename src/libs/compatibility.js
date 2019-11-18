/******************************************************************************************
 * dirty hacks to make ml5 available in webworkers
 */

const fakeDom = {
    innerHTML: () => {},
    getElementsByTagName: () => [fakeDom],
    setAttribute: () => {},
    appendChild:() => fakeDom,
    exports: {},
}

self.window = {
    location: self.location,
};

self.document = {
    documentElement: {},
    createElement: () => fakeDom,
    createTextNode: () => fakeDom,
    getElementsByTagName: () => [fakeDom],
    body: fakeDom,
};

/************************************************************************************* */