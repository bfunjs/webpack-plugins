const VueLoaderPlugin = require('vue-loader/lib/plugin');

const name = 'vue';

export default async function (ctx, next) {
    const { webpack: [webpack], options = {} } = ctx.solution || {};
    const { vue2, style, less } = options;

    let defaultOptions = {
        loaders: {
            css: ['vue-style-loader'],
        },
        preserveWhitespace: false,
        transformToRequire: {
            video: 'src',
            source: 'src',
            img: 'src',
            image: 'xlink:href',
        },
    };
    if (typeof vue2 === 'object') defaultOptions = Object.assign(defaultOptions, vue2);
    if (style) defaultOptions.loaders.css.push('css-loader');
    if (less) defaultOptions.loaders.less = ['vue-style-loader', 'less-loader'];

    webpack.resolve.extensions.push('.vue');
    const rule = webpack.module.rules.createIfNotExists(name);
    rule.test = /\.vue$/;
    rule.use.push({
        loader: 'vue-loader',
        options: defaultOptions,
    }, name);
    webpack.plugins.push(
        new VueLoaderPlugin(),
    );

    await next();
}
