const conf = require('rc')('gulppress', {
  notification: true,
  notificationSuccessSound: false,
  notificationErrorSound: 'Beep'
});

module.exports = conf;