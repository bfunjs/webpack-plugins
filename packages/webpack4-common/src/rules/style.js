const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const name = 'style'

export default async function (webpack, { [name]: options }) {
    let defaultOptions = { filename: 'css/[name].css' };
    if (typeof options === 'object') {
        defaultOptions = Object.assign(defaultOptions, options);
    }

    const rule = webpack.module.rules.createIfNotExists(name);
    if (!rule.test) rule.test = /\.css$/;

    rule.use.push({
        loader: MiniCssExtractPlugin.loader,
        options: {
            hmr: process.env.NODE_ENV !== 'production',
        },
    }, 'MiniCssExtractPlugin');
    rule.use.push({ loader: 'css-loader' }, 'CssLoader');
    // px2rem(rule.use, allOptions);

    webpack.plugins.push(
        new MiniCssExtractPlugin(defaultOptions),
        name,
    )
}