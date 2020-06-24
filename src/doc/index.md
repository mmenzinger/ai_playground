# Index

The entrance for each project is the file index.js. The start and train buttons call the corresponding [asynchronous](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) functions 'start' and 'train', which have to be [exported](https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export) to be accessible. The 'start' function is mandatory, as it is called then the scenario is loaded. 'train' is optional and can safely be removed when not needed.
```javascript
export async function start(){
    console.log("start was clicked");
}

export async function train(){
    console.log("train was clicked");
}
```

## Scenario

Usually all the functionality for a scenario can be found inside the file scenario.js. It is recommended to include the whole file at once to make use of the autocompletion to easily find the needed functions or objects.
```javascript
import * as $ from 'project/scenario.js';
```