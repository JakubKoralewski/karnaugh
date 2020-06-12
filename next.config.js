const {PHASE_PRODUCTION_BUILD} = require("next/constants")
// https://github.com/vercel/next-plugins/tree/master/packages/next-source-maps
const withSourceMaps = require('@zeit/next-source-maps')({
    devtool: "hidden-source-map"
})
// https://github.com/getsentry/sentry-webpack-plugin
const SentryWebpackPlugin = require('@sentry/webpack-plugin')

const {
    NEXT_PUBLIC_SENTRY_DSN: SENTRY_DSN,
    SENTRY_ORG,
    SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN,
    NODE_ENV,
} = process.env

const webpack = (config, options) => {
    config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack']
    })

    if (!options.isServer) {
        config.resolve.alias['@sentry/node'] = '@sentry/browser'
    }

    // https://github.com/vercel/next.js/blob/canary/examples/with-sentry/next.config.js
    // Note: This is disabled in development mode.
    if (
        SENTRY_DSN &&
        SENTRY_ORG &&
        SENTRY_PROJECT &&
        SENTRY_AUTH_TOKEN &&
        NODE_ENV === 'production'
    ) {
        config.plugins.push(
            new SentryWebpackPlugin({
                include: '.next',
                ignore: ['node_modules'],
                urlPrefix: '~/_next',
                release: `karnaugh@${process.env.npm_package_version}_${options.buildId}`,
                setCommits: {
                    repo: 'github.com/JakubKoralewski/karnaugh',
                    commit: process.env.GIT_HEAD
                }
            })
        )
    }
    return config
}

module.exports = (phase, {}) => {
    //enable both gh pages (/karnaugh) and netlify with (/)
    console.log("KARNAUGH_PATH: ", process.env.KARNAUGH_PATH)
    console.log("ASSET_PREFIX: ", process.env.ASSET_PREFIX)
    let staticFolder = process.env.KARNAUGH_PATH !== undefined ? process.env.KARNAUGH_PATH : '/karnaugh'
    console.log("STATIC_FOLDER: ", staticFolder)
    const isProductionBuild = phase === PHASE_PRODUCTION_BUILD
    let assetPrefix
    if (process.env.ASSET_PREFIX !== undefined) {
        assetPrefix = process.env.ASSET_PREFIX
    } else {
        assetPrefix = isProductionBuild ? `https://jcubed.me${staticFolder}/` : ''
    }
    console.log("isProductionBuild: ", isProductionBuild)
    console.log("ASSET_PREFIX: ", assetPrefix)
    return withSourceMaps({
        webpack,
        env: {
            prod: isProductionBuild,
            // Will be available on both server and client
            staticFolder
        },
        devIndicators: {
            autoPrerender: false,
        },
        assetPrefix
    })
}
