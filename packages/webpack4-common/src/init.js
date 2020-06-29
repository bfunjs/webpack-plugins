import { WebpackConfiguration } from '@bfun/webpack-configuration';

import assets from './rules/assets';
import babel from './rules/babel';
import fonts from './rules/fonts';
import style from './rules/style';
import less from './rules/less';
import template from './rules/template';

export default async function (ctx, next) {
    const { options = {} } = ctx.solution || {};
    const webpack = new WebpackConfiguration();
    await babel(webpack, options);
    await assets(webpack, options);
    await style(webpack, options);
    await fonts(webpack, options);
    await less(webpack, options);
    await template(webpack, options);

    await next();
}