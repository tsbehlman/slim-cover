# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- Covered source files may now require native node modules.

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

[Unreleased]: https://github.com/tsbehlman/slim-cover/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/tsbehlman/slim-cover/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/tsbehlman/slim-cover/compare/v1.0.0...v1.1.0