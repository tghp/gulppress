const glob = require('glob');

module.exports = themeScriptPath => {
    const scriptEntries = [];

    glob.sync(`${themeScriptPath}/*.js`).forEach(file => {
        scriptEntries.push(file);
    });

    return scriptEntries;
}