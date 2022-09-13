const { dest } = require('gulp');
const { basename } = require('path');
const browserify = require('browserify');
const tsify = require('tsify');
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

    const instance = browserify(browserifyOpts);
    instance.plugin(tsify);

    return instance;
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

    const reactPreset = ['@babel/preset-react', {}];

    if (global.gulppress.getOption('preact')) {
        reactPreset[1].pragma = 'h';
    }

    const babelifyOpts = global.gulppress.getEventDispatcher().emitFilter('browserify.bundle.babelify-options', {
        'presets': [
            ['@babel/preset-env'],
            '@babel/preset-typescript',
            reactPreset,
        ],
        'extensions': ['.js', '.ts', '.tsx'],
        sourceMaps: false
    });

    const aliasifyOpts = global.gulppress.getEventDispatcher().emitFilter('browserify.bundle.aliasify-options', {
        aliases: {},
        verbose: false
    });

    if (global.gulppress.getOption('preact')) {
        aliasifyOpts.aliases['react'] = 'preact/compat';
        aliasifyOpts.aliases['react-dom'] = 'preact/compat';
    }

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
                    babelifyOpts.global = true;
                    b.transform(tfilter(babelify, { filter: filename => {
                        return filename.indexOf(`node_modules/${dep}`) !== -1;
                    } }), babelifyOpts);

                    aliasifyOpts.global = true;
                    b.transform(tfilter(aliasify, { filter: filename => {
                        return filename.indexOf(`node_modules/${dep}`) !== -1;
                    } }), aliasifyOpts);
                }
            });

            pathsToTransform.forEach(transformPath => {
                babelifyOpts.global = true;
                b.transform(tfilter(babelify, { filter: filename => {
                    return filename.indexOf(transformPath) === 0;
                } }), babelifyOpts);

                aliasifyOpts.global = true;
                b.transform(tfilter(aliasify, { filter: filename => {
                    return filename.indexOf(transformPath) === 0;
                } }), aliasifyOpts);
            });
        }
    }

    b.transform(babelify, babelifyOpts);
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

    const scriptBasename = basename(entryScript).replace(/\.ts$/, '.js');

    return preBundleInstance.bundle()
        .on('error', onError('browserify') )
        .pipe(exorcist(`${themePath}/assets/dist/js/${scriptBasename}.map`));
};

module.exports.gulpify = (textStream, entryScript, themePath) => {
    const eventDispatcher = global.gulppress.getEventDispatcher();

    const scriptBasename = basename(entryScript).replace(/\.ts$/, '.js');

    let stream = textStream
        .pipe(source(scriptBasename))
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