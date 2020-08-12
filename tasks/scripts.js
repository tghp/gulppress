const scriptEntries = require('../helpers/script-entries');
const browserifyHelper = require('../helpers/browserify');
const mergeStream = require('merge-stream');

const scripts = () => {
    const streams = [];
    const themePaths = global.gulppress.getThemePaths();

    themePaths.forEach(themePath => {
        const scriptEntriesForThemePath = scriptEntries(`${themePath}/assets/src/js`);

        if (scriptEntriesForThemePath.length) {
            scriptEntriesForThemePath.forEach(entryScript => {
                streams.push(
                    browserifyHelper.gulpify(
                        browserifyHelper.bundle(
                            browserifyHelper.instance(entryScript)
                        ),
                        entryScript,
                        themePath
                    )
                );
            })
        }
    });

    return mergeStream(streams);
};
scripts.displayName = 'scripts';
scripts.description = 'Compile JavaScript scripts using browserify';

module.exports = scripts;