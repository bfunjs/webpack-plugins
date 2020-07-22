import assets from './rules/assets';
import babel from './rules/babel';
import fonts from './rules/fonts';
import style from './rules/style';
import less from './rules/less';
import template from './rules/template';

const { autoDetectJsEntry } = global.common;
const path = require('path');
const WebpackChain = require('webpack-chain');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssets = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const rules = { assets, babel, fonts, style, less, template };

export async function createWebpackConfig(options, extra = {}) {
    const { filters = [] } = extra;
    const chain = new WebpackChain();

    if (process.env.NODE_ENV === 'production') {
        chain.mode('production');
        chain.optimization.minimize(true)
        chain.optimization.minimizer('TerserWebpackPlugin').use(TerserWebpackPlugin);
        chain.optimization.minimizer('OptimizeCssAssets').use(OptimizeCssAssets);
    } else {
        chain.mode('development');
        chain.optimization.minimize(false);
    }

    chain.resolve.extensions.add('.js').add('.json');

    const tmp = Object.keys(rules);
    for (let i = 0, l = tmp.length; i < l; i++) {
        const key = tmp[i];
        if (filters.indexOf(key) > -1) continue;
        await rules[key](chain, options);
    }

    chain.output.path(path.join(process.cwd(), 'dist')).filename('[name].js');
    return chain;
}

export async function init(ctx, next) {
    const { options = {} } = ctx.solution || {};
    const { clean, wConfig } = options;
    const chain = await createWebpackConfig(options);

    if (clean !== false) {
        let defaultOptions = Object.assign({
            verbose: false,
            dry: false,
        }, typeof clean === 'object' ? clean : {});
        chain.plugin('clean').use(CleanWebpackPlugin, [ defaultOptions ]);
    }
    if (wConfig) chain.merge(wConfig);

    if (!ctx.solution.webpack) ctx.solution.webpack = [];
    ctx.solution.webpack.push(chain);

    await next();

    const cList = [];
    for (let i = 0, l = ctx.solution.webpack.length; i < l; i++) {
        const config = await ctx.solution.webpack[i].toConfig();
        config.entry = autoDetectJsEntry(config.entry);
        cList.push(config);
    }
    ctx.solution.webpack = cList;
}