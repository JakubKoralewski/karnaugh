const {PHASE_PRODUCTION_BUILD} = require("next/constants")

module.exports = (phase, {}) => {
    //enable both gh pages (/karnaugh) and netlify with (/)
    console.log("KARNAUGH_PATH: ", process.env.KARNAUGH_PATH)
    console.log("ASSET_PREFIX: ", process.env.ASSET_PREFIX)
    let staticFolder = process.env.KARNAUGH_PATH !== undefined ? process.env.KARNAUGH_PATH : '/karnaugh'
    console.log("STATIC_FOLDER: ", staticFolder)
    let assetPrefix
    if(process.env.ASSET_PREFIX !== undefined) {
        assetPrefix = process.env.ASSET_PREFIX
    } else {
        assetPrefix = phase === PHASE_PRODUCTION_BUILD ? `https://jcubed.me${staticFolder}/` : ''
    }
    console.log("ASSET_PREFIX: ", assetPrefix)
    return {
    env: {
        prod: PHASE_PRODUCTION_BUILD === phase,
        // Will be available on both server and client
        staticFolder
    },
    devIndicators: {
        autoPrerender: false,
    },
    assetPrefix
}}