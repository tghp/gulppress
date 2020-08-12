const { series } = require('gulp');

const build = (done) => {
    const tasks = global.gulppress.getTasks();

    const buildTaskNames = Object.keys(tasks)
        .filter(taskName =>
            taskName.indexOf('watch') === -1 &&
            taskName !== 'default' &&
            taskName !== 'build'
        );

    const buildTasks = buildTaskNames.map(taskName => tasks[taskName]);

    return series(...buildTasks)(done);
};
build.displayName = 'build';
build.description = 'Build application. Run all tasks except watch tasks and default task.';

module.exports = build;