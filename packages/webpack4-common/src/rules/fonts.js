const name = 'fonts';

export default async function (webpack, { [name]: options }) {
    let defaultOptions = {
        fallback: 'file-loader',
        limit: 8192,
        name: 'fonts/[name].[ext]',
    };
    if (typeof options === 'object') {
        defaultOptions = Object.assign(defaultOptions, options);
    }

    const rule = webpack.module.rules.createIfNotExists(name);
    rule.test = /\.(woff2?|eot|ttf|otf)(\?.*)?$/;
    rule.use.push({
        loader: 'url-loader',
        options: defaultOptions,
    }, name)
}