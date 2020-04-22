const scriptEntries = require('../helpers/script-entries');
const browserifyHelper = require('../helpers/browserify');
const mergeStream = require('merge-stream');


const scripts = () => {
    const themePaths = global.gulppress.getThemePaths();

    return mergeStream(themePaths.map(themePath =>
        mergeStream(scriptEntries(`${themePath}/assets/src/js`).map(entryScript =>
            browserifyHelper.gulpify(
                browserifyHelper.bundle(
                    browserifyHelper.instance(entryScript)
                ),
                entryScript,
                themePath
            )
        ))
    ));
};
scripts.displayName = 'scripts';
scripts.description = 'Compile JavaScript scripts using browserify';

module.exports = scripts;