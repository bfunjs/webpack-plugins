const { init } = require('@bfun/solution-webpack4-standard');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

const name = 'vue';

export default async function (ctx, next, solutionOptions) {
    await init(ctx, v => v, solutionOptions);

    const { webpack, options = {} } = ctx.solution || {};
    const [clientConfig, serverConfig] = webpack;
    const { vue2, style, less, client, server } = options;
    const { ssr = false } = solutionOptions;

    webpack.map(config => {
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

        config.resolve.extensions.push('.vue');
        const rule = config.module.rules.createIfNotExists(name);
        rule.test = /\.vue$/;
        rule.use.push({
            loader: 'vue-loader',
            options: defaultOptions,
        }, name);
        config.plugins.push(
            new VueLoaderPlugin(),
        );
    });

    const {
        entry = 'entry-client.js',
        filename = 'ssr-client.json',
    } = client || {};
    clientConfig.plugins.push(
        new VueSSRClientPlugin(Object.assign({ filename })),
        'ssr-client',
    )

    await next();

    if (ssr) {
        ctx.solution.skip.push('@bfun/solution-webpack4-standard:dev');
        console.log('start ssr dev server');
    } else {

    }
}
