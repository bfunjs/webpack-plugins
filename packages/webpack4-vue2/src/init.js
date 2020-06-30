export default async function (ctx, next) {
    const { webpack } = ctx.solution || {};
    webpack.resolve.extensions.push('.vue');

    await next();
}
