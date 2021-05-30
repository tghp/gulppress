const { dest } = require('gulp');
const { basename } = require('path');
const browserify = require('browserify');
const babelify = require('babelify');
const aliasify = require('aliasify');
const uglifyify = require('uglifyify');
const plumber = require('gulp-plumber');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const tfilter = require('tfilter');
const parent = require('parent-package-json');
const exorcist = require('exorcist')
const onError = require('./on-error');

module.exports.instance = (entry, opts) => {
    const browserifyOpts = global.gulppress.getEventDispatcher().emitFilter(
        'browserify.options',
        Object.assign({}, opts, {
            entries: entry,
            debug: true,
            cache: {}, 
            packageCache: {}
        })
    );

    return browserify(browserifyOpts);
};

module.exports.bundle = (b, entryScript, themePath) => {
    /**
     * Babelify
     */
    const dependenciesToTransform = global.gulppress.getEventDispatcher().emitFilter(
        'browserify.bundle.babelify-dependencies-to-transform', [
            '@tghp/groundwork.js'
        ]
    );

    const pathsToTransform = global.gulppress.getEventDispatcher().emitFilter(
        'browserify.bundle.babelify-paths-to-transform', []
    );

    const balelifyOpts = global.gulppress.getEventDispatcher().emitFilter('browserify.bundle.babelify-options', {
        "presets": ["@babel/preset-env"],
        "plugins": [
            ["@babel/plugin-transform-runtime"],
            ["@babel/plugin-proposal-class-properties"]
        ],
        sourceMaps: false
    });

    const aliasifyOpts = global.gulppress.getEventDispatcher().emitFilter('browserify.bundle.aliasify-options', {
        aliases: {},
        verbose: false
    });

    let parentPackage = parent(process.env.PWD);

    if (parentPackage) {
        parentPackage = parentPackage.parse();
    } else {
        parentPackage = require(process.env.PWD + '/package.json');
    }

    if (parentPackage) {
        const parentDeps = Object.assign(parentPackage.dependencies || {}, parentPackage.devDependencies || {});

        if (parentDeps) {
            dependenciesToTransform.forEach(dep => {
                if (Object.keys(parentDeps).indexOf(dep) !== -1) {
                    balelifyOpts.global = true;
                    b.transform(tfilter(babelify, { filter: filename => {
                        return filename.indexOf(`node_modules/${dep}`) !== -1;
                    } }), balelifyOpts);

                    aliasifyOpts.global = true;
                    b.transform(tfilter(aliasify, { filter: filename => {
                        return filename.indexOf(`node_modules/${dep}`) !== -1;
                    } }), aliasifyOpts);
                }
            });

            pathsToTransform.forEach(transformPath => {
                balelifyOpts.global = true;
                b.transform(tfilter(babelify, { filter: filename => {
                    return filename.indexOf(transformPath) === 0;
                } }), balelifyOpts);

                aliasifyOpts.global = true;
                b.transform(tfilter(aliasify, { filter: filename => {
                    return filename.indexOf(transformPath) === 0;
                } }), aliasifyOpts);
            });
        }
    }

    b.transform(babelify, balelifyOpts);
    b.transform(aliasify, aliasifyOpts);

    b.transform(uglifyify, global.gulppress.getEventDispatcher().emitFilter('browserify.bundle.uglifyify-options', { global: true }));

    const preBundleInstance = global.gulppress.getEventDispatcher().emitFilter(
        'browserify.pre-bundle',
        b,
        {
            entryScript,
            themePath
        }
    );

    return preBundleInstance.bundle()
        .on('error', onError('browserify') )
        .pipe(exorcist(`${themePath}/assets/dist/js/${basename(entryScript)}.map`));
};

module.exports.gulpify = (textStream, entryScript, themePath) => {
    const eventDispatcher = global.gulppress.getEventDispatcher();

    let stream = textStream
        .pipe(source(basename(entryScript)))
        .pipe(buffer())
        .pipe(plumber({ errorHandler: onError('browserify') }));

    // Allow filters to add to stream at the start
    stream = eventDispatcher.emitFilter(['browserify.gulpify.stream.post-src', 'stream.post-src'], stream, { streamName: 'browserify' });

    // Allow filters to add to stream at the end
    stream = eventDispatcher.emitFilter(['browserify.gulpify.stream.pre-dest', 'stream.pre-dest'], stream, { streamName: 'browserify' });

    // Dest stream to output
    stream = stream.pipe(dest('./assets/dist/js/', { sourcemaps: '.', cwd: themePath, base: '' }));

    return eventDispatcher.emitFilter(['browserify.gulpify.stream.end', 'stream.end'], stream, { streamName: 'browserify' });
}