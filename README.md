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

## Configuration

Gulppress allows some global customisation for all instances, create a file in one of the following locations:

* ~/.gulppressrc
* ~/config/gulppress/config
* /etc/gulppressrc
* /etc/gulppress/config

The file should be in JSON format. The following keys can then be used to configure:

| Key | Value |
|-----|-------|
| notification | boolean. Default: true. Enable or disable notifications entirely. |
| notificationSuccessSound | boolean or string. Default: false. Set to false to disable entirely. Set to a string to use that sound as a notifcation. Either a path to a wav or on mac, one of: Basso, Blow, Bottle, Frog, Funk, Glass, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink. |
| notificationSuccessSound | boolean or string. Default: 'Ping'. Set to false to disable entirely. Set to a string to use that sound as a notifcation. Either a path to a wav or on mac, one of: Basso, Blow, Bottle, Frog, Funk, Glass, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink. |