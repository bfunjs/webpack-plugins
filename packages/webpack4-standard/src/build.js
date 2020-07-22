const webpackBuilder = require('webpack');

const { cleanDir, logger } = global.common;

function buildCallback(err, stats) {
    if (err) {
        logger.error(`\n${err.message}`.red);
        process.exit(1);
    }

    stats.stats.forEach(stat => {
        stat.compilation.children = stat.compilation.children.filter(child => !child.name);
    });

    logger.log(stats.toString({
        colors: true,
        hash: false,
        modules: false,
        timings: false,
    }));
}

export async function build(ctx, next) {
    const { webpack, bConfig = {} } = ctx.solution || {};
    const { clean } = bConfig;

    if (clean && typeof clean === 'string') {
        await cleanDir(clean);
    }
    const compiler = webpackBuilder(webpack);
    await new Promise((resolve) => {
        compiler.run(async (err, stats) => {
            buildCallback(err, stats);
            if (stats.hasErrors()) process.exit(1);
            resolve();
        });
    });
}