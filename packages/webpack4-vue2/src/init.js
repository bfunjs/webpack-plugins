const path = require('path');
const { init } = require('@bfun/solution-webpack4-standard');
const nodeExternals = require('webpack-node-externals');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

const { autoDetectJsEntry } = global.common;
const name = 'vue';

function initCommonConfig(config, options) {
    const { vue2, style, less, client = {} } = options;

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
        'vue-loader',
    );
    config.output.path = path.join(process.cwd(), 'dist');
}

function initClientConfig(clientConfig, options) {
    const { client = {} } = options;
    const { entry = 'entry-client.js', filename = 'ssr-client.json' } = client || {};
    clientConfig.plugins.push(
        new VueSSRClientPlugin(Object.assign({ filename })),
        'ssr-client',
    )
    clientConfig.addEntry(autoDetectJsEntry(entry));

    initCommonConfig(clientConfig, options);
    clientConfig.plugins.remove('clean');
}


function initServerConfig(serverConfig, options) {
    const { server = {} } = options;
    const { entry = 'entry-server.js', filename = 'ssr-server.json' } = server || {};
    serverConfig.plugins.push(
        new VueSSRServerPlugin(Object.assign({ filename })),
        'ssr-server',
    )
    serverConfig.addEntry(autoDetectJsEntry(entry));
    initCommonConfig(serverConfig, options);
    serverConfig.target = 'node';
    serverConfig.output.path = path.join(process.cwd(), 'dist');
    serverConfig.output.filename = 'server-bundle.js';
    serverConfig.output.libraryTarget = 'commonjs2';
    serverConfig.externals = nodeExternals({ whitelist: /\.css$/ });
    serverConfig.plugins.remove('template');
    serverConfig.plugins.remove('clean');
}

export default async function (ctx, next, solutionOptions) {
    const { webpack, options = {} } = ctx.solution || {};
    const { ssr = false } = solutionOptions;
    if (ssr) await init(ctx, v => v, solutionOptions, { buildTarget: 'server' });

    const [ clientConfig, serverConfig ] = webpack;
    if (ssr) {
        initClientConfig(clientConfig, options);
        initServerConfig(serverConfig, options);
        ctx.solution.skip.push('@bfun/solution-webpack4-standard:dev');
    } else {
        initCommonConfig(clientConfig, options);
    }

    await next();
}
