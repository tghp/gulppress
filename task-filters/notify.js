const notify = require('gulp-notify');

module.exports = () => {
    // Add notify to all streams
    global.gulppress.getEventDispatcher().onFilter('stream.end', data => {
        data.filterValue = data.filterValue.pipe(notify({
            message: `${data.streamName ? data.streamName : 'task'} finished`,
            onLast: true
        }));
    });
};