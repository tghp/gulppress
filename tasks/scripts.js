const scriptEntries = require('../helpers/script-entries');
const browserifyHelper = require('../helpers/browserify');
const mergeStream = require('merge-stream');
const noop = require('gulp-noop');

const scripts = () => {
    const themePaths = global.gulppress.getThemePaths();

    return mergeStream(themePaths.map(themePath => {
        const scriptEntriesForThemePath = scriptEntries(`${themePath}/assets/src/js`);
        
        if (scriptEntriesForThemePath) {
            return mergeStream(scriptEntriesForThemePath.map(entryScript =>
                browserifyHelper.gulpify(
                    browserifyHelper.bundle(
                        browserifyHelper.instance(entryScript)
                    ),
                    entryScript,
                    themePath
                )
            ))
        } else {
            return noop();
        }
    }));
};
scripts.displayName = 'scripts';
scripts.description = 'Compile JavaScript scripts using browserify';

module.exports = scripts;