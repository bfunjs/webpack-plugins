const name = 'rem';

export async function init(ctx, next) {
    const { options = {} } = ctx.solution || {};
    const { px2rem, rootValue, propList, minPixelValue, ...others } = options.rem || {};
    let postcssOptions = { plugins: [] };

    let defaultOptions = {
        rootValue: rootValue || 100,
        propList: propList || [ '*' ],
        minPixelValue: minPixelValue || 1.5,
    };
    if (typeof px2rem === 'object') {
        defaultOptions = Object.assign(defaultOptions, px2rem);
    }
    postcssOptions.plugins.push(
        require('postcss-pxtorem')(defaultOptions),
    );

    if (typeof others === 'object') {
        postcssOptions = Object.assign(postcssOptions, others);
    }

    const [ chain ] = options.webpack || [];
    if (!chain) {
        console.log('webpack config not found');
        process.exit(1);
    }
    chain.module.rule('style').use('postcss-loader').loader('postcss-loader').options(postcssOptions);
    chain.module.rule('less').use('postcss-loader').loader('postcss-loader').options(postcssOptions);

    await next();
}