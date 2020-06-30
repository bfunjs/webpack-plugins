const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const name = 'less'

export default async function (webpack, { [name]: options }) {
    const rule = webpack.module.rules.createIfNotExists(name);
    if (!rule.test) rule.test = /\.less$/;

    rule.use.push({
        loader: MiniCssExtractPlugin.loader,
        options: {
            hmr: process.env.NODE_ENV !== 'production',
        },
    }, 'MiniCssExtractPlugin');
    rule.use.push({ loader: 'css-loader' }, 'CssLoader');
    // px2rem(rule.use, allOptions);
    rule.use.push({ loader: 'less-loader' }, 'LessLoader');
}