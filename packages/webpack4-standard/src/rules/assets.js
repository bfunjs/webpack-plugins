const name = 'assets';

export default async function (webpack, { [name]: options }) {
    let defaultOptions = {
        fallback: 'file-loader',
        limit: 8192,
        name: 'assets/[name].[ext]',
    };
    if (typeof options === 'object') {
        defaultOptions = Object.assign(defaultOptions, options);
    }

    const rule = webpack.module.rules.createIfNotExists(name);
    rule.test = /\.(png|jpe?g|gif|svg)(\?.*)?$/;
    rule.use.push({
        loader: 'url-loader',
        options: defaultOptions,
    }, name)
}