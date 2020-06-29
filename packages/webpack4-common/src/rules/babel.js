const { resolve } = require('path');

const name = 'babel';

export default async function (webpack, { [name]: options }) {
    let defaultOptions = { presets: ['@babel/preset-env'] };
    if (typeof options === 'object') {
        defaultOptions = Object.assign(defaultOptions, options);
    }

    const rule = webpack.module.rules.createIfNotExists('js');
    if (!rule.test) rule.test = /\.js$/;

    if (!rule.exclude) rule.exclude = [];
    rule.exclude.push(resolve(process.cwd(), 'node_modules'));

    rule.use.push({
        loader: 'babel-loader',
        options: defaultOptions,
    }, name);
}