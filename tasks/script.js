const script = () => {
    console.log('building scripts');
    return Promise.resolve('');
}
script.displayname = 'script';
script.description = 'Compile JavaScript scripts using browserify';

module.exports = script;