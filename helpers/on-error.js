const notify = require('gulp-notify');
const { resetNotifyType } = require('./notify-threshold');

module.exports = function (streamName) {
    return function (err) {
        resetNotifyType(streamName);

        notify.onError({
            title: 'Error',
            message: '<%= error.message %>',
            sound: 'Beep',
            onLast: true
        })(err);
    
        this.emit('end');
    };
}