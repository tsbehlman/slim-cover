# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- File names in the output of both the terminal and codecov reporters will now be displayed as relative paths based on the project directory.
- File names in the terminal reporter will now be formatted similarly to line numbers in order to stick out more.

### Fixed
- Fixed issues with calculating line coverage when dealing with expressions or statements covering multiple lines in both reporters

## [1.5.1] - 2019-09-10

### Fixed
- Fixed invalid instrumentation of default exports.

## [1.5.0] - 2019-07-24

### Added
- Switch case and default statements are now instrumented so you can know which cases are covered.

### Fixed
- Fixed the terminal reporter's line numbers when the number of lines in a file is a number whose digits are all nines.
- Fixed invalid instrumentation of exported declarations.
- Fixed instrumentation of non-strict code.

## [1.4.1] - 2019-07-01

### Fixed
- Fixed instrumentation of arrow functions with no curly braces.

## [1.4.0] - 2019-06-30

### Added
- Files and directories can now be excluded by adding `--exclude <path>` on the command line.  Multiple excluded paths can be specified by repeating `--exclude` for each path.
- A new reporter has been added to generate a JSON file compatible with [codecov.io](https://codecov.io).  Any number of reporters can be specified on the command line and the output can be configured to a file.  For example, to print coverage results in a human-readable manner to stdout and generate a codecov-compatible json file `coverage.json`, specify them like so: `slim-cover --reporter terminal --reporter codecov,coverage.json`.  By default the `terminal` reporter is used and its output is streamed to stdout.
- `import` and `export` statements are now allowed by the parser.  See the Readme for instructions on how to test ES modules with `jasmine` and `esm` with support for coverage with `slim-cover`.
- The body of arrow functions which omit curly braces will now be instrumented, allowing for more accurate coverage reports.

### Changed
- The CLI now expects arguments to be named.  To set the project directory, use `--project <project>`.  To include a path, use `--include <path>`.  Multiple included paths can be specified by repeating `--include` for each path.  Both options consider the current working directory to be the default value.
- The terminal reporter will now only print the names of files whose coverage is not 100%.

### Fixed
- If-else statements without braces are now correctly instrumented and will no longer cause errors when running `slim-cover`.
- Fixed instrumentation errors caused by multibyte characters.

## [1.3.0] - 2018-10-15

### Changed
- If the node module cache gets cleared, slim-cover will continue to keep track of code coverage as if nothing happened

### Fixed
- Covered source files may now require native node modules.
- When installing slim-cover as a package, only the necessary source files are downloaded.
- Covered source files may now include characters outside of ASCII.

## [1.2.0] - 2017-07-10
### Added
- The shell's summary now includes the percentage of covered statements.
- New option to limit the scope of covered source files.  More details on this in the README.

### Changed
- Coverage data tracking is now a scoped to each source file instead of global.  This allows for better flexibility, such as allowing slim-cover to partially cover itself.

## [1.1.0] - 2017-07-10
### Added
- The shell prints a short summary of total coverage at the bottom.

### Changed
- The shell now only prints files that do not have full coverage.

### Fixed
- Statements that span multiple lines will now be outputted in full by the shell

## 1.0.0 - 2017-04-03
### Added
- Basic test coverage for [Jasmine](https://jasmine.github.io) tests

[Unreleased]: https://github.com/tsbehlman/slim-cover/compare/v1.5.1...HEAD
[1.5.1]: https://github.com/tsbehlman/slim-cover/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/tsbehlman/slim-cover/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/tsbehlman/slim-cover/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/tsbehlman/slim-cover/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/tsbehlman/slim-cover/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/tsbehlman/slim-cover/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/tsbehlman/slim-cover/compare/v1.0.0...v1.1.0