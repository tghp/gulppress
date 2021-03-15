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
                const browserifyFilterData = {
                    entryScript,
                    themePath
                };

                const instance = global.gulppress.getEventDispatcher().emitFilter(
                    'browserify.instance',
                    browserifyHelper.instance(entryScript),
                    browserifyFilterData
                );

                const bundle = global.gulppress.getEventDispatcher().emitFilter(
                    'browserify.bundle',
                    browserifyHelper.bundle(instance, entryScript, themePath),
                    browserifyFilterData
                );                

                streams.push(
                    browserifyHelper.gulpify(
                        bundle,
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