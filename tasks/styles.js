const { src, dest } = require('gulp');
const plumber = require('gulp-plumber');
const mergeStream = require('merge-stream');
const sass = require('gulp-dart-sass');
const postcss  = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const postCssEase = require('postcss-easing-gradients');
const postCssInlineSvg = require('postcss-inline-svg');

const styles = () => {
    const themePaths = global.gulppress.getThemePaths();
    const eventDispatcher = global.gulppress.getEventDispatcher();

    const plugins = eventDispatcher.emitFilter(
        'postcss.plugins',
        [
            postCssEase(),
            postCssInlineSvg(),
            autoprefixer(eventDispatcher.emitFilter('autoprefixer.options', {
                grid: 'autoplace'
            }))
        ]
    );

    return mergeStream(themePaths.map(themePath => {
        // Create stream
        let stream = src('./assets/src/sass/*.scss', {sourcemaps: true, cwd: themePath, base: ''})
            .pipe(plumber());

        // Allow filters to add to stream at the start
        stream = eventDispatcher.emitFilter(['task.styles.stream.post-src', 'stream.post-src'], stream, { streamName: 'styles' });

        // Add to stream for this task
        stream.pipe(sass(eventDispatcher.emitFilter('sass.options', {
                includePaths: ['node_modules']
            }, { eventName: 'styles' })))
            .pipe(postcss(plugins));

        // Allow filters to add to stream at the end
        stream = eventDispatcher.emitFilter(['task.styles.stream.pre-dest', 'stream.pre-dest'], stream, { streamName: 'styles' });

        // Dest stream to output
        stream = stream.pipe(dest('./assets/dist/css/', {sourcemaps: '.', cwd: themePath, base: ''}));

        return eventDispatcher.emitFilter(['task.styles.stream.end', 'stream.end'], stream, { streamName: 'styles' });
    }));
};
styles.displayName = 'styles';
styles.description = 'Compile SCSS stylesheets';

module.exports = styles;