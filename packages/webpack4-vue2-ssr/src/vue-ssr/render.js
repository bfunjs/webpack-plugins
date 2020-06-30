const VueServerRenderer = require('vue-server-renderer');

function createRenderer(option) {
    const bundle = (typeof option.bundle === 'string') ? JSON.parse(option.bundle) : option.bundle;
    const manifest = (typeof option.manifest === 'string') ? JSON.parse(option.manifest) : option.manifest;
    return VueServerRenderer.createBundleRenderer(bundle, {
        template: option.template,
        clientManifest: manifest,
        runInNewContext: option.runInNewContext || false,
        inject: option.inject !== false,
        shouldPreload: option.shouldPreload || function () {
            return true;
        },
        cache: option.cache || false
    });
}

export function vueSSR(option) {
    return new Promise(function (resolve, reject) {
        createRenderer(option).renderToString(option.context, function (err, html) {
            if (err) return reject(err);
            return resolve(html);
        });
    });
}
