const style = () => {
    console.log('building styles');
    return Promise.resolve('');
};
style.displayName = 'style';
style.description = 'Compile SCSS stylesheets';

module.exports = style;