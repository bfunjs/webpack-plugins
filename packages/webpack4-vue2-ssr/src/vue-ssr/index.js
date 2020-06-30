import { parseWebpackConfig } from '../common';
import { vueSSR } from './render';

const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const koaWebpack = require('koa-webpack');
const webpack = require('webpack');
const MemoryFS = require('memory-fs');

const memFs = new MemoryFS();
const CHARSET = 'utf-8';

async function setupSSRServer({ host, port, webpackConfig }) {
    webpackConfig.forEach(config => {
        Object.keys(config.entry).forEach(name => {
            config.entry[name] = [].concat(config.entry[name]);
        });
    });

    const clientConfig = webpackConfig[0];
    const serverConfig = webpackConfig[1];
    const baseDir = clientConfig.output.path;
    const ssrData = {
        template: '',
        bundle: '',
        manifest: '',
        context: {},
        runInNewContext: 'once'
    };

    const clientCompiler = webpack(clientConfig);
    clientCompiler.outputFileSystem = memFs;
    const serverCompiler = webpack(serverConfig);
    serverCompiler.outputFileSystem = memFs;

    serverCompiler.watch({
        aggregateTimeout: 300,
        poll: undefined
    }, (err, stats) => {
        if (err) throw err;
        stats = stats.toJson();
        if (stats.errors.length) return;

        const serverFile = path.join(serverConfig.output.path, 'ssr-server.json');
        ssrData.bundle = memFs.readFileSync(serverFile).toString(CHARSET);
    });

    const app = new Koa();
    const route = new Router();
    const clientMiddleware = await koaWebpack({
        compiler: clientCompiler,
        devMiddleware: {
            serverSideRender: true
        }
    });

    route.get('*', async (ctx, next) => {
        const { req } = ctx;
        let filepath = ctx.path || '';

        ssrData.context.url = req.url;
        try {
            if (filepath.length < 1) {
                filepath = '/';
            }
            if (filepath.lastIndexOf('.') < 0) {
                filepath = `${filepath}${filepath[filepath.length - 1] === '/' ? '' : '/'}index.template.html`;
            }
            if (filepath.lastIndexOf('.html') > 0) {
                ctx.response.type = 'html';
                filepath = path.join(baseDir, filepath);

                const clientFile = path.join(baseDir, 'ssr-client.json');
                ssrData.manifest = clientMiddleware.devMiddleware.fileSystem.readFileSync(clientFile).toString(CHARSET);
                ssrData.template = clientMiddleware.devMiddleware.fileSystem.readFileSync(filepath).toString(CHARSET);

                ctx.body = await vueSSR(ssrData);
                console.log('get', ctx.path, '->', filepath);
            } else {
                await next();
            }
        } catch (e) {
            if (filepath.lastIndexOf('.html') > 0) {
                filepath = path.join(baseDir, 'index.template.html');
                console.log('redirect', ctx.path, '->', filepath);
                ssrData.template = clientMiddleware.devMiddleware.fileSystem.readFileSync(filepath).toString();
                ctx.body = await vueSSR(ssrData);
            } else {
                ctx.status = 404;
                console.error(e);
            }
        }
    });

    app.use(route.routes());
    app.use(route.allowedMethods());
    app.use(clientMiddleware);

    app.listen(port);
    console.log('Server is listen ', `http://${host}:${port}/`,);
}

export default async function (ctx) {
    const { host, port, bConfig } = ctx;
    const { webpack = [] } = bConfig;

    const webpackConfig = await parseWebpackConfig(webpack);
    await setupSSRServer({ host, port, webpackConfig });
}
