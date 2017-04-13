#slim-cover

Barebones code coverage for JavaScript, in JavaScript.

Supports Jasmine and Mocha. Mocha support, however, is highly limited at this stage. It won't read from a Mocha configuration file, for example.

##Usage
Run `slim-cover` to execute tests and print coverage information.  You may optionally specify the project to cover.  For example, if your Jasmine `spec` folder is in a subdirectory called `src`, run `slim-cover src`.