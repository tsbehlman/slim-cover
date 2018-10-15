# slim-cover

[![Build Status](https://travis-ci.org/tsbehlman/slim-cover.svg?branch=master)](https://travis-ci.org/tsbehlman/slim-cover) [![Minified size](https://img.shields.io/bundlephobia/min/slim-cover.svg)](https://bundlephobia.com/result?p=slim-cover)

Barebones code coverage for JavaScript, in JavaScript.

Currently only supports Jasmine.

## Usage

Run `slim-cover` to execute tests and print coverage information.

```
slim-cover <project_dir> [<included_paths>...]
```

Executes tests within the given project directory.  For example, if your Jasmine `spec` folder is in a subdirectory called `dev`, run `slim-cover dev` to execute those tests.

You may optionally specify any number of files and directories to monitor for coverage.  For example, `slim-cover . src/ index.js` will execute all tests in the current directory and report on code coverage for `index.js` all files under the `src` directory.  The current project directory is included if no paths are specified.

slim-cover will only report on coverage for files that are both within the configured source paths and included by your test code.  If there are source files in your chosen paths that are not imported by either your tests or the code under test, they will not be monitored.