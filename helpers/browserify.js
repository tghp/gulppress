const { dest } = require('gulp');
const { basename } = require('path');
const browserify = require('browserify');
const babelify = require('babelify');
const uglifyify = require('uglifyify');
const plumber = require('gulp-plumber');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

module.exports.instance = (entry, opts) => {
    const browserifyOpts = global.gulppress.getEventDispatcher().emitFilter(
        'browserify.options',
        Object.assign({}, opts, {
            entries: entry,
            debug: true
        })
    );

    return browserify(browserifyOpts);
};

module.exports.bundle = b => {
    return b
        .transform(babelify, global.gulppress.getEventDispatcher().emitFilter('browserify.bundle.babelify-options', {
            "presets": ["@babel/preset-env"],
            "plugins": [
                ["@babel/plugin-transform-runtime"],
                ["@babel/plugin-proposal-class-properties"]
            ]
        }))
        .transform(uglifyify, global.gulppress.getEventDispatcher().emitFilter('browserify.bundle.uglifyify-options', { global: true }))
        .bundle();
};

module.exports.gulpify = (textStream, entryScript, themePath) => {
    const eventDispatcher = global.gulppress.getEventDispatcher();

    let stream = textStream
        .pipe(source(basename(entryScript)))
        .pipe(buffer())
        .pipe(plumber());

    // Allow filters to add to stream at the start
    stream = eventDispatcher.emitFilter(['browserify.gulpify.stream.post-src', 'stream.post-src'], stream, { streamName: 'browserify' });

    // TODO: split sourcemap (with exorcist?)

    // Allow filters to add to stream at the end
    stream = eventDispatcher.emitFilter(['browserify.gulpify.stream.pre-dest', 'stream.pre-dest'], stream, { streamName: 'browserify' });

    // Dest stream to output
    stream = stream.pipe(dest('./assets/dist/js/', { sourcemaps: '.', cwd: themePath, base: '' }));

    return eventDispatcher.emitFilter(['browserify.gulpify.stream.end', 'stream.end'], stream, { streamName: 'browserify' });
}