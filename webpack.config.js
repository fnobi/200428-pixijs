'use strict'

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const routeDataMapper = require('webpack-route-data-mapper')
const readConfig = require('read-config')
const path = require('path')

// base config
const SRC = './src'
const DEST = './dist'
const PUBLIC = './public'
const ASSETS_DIR = '_assets'
const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || 3000

module.exports = (env, argv) => {
    const constants = {
        ...readConfig(`${SRC}/constants.yml`),
        ...process.env
    };
    const { BASE_DIR, ASSET_REMOTE } = constants
    const isProduction = argv.mode == 'production';
    const assetOrigin = isProduction && ASSET_REMOTE ? ASSET_REMOTE : BASE_DIR;

    // page/**/*.pug -> dist/**/*.html
    const htmlTemplates = routeDataMapper({
        baseDir: `${SRC}/pug/page`,
        src: '**/[!_]*.pug',
        locals: {
            ...constants,
            meta: readConfig(`${SRC}/pug/meta.yml`),
            helper: {
                shareHelper: require(`${SRC}/pug/helper/shareHelper`)
            }
        }
    });

    return {
        // エントリーファイル
        entry: {
            'main': `${SRC}/js/script.ts`
        },
        // 出力するディレクトリ・ファイル名などの設定
        output: {
            path: path.resolve(__dirname, DEST + BASE_DIR),
            filename: `${ASSETS_DIR}/[name]-[contentHash].js`,
            publicPath: assetOrigin
        },
        module: {
            // 各ファイル形式ごとのビルド設定
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    exclude: /(node_modules)/
                },
                {
                    test: /\.(js|ts)$/,
                    loader: "eslint-loader",
                    enforce: "pre",
                    options: {
                      fix: true
                    }
                },
                {
                    test: /\.pug$/,
                    use: [
                        {
                            loader: 'pug-loader',
                            options: {
                                root: path.resolve(`${SRC}/pug/`),
                                pretty: !isProduction,
                            }
                        }
                    ],
                },
                {
                    test: /\.(jpe?g|png|gif|svg|ico|mp4|glb)$/,
                    loader: 'file-loader',
                    options: {
                        publicPath: `${assetOrigin}${ASSETS_DIR}/images`,
                        outputPath: `${ASSETS_DIR}/images`
                    }
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 2,
                            }
                        },
                        'postcss-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                includePaths: [ `${SRC}/scss` ],
                            },
                        }
                    ]
                },
                {
                    test: /.ya?ml$/,
                    loader: 'js-yaml-loader',
                }
            ]
        },
        // webpack-dev-serverの設定
        devServer: {
            host: HOST,
            port: PORT,
            contentBase: DEST,
            openPage: path.relative('/', BASE_DIR),
        },
        // キャシュ有効化
        cache: true,
        // 拡張子省略時のpath解決
        resolve: {
            extensions: ['.ts', '.js', '.json', '*'],
            alias: {
                '~': path.join(__dirname, SRC),
                '@': path.join(__dirname, SRC, 'js')
            }
        },
        plugins: [
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin([{ from: PUBLIC }]),
            new MiniCssExtractPlugin({
                filename: `${ASSETS_DIR}/[name]-[contentHash].css`
            }),
            ...htmlTemplates
        ],
    };
};