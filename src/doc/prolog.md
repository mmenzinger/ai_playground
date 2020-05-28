# Prolog

```javascript
import { pl } from 'lib/prolog.js';
```

The prolog.js file provides access to the [tau-prolog](http://tau-prolog.org) library. It provides promise-based alternatives to most of the useful functions and is fully integrated into the editor. Basically, whenever a function takes a callback it now returns a promise instead, to be better compatible with the async/await workflow already used.
Included modules are: Lists, JavaScript, Random and Statistics.

The basic prolog code can be written in separate .pl files. These files can be included into a knowledge-base by using the consult method.
```javascript
// create knowledge-base
const kb = pl.create();
// load prolog file
await kb.consult('myFile.pl');
```