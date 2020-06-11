const {PHASE_PRODUCTION_BUILD} = require("next/constants")
const webpack = (config) => {
    config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack']
    })
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
    return {
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
    }
}
