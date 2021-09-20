const { basename } = require('path');
const { watch: gulpWatch } = require('gulp');
const watchify = require('watchify');
const browserSync = require('browser-sync').create();
const scriptEntries = require('../helpers/script-entries');
const browserifyHelper = require('../helpers/browserify');

const serve = () => {
    browserSync.init({
        proxy: global.gulppress.getProjectBaseUrl(),
        watchOptions: {
            ignored: [
                'assets/src/**/*',
                'assets/dist/**/*',
            ]
        },
        files: ['./src/**/*.php'],
    });

    const themePaths = global.gulppress.getThemePaths();

    themePaths.forEach(themePath => {
        // Watch for sass changes
        gulpWatch('assets/src/sass/{*,**/*}.scss', { cwd: themePath }, global.gulppress.getTask('styles'));
        
        // Watch for js changes
        scriptEntries(`${themePath}/assets/src/js`).forEach(entryScript => {
            const b = watchify(
                browserifyHelper.instance(entryScript, { ...watchify.args }),
                {
                    poll: true
                }
            );

            b.on('update', () =>
                browserifyHelper.gulpify(
                    browserifyHelper.bundle(b, entryScript, themePath),
                    entryScript,
                    themePath
                )
            );

            // Run an initial bundle so watchify can look for changes
            browserifyHelper.gulpify(
                browserifyHelper.bundle(b, entryScript, themePath), 
                entryScript, 
                themePath
            );
        });

        gulpWatch(`${themePath}/assets/dist/**/*`).on('change', path => {
            if (!path.match(/\.map$/)) {
                browserSync.reload(basename(path));
            }
        });
    });
};
serve.displayName = 'serve';
serve.description = 'Serve files using browsersync, compiling as necessary';

module.exports = serve;