module.exports = function (extendedTasksCb) {
    return extendedTasksCb({
        'script': require('./tasks/script'),
        'style': require('./tasks/style')
    });
}
