const { join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const name = 'template'

export default async function (webpack, { [name]: options }) {
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
    };
    if (typeof options === 'object') {
        defaultOptions = Object.assign(defaultOptions, options);
    }

    webpack.plugins.push(
        new HtmlWebpackPlugin(defaultOptions),
        name,
    )
}