# Debugging

Generally the written code gets executed in a WebWorker directly inside your browser, meaning all available features allowed in this context can be used. This mainly excludes dom-access and the window object. With this in mind some changes were made to provide better error feedback.

First of all, the console.log/warn/error calls get intercepted and printed to the editor console. Additionally all calls go to the developer-console of the browser which can be useful when something doesn't render correctly or is not known at the time of logging (e.g. promises).
The code inside the worker runs on a single thread with the result, that the logging output only reaches the main app when the program has time to send the messages. This means logging statements inside busy-loops will not be visible until the blocking code is finished.
Alternatively the handle realConsole from util.js can be used to log directly to the normal developer console without any limitations.

For more in depth debugging the breakpoint statement ```debugger;``` can be used to trigger the debugger as long as the development-tools are open. The debugger itself can be used without limitations.

Currently it is not possible to get useful error information regarding syntax errors from dynamically imported files. Therefore the editor itself checks all files for errors and reports them to the console once the program runs. These checks are independent of the browser and can differ. In case of false reports, the program still runs, despite the error messages. In case of missed errors the program will stop and the limited error message will be reported.

Keep in mind that the browser only understands Javascript, any Typescript annotations (which might be ignored by the editor) will result in syntax errors.