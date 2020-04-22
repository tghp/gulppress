const { src, dest } = require('gulp');
const plumber = require('gulp-plumber');
const mergeStream = require('merge-stream');
const sass = require('gulp-dart-sass');
const postcss  = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const postCssEase = require('postcss-easing-gradients');


const styles = () => {
    const themePaths = global.gulppress.getThemePaths();

    const plugins = [
        postCssEase(),
        autoprefixer({
            grid: 'autoplace'
        })
    ];

    return mergeStream(themePaths.map(themePath =>
        src('./assets/src/sass/*.scss', { sourcemaps: true, cwd: themePath, base: '' })
            .pipe(plumber())
            .pipe(sass({
                // includePaths: ['node_modules', 'native-search/node_modules']
            }))
            .pipe(postcss(plugins))
            .pipe(dest('./assets/dist/css/', { sourcemaps: '.', cwd: themePath, base: '' }))
    ));
};
styles.displayName = 'styles';
styles.description = 'Compile SCSS stylesheets';

module.exports = styles;