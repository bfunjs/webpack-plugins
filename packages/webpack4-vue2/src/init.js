const path = require('path');
const { init } = require('@bfun/solution-webpack4-standard');
const nodeExternals = require('webpack-node-externals');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

const { autoDetectJsEntry } = global.common;
const name = 'vue';

function initClientConfig(clientConfig, options) {
    const {
        entry = 'entry-client.js',
        filename = 'ssr-client.json',
    } = options || {};
    clientConfig.plugins.push(
        new VueSSRClientPlugin(Object.assign({ filename })),
        'ssr-client',
    )
    clientConfig.addEntry(autoDetectJsEntry(entry));
    clientConfig.plugins.remove('clean');
}


function initServerConfig(serverConfig, options) {
    const {
        entry = 'entry-server.js',
        filename = 'ssr-server.json',
    } = options || {};
    serverConfig.plugins.push(
        new VueSSRServerPlugin(Object.assign({ filename })),
        'ssr-server',
    )
    serverConfig.addEntry(autoDetectJsEntry(entry));
    serverConfig.target = 'node';
    serverConfig.output.filename = 'server-bundle.js';
    serverConfig.output.libraryTarget = 'commonjs2';
    serverConfig.externals = [
        nodeExternals({
            whitelist: /\.css$/,
        }),
    ];
    serverConfig.plugins.remove('template');
    serverConfig.plugins.remove('clean');
    serverConfig.plugins.remove('style');
}

export default async function (ctx, next, solutionOptions) {
    const { webpack, options = {} } = ctx.solution || {};
    const { ssr = false } = solutionOptions;
    if (ssr) await init(ctx, v => v, solutionOptions);

    const [ clientConfig, serverConfig ] = webpack;
    const { vue2, style, less, client = {}, server = {} } = options;

    webpack.map(config => {
        let defaultOptions = {
            loaders: {
                css: [ 'vue-style-loader' ],
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
        if (less) defaultOptions.loaders.less = [ 'vue-style-loader', 'less-loader' ];

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

    initClientConfig(clientConfig, client);
    initServerConfig(serverConfig, server);

    await next();

    if (ssr) {
        ctx.solution.skip.push('@bfun/solution-webpack4-standard:dev');
        console.log('start ssr dev server');
    }
}
