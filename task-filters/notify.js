const notify = require('gulp-notify');
const gulpIf = require('gulp-if');
const { resetNotifyType, canNotifyType } = require('../helpers/notify-threshold');
const conf = require('../helpers/config');

module.exports = () => {
    // Add notify to all streams
    global.gulppress.getEventDispatcher().onFilter('stream.end', data => {
        if (conf.notification) {
          const notification = {
            message: `${data.streamName ? data.streamName : 'task'} finished`,
            onLast: true
          };

          if (conf.notificationSuccessSound) {
            notification.sound = conf.notificationSuccessSound;
          }

          data.filterValue.pipe(
              gulpIf(
                  () => {
                      if (canNotifyType(data.streamName)) {
                          resetNotifyType(data.streamName, 0);
                          return true;
                      } else {
                          return false;
                      }
                  },
                  notify(notification)
              )
          );
        }
    });
};