const glob = require('glob');

module.exports = themeScriptPath => {
    const scriptEntries = [];

    glob.sync(`${themeScriptPath}/*.{js,ts}`).forEach(file => {
        scriptEntries.push(file);
    });

    return scriptEntries;
}