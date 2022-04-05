const glob = require('glob');
const { src, dest } = require('gulp');
const plumber = require('gulp-plumber');
const noop = require('gulp-noop');
const mergeStream = require('merge-stream');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss  = require('gulp-postcss');
const rename = require('gulp-regex-rename');
const replace = require('gulp-replace');
const postCssDefaultPlugins = require('../helpers/postcss-default-plugins');
const onError = require('../helpers/on-error');

sass.compiler = require('sass');

let stylesBlocks = () => {
    const themePaths = global.gulppress.getThemePaths();
    const eventDispatcher = global.gulppress.getEventDispatcher();

    const plugins = eventDispatcher.emitFilter(
        'postcss.plugins',
        postCssDefaultPlugins()
    );

    const blockPathPattern = eventDispatcher.emitFilter(
        'task.styles:blocks.block-path-pattern',
        './assets/src/sass/components/blocks/!(*_abstract*).scss'
    );

    return mergeStream(themePaths.map(themePath => {
        // Create stream
        let stream = src(blockPathPattern, {sourcemaps:false, cwd: themePath, base: ''})
            .pipe(plumber({ errorHandler: onError('styles:blocks') }))
            .pipe(sourcemaps.init())
            .pipe(rename(/^_/, 'block--'))
            .pipe(replace(/@single-block-import/g, '@import'));

        // Allow filters to add to stream at the start
        stream = eventDispatcher.emitFilter(['task.styles.stream.post-src', 'stream.post-src'], stream, { streamName: 'styles' });

        // Add to stream for this task
        stream = stream.pipe(sass(eventDispatcher.emitFilter('sass.options', {
            includePaths: ['node_modules'],
            outputStyle: 'compressed',
        }, { eventName: 'styles:blocks' })));


        // Pipe through PostCSS
        stream = stream.pipe(postcss(plugins));

        // Allow filters to add to stream at the end
        stream = eventDispatcher.emitFilter(['task.styles.stream.pre-dest', 'stream.pre-dest'], stream, { streamName: 'styles' });

        // Write sourcemaps
        stream = stream.pipe(sourcemaps.write('.'))

        // Dest stream to output
        stream = stream.pipe(dest('./assets/dist/css/', {cwd: themePath, base: ''}));

        return eventDispatcher.emitFilter(['task.styles.stream.end', 'stream.end'], stream, { streamName: 'styles' });
    }));
};

stylesBlocks.displayName = 'styles:blocks';
stylesBlocks.description = 'Compile SCSS stylesheets for blocks';

module.exports = stylesBlocks;