const timeout = 1000;

module.exports = {
    resetNotifyType: (key, overrideTimeout) => {
        if (!global._notifyThresholds) {
            global._notifyThresholds = {};
        }

        global._notifyThresholds[key] = setTimeout(() => {
            clearInterval(global._notifyThresholds[key]);
            delete global._notifyThresholds[key];
        }, typeof overrideTimeout !== 'undefined' ? overrideTimeout : timeout);
    },

    canNotifyType: key => {
        return !global._notifyThresholds || !global._notifyThresholds[key];
    }
}