const notify = require('gulp-notify');
const gulpIf = require('gulp-if');
const { resetNotifyType, canNotifyType } = require('../helpers/notify-threshold');

module.exports = () => {
    // Add notify to all streams
    global.gulppress.getEventDispatcher().onFilter('stream.end', data => {
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
                notify({
                    message: `${data.streamName ? data.streamName : 'task'} finished`,
                    onLast: true
                })
            )
        );
    });
};