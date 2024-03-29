const { watch: gulpWatch } = require('gulp');
const watchify = require('watchify');
const scriptEntries = require('../helpers/script-entries');
const browserifyHelper = require('../helpers/browserify');

const watch = () => {
    const themePaths = global.gulppress.getThemePaths();

    themePaths.forEach(themePath => {
        // Watch for sass changes
        const stylesWatchArgs = global.gulppress.getEventDispatcher().emitFilter(
          'task.watch.styles.options',
          { cwd: themePath }
        );

        gulpWatch('assets/src/sass/{*,**/*}.scss', stylesWatchArgs, global.gulppress.getTask('styles'));

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
    });


};
watch.displayName = 'watch';
watch.description = 'Watch for changes and compile as necessary';

module.exports = watch;