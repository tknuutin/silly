
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const paths = require('./paths');
const buildparamConf = require('./buildparams');


const cssProdFilename = 'static/css/[name].[contenthash:8].css';

function configureRuntimeGlobals() {
    return {
        BUILDPARAMS: buildparamConf.getBuildParams()
    }
}

const definePlugin = new webpack.DefinePlugin(configureRuntimeGlobals());

function getDevPlugins() {
    // Makes some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In development, this will be an empty string.
    // new InterpolateHtmlPlugin(env.raw),

    // Generates an `index.html` file with the <script> injected.
    const htmlWebPack = new HtmlWebpackPlugin({
        inject: true,
        template: paths.appHtml,
    });

    // This is necessary to emit hot updates (currently CSS only):
    const hotModuleReplace = new webpack.HotModuleReplacementPlugin();
    
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    const caseSensitivePaths = new CaseSensitivePathsPlugin();

    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186
    const watchMissingMods = new WatchMissingNodeModulesPlugin(paths.appNodeModules);
    
    return [
        htmlWebPack, hotModuleReplace, caseSensitivePaths, watchMissingMods, definePlugin
    ]
}

module.exports = {
    dev: getDevPlugins(),
    prod: [
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),

        // Minify the code.
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                // This feature has been reported as buggy a few times, such as:
                // https://github.com/mishoo/UglifyJS2/issues/1964
                // We'll wait with enabling it by default until it is more solid.
                reduce_vars: false,
            },
            output: {
                comments: false,
            },
            sourceMap: true,
        }),
        // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
        new ExtractTextPlugin({
            filename: cssProdFilename,
        }),

        definePlugin
    ]
};
