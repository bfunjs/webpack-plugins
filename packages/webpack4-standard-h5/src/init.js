export default async function (ctx, next) {
    const { options = {} } = ctx.solution || {};

    await next();
}