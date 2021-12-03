const notify = require('gulp-notify');
const { resetNotifyType } = require('./notify-threshold');
const conf = require('./config');

module.exports = function (streamName) {
    return function (err) {
        resetNotifyType(streamName);

        if (conf.notification) {
          const errorNotification = {
            title: 'Error',
            message: '<%= error.message %>',
            onLast: true
          };

          if (conf.notificationErrorSound) {
            errorNotification.sound = conf.notificationErrorSound;
          }

          notify.onError(errorNotification)(err);
        }
        this.emit('end');
    };
}