const { dest } = require('gulp');
const { basename } = require('path');
const browserify = require('browserify');
const babelify = require('babelify');
const uglifyify = require('uglifyify');
const plumber = require('gulp-plumber');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

module.exports.instance = (entry, opts) => {
    const browserifyOpts = Object.assign({}, opts, {
        entries: entry,
        debug: true
    });

    return browserify(browserifyOpts);
};

module.exports.bundle = b => {
    return b
        .transform(babelify, {
            "presets": ["@babel/preset-env"],
            "plugins": [
                ["@babel/plugin-transform-runtime"],
                ["@babel/plugin-proposal-class-properties"]
            ]
        })
        .transform(uglifyify, { global: true })
        .bundle();
};

module.exports.gulpify = (stream, entryScript, themePath) => {
    return stream
        .pipe(source(basename(entryScript)))
        .pipe(buffer())
        .pipe(plumber())
        // TODO: split sourcemap (with exorcist?)
        .pipe(dest('./assets/dist/js/', { sourcemaps: '.', cwd: themePath, base: '' }));
}