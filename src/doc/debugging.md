# Debugging


## General
Generally the written code gets executed in a WebWorker directly inside your browser, meaning all available features allowed in this context can be used. This mainly excludes dom-access and the window object. With this in mind some changes were made to provide better error feedback.


## Logging
First of all, the console.log/warn/error calls get intercepted and printed to the editor console. Additionally all calls go to the developer-console of the browser which can be useful when something doesn't render correctly or is not known at the time of logging (e.g. promises).
The code inside the worker runs on a single thread with the result, that the logging output only reaches the main app when the program has time to send the messages. This means logging statements inside busy-loops will not be visible until the blocking code is finished.
Alternatively the handle _console from util.js can be used to log directly to the normal developer console without any limitations.


## Debugger
For more in depth debugging the breakpoint statement 
```javascript
debugger;
```
can be used to trigger the debugger as long as the development-tools are open. The debugger itself can be used without limitations.


## Errors
Currently it is not possible to get useful error information regarding syntax errors from dynamically imported files. Therefore the editor itself checks all files for errors and reports them to the console once the program runs. These checks are independent of the browser and can differ. In case of false reports, the program still runs, despite the error messages. In case of missed errors the program will stop and the limited error message will be reported.
If at any time invalid errors are shown or error messages are missing, try reloading the page. If the problem persists, please file a bug report.


### Enums
Javascript does not support enums. All enums are normal Javascript objects with mappings from key to value and value to key. This means one can easily get the string representation for a value using it as a key.
```javascript
const dir = EDirection.Left;
console.log(dir); // prints 2
console.log(EDirection[dir]); // prints 'Left'
```