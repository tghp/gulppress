# gulppress

An opioninated, pre-structured approach to build pipelines using gulp tasks for WordPress projects.

Out of the box, gulppress only really cares about scripts and styles in your theme, but can be extended to run any script a regular gulpfile would. This structure is baked into this project simply for standardisation purposes.

## Pre-determined Structure

Gulppress will:

- Look at any theme in `src/themes`, if there are multiple it will operate each.
- Compile each script found using this glob: `src/themes/*/assets/src/js/*.js`. Any scripts in sub-folders will not compile and should be used for organisational purposees. See [@tghp/gulppress](https://github.com/tghp/gulppress)
- Compile each SCSS stylesheet found using this glob: `src/themes/*/assets/src/sass/*.scss`

## Extending

Provide a `gulppress.extend.js` script in the root of the project, and export a function. An instances of the `Gulppress` class is then available via `global.gulppress`.
