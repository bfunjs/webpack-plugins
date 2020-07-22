import assets from './rules/assets';
import babel from './rules/babel';
import fonts from './rules/fonts';
import style from './rules/style';
import less from './rules/less';
import template from './rules/template';

const { autoDetectJsEntry } = global.common;
const WebpackChain = require('webpack-chain');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssets = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const rules = { assets, babel, fonts, style, less, template };

export async function createWebpackConfig(options, filters = []) {
    const wConfig = new WebpackChain();

    if (process.env.NODE_ENV === 'production') {
        wConfig.mode('production');
        wConfig.optimization.minimize(true)
        wConfig.optimization.minimizer('TerserWebpackPlugin').use(TerserWebpackPlugin);
        wConfig.optimization.minimizer('OptimizeCssAssets').use(OptimizeCssAssets);
    } else {
        wConfig.mode('development');
        wConfig.optimization.minimize(false);
    }

    wConfig.resolve.extensions.add('.js').add('.json');

    const tmp = Object.keys(rules);
    for (let i = 0, l = tmp.length; i < l; i++) {
        const key = tmp[i];
        if (filters.indexOf(key) > -1) continue;
        await rules[key](wConfig, options);
    }

    return wConfig;
}

export async function init(ctx, next) {
    const { options = {} } = ctx.solution || {};
    const { clean, wConfig } = options;
    const webpack = await createWebpackConfig(options);

    if (clean !== false) {
        let defaultOptions = Object.assign({
            verbose: false,
            dry: false,
        }, typeof clean === 'object' ? clean : {});
        webpack.plugin('clean').use(CleanWebpackPlugin, [ defaultOptions ])
    }
    if (wConfig) webpack.merge(wConfig);

    if (!ctx.solution.webpack) ctx.solution.webpack = [];
    ctx.solution.webpack.push(webpack);

    await next();

    const list = [];
    for (let i = 0, l = ctx.solution.webpack.length; i < l; i++) {
        const config = await ctx.solution.webpack[i].toConfig();
        config.entry = autoDetectJsEntry(config.entry);
        list.push(config);
    }
    ctx.solution.webpack = list;
}