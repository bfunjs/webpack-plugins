import assets from './rules/assets';
import babel from './rules/babel';
import fonts from './rules/fonts';
import style from './rules/style';
import less from './rules/less';
import template from './rules/template';

const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssets = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const { WebpackConfiguration } = require('@bfun/webpack-configuration');

export default async function (ctx, next, solutionOptions, extraOptions) {
    const { options = {} } = ctx.solution || {};
    const { clean, wConfig, ssr } = options;
    const { buildTarget } = extraOptions || {};
    const webpack = new WebpackConfiguration();

    webpack.resolve.extensions.push('.js', '.jsx', '.json');
    if (process.env.NODE_ENV === 'production') {
        webpack.production();
        webpack.optimization.minimize = true;
        webpack.optimization.minimizer = [
            new TerserWebpackPlugin(),
            new OptimizeCssAssets(),
        ];
    } else {
        webpack.development();
    }

    await babel(webpack, options);
    await assets(webpack, options);
    await style(webpack, options);
    await fonts(webpack, options);
    await less(webpack, options);
    if (!ssr || buildTarget !== 'server') {
        await template(webpack, options);
    }
    if (clean !== false) {
        let defaultOptions = Object.assign({
            verbose: false,
            dry: false,
        }, typeof clean === 'object' ? clean : {});
        webpack.plugins.push(
            new CleanWebpackPlugin(defaultOptions),
            'clean',
        )
    }

    webpack.merge(wConfig);
    if (!ctx.solution.webpack) ctx.solution.webpack = [];
    ctx.solution.webpack.push(webpack);

    await next();
}