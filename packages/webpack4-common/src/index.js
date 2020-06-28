import assets from './assets';
import babel from './babel';
import fonts from './fonts';
import style from './style';
import less from './less';
import template from './template';

async function apply(webpack, options, wConfig) {
    await babel(webpack, options);
    await assets(webpack, options);
    await style(webpack, options);
    await fonts(webpack, options);
    await less(webpack, options);
    await template(webpack, options);
}

export {
    apply,
};