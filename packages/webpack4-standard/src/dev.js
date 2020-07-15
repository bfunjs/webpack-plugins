const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const chokidar = require('chokidar');

const { autoDetectJsEntry } = global.common;

async function setupDevServer({ host, port, wConfig, devServer }) {
    const devServerEntry = [
        `webpack-dev-server/client?http://${host}:${port}`,
        'webpack/hot/dev-server',
    ];
    wConfig.forEach(item => {
        Object.keys(item.entry).forEach(name => {
            item.entry[name] = devServerEntry.concat(item.entry[name]);
        });
        item.plugins.push(new webpack.HotModuleReplacementPlugin());
    });

    const compiler = webpack(wConfig[0]);
    compiler.apply(new FriendlyErrorsWebpackPlugin());

    let hasCompile = false;
    compiler.plugin('done', stats => {
        if (stats.hasErrors()) {
            console.error(stats.toString({ colors: true }));
            console.info('\n----------- 构建失败 ----------'.rainbow);
        } else if (!hasCompile) {
            hasCompile = true;
        } else {
            console.info('\n----------- 构建完成 ----------'.rainbow);
        }
    });

    const devServerOption = {
        publicPath: '/',
        hot: true,
        compress: true,
        disableHostCheck: true,
        quiet: true,
        overlay: false,
        clientLogLevel: 'warning', // "none" | "info" | "warning" | "error"
        ...(wConfig[0].devServer || {}),
        ...devServer,
    };
    const server = new WebpackDevServer(compiler, devServerOption);
    server.listen(port, '0.0.0.0');
}

export default async function (ctx, next, solutionOptions) {
    const { host, port, solution, filepath } = ctx;
    const { webpack, options } = solution || {};
    const { devServer = {} } = options;

    const wConfig = [];
    for (let i = 0, l = webpack.length; i < l; i++) {
        const config = await webpack[i].toConfig();
        config.entry = autoDetectJsEntry(config.entry);
        wConfig.push(config);
    }

    await setupDevServer({ host, port, wConfig, devServer });

    if (filepath) chokidar.watch(filepath).on('change', () => process.send('restart'));
}
