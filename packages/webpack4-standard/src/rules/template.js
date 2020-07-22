const { join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const name = 'template'

export default async function (chain, { [name]: options }) {
    const defaultTmplDir = global.configDir || process.cwd();
    const filename = (typeof options === 'string') ? options : 'index.html';
    let defaultOptions = {
        filename: 'index.html',
        template: join(defaultTmplDir, filename),
        inject: 'body',
        minify: {
            removeComments: false,
            collapseWhitespace: true,
            removeAttributeQutes: true,
        },
        chunksSortMode: 'none',
    };
    if (typeof options === 'object') {
        defaultOptions = Object.assign(defaultOptions, options);
    }

    chain.plugin(name).use(HtmlWebpackPlugin, [ defaultOptions ]);
}