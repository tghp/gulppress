const autoprefixer = require('autoprefixer');
const postCssEase = require('postcss-easing-gradients');

module.exports = () => {
    const eventDispatcher = global.gulppress.getEventDispatcher();
    
    return [
        postCssEase(eventDispatcher.emitFilter('postcss-easing-gradients-options', {})),
        autoprefixer(eventDispatcher.emitFilter('autoprefixer.options', {
            grid: 'autoplace'
        }))
    ];
}