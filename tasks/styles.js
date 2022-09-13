const { src, dest } = require('gulp');
const plumber = require('gulp-plumber');
const mergeStream = require('merge-stream');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss  = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const postCssEase = require('postcss-easing-gradients');
const postCssDefaultPlugins = require('../helpers/postcss-default-plugins');
const onError = require('../helpers/on-error');

sass.compiler = require('sass');

const styles = () => {
    const themePaths = global.gulppress.getThemePaths();
    const eventDispatcher = global.gulppress.getEventDispatcher();

    const plugins = eventDispatcher.emitFilter(
      'postcss.plugins',
      postCssDefaultPlugins()
  );

    return mergeStream(themePaths.map(themePath => {
        // Create stream
        let stream = src('./assets/src/sass/*.scss', {sourcemaps:false, cwd: themePath, base: ''})
            .pipe(plumber({ errorHandler: onError('styles') }))
            .pipe(sourcemaps.init());

        // Allow filters to add to stream at the start
        stream = eventDispatcher.emitFilter(['task.styles.stream.post-src', 'stream.post-src'], stream, { streamName: 'styles' });

        // Add to stream for this task
        stream = stream.pipe(sass(eventDispatcher.emitFilter('sass.options', {
                includePaths: ['node_modules'],
                outputStyle: 'compressed',
            }, { eventName: 'styles' })));

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
styles.displayName = 'styles';
styles.description = 'Compile SCSS stylesheets';

module.exports = styles;
