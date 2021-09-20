const glob = require('glob');
const { basename, resolve } = require('path');
const EventDispatcher = require('./event-dispatcher');
const dotenv = require('dotenv');
module.exports = class Gulppress {

    constructor(rootPath) {
        if(global.gulppress) {
            throw new Error('Gulppress already initialised');
        }

        global.gulppress = this;

        dotenv.config({ debug: rootPath });
    
        if (!process.env.WP_CONTENT_URL) {
            throw 'WP_CONTENT_URL .env value missing, used for establishing URL';
        }

        this.rootPath = rootPath;
        this.themePaths = this.loadThemePaths();
        this.tasks = this.loadDefaultTasks();
        this.eventDispatcher = new EventDispatcher();

        this.runTaskFilters();
    }

    /**
     * Get the root path
     *
     * @return {*}
     */
    getRootPath () {
      return this.rootPath;
    }

    /**
     * Glob theme paths in project
     *
     * @return {[]}
     */
    loadThemePaths () {
        const themePaths = [];

        glob.sync(`${this.rootPath}/src/themes/*`).forEach(dir => {
            themePaths.push(dir);
        });

        return themePaths;
    }

    /**
     * Get discovered theme paths
     *
     * @return {*}
     */
    getThemePaths () {
        return this.themePaths;
    }

    /**
     * Add a theme path
     * 
     * @returns {*}
     */
    addThemePath (path) {
      this.themePaths.push(path);

      return this.themePaths;
    }

    /**
     * Glob local tasks that form the set of default tasks
     *
     * @return {{}}
     */
    loadDefaultTasks () {
        const tasks = {};

        glob.sync(`${__dirname}/tasks/{*,**/*}.js`).forEach(file => {
            tasks[basename(file, '.js')] = require(resolve(file));
        });

        return tasks;
    }

    /**
     * Get all tasks registered, with modifications
     *
     * @return {{}}
     */
    getTasks () {
        return this.tasks;
    }

    /**
     * Get an individual registered task
     *
     * @param taskName
     * @return {*}
     */
    getTask (taskName) {
        if(!this.tasks[taskName]) {
            throw new Error(`No task found by name '${taskName}'`);
        }

        return this.tasks[taskName];
    }

    /**
     * Register a task
     *
     * @param task
     * @return {Gulpress}
     */
    addTask (task) {
        for(const checkProperty of ['name', 'displayName', 'description']) {
            if(!task[checkProperty]) {
                throw new Error(`Added task has no ${checkProperty}`);
            }
        }

        this.tasks[task.name] = task;

        return this;
    }

    /**
     * Rename an existing task
     * 
     * @param oldTaskName 
     * @param newTaskName 
     */
    renameTask (oldTaskName, newTaskName) {
        if (!this.tasks[oldTaskName]) {
            throw new Error(`Task ${oldTaskName} not found`);
        }

        this.tasks[newTaskName] = this.tasks[oldTaskName];
        this.tasks[newTaskName].displayName = newTaskName;
    }

    /**
     * Set the task run when running gulp with no task specified
     *
     * @param task
     */
    setDefaultTask(task) {
        this.tasks.default = task;
    }

    /**
     * Get the event dispatcher
     *
     * @return {EventDispatcher}
     */
    getEventDispatcher () {
        return this.eventDispatcher;
    }

    /**
     * Find and run task filters
     *
     * @return {Gulpress}
     */
    runTaskFilters () {
        glob.sync(`${__dirname}/task-filters/*.js`).forEach(file => {
            require(resolve(file))();
        });

        return this;
    }

    /**
     * Get the URL of the site
     * 
     * @return {*}
     */
    getProjectBaseUrl () {
        return process.env.WP_CONTENT_URL.match(/^https?:\/\/[^/]*/)[0];
    }

}
