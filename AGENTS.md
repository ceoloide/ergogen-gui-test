# Ergogen Web UI

This project is a React-based web interface for the [Ergogen](https://github.com/ergogen/ergogen) project, including quality-of-life improvements to the users like live reload of outputs, integrated footprint libraries and loading directly from GitHub.

## Ergogen CLI

[Ergogen](https://github.com/ergogen/ergogen) is a command line tool that allows users to define the characteristics of ergognomic keyboards (usually split ones) in YAML code, then generating assets to help fabricate the board. Ergogen helps with the general layout of the keys, the creation of a KiCad compatible PCB, the creation of DXF outlines for integration with other CAD software, and OpenJSCAD 3D models for keyboard case creation.

## Building and testing

* The project uses `yarn` to handle dependencies, build, test, and run the dev web server. While `npm` is present, it should not be used for any development related activities.
* Always use `yarn add` when you need to install a new dependency, do NOT use `npm` directly.
* Before making any changes, make sure the target builds and the tests pass. Use `yarn build` and `yarn test`, respectively.
* When running tests with `yarn test`, add the `--verbose` argument to see failure reasons and additional test details.
* Prefer test-drive development; first write the tests for the bug fix or new feature, make sure they fail in the expected way, then make them pass.
* Try to make tests fast, for example by mocking heavy operations or other similar things when appropriate.
* Use `yarn knip` to tidy up dependencies before finishing. Always ignore unusued files warning for files in the `patch` of `public` directories.
* Use `yarn format` and `yarn lint` to check and fix formatting errors before finishing and committing files. You MUST always run `yarn format` before committing any file.

## Design principles

* When writing unit tests, follow the "Arrange, Act, Assert" pattern and clearly delineate the three.

## Coding principles

* Code should always prioritize human legibility and clarity over least lines of codes.
* Prioritize small and incremental changes, captured in a single commit. It's easier for a human reviewer to spend 5 minutes to review a small change than set aside 30 minutes to review a large one. In general each change should be a self-contained one, this means that:
  * The change addresses **just one thing**. This is usally just one part of a feature, rather than the whole feature at once.
  * The change should include related test code.
  * The commit description should explain what the committed changes aim to address. Avoid repeating the same general context, and focus on information that makes it possible for the reviewer to understand the change and the reasoning behind it. Briefly call out things that will be implemented at a later stage, but avoid including too much future planning.