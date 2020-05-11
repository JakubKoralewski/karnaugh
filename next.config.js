const {PHASE_PRODUCTION_BUILD} = require("next/constants")

const staticFolder = '/karnaugh'

module.exports = (phase, {}) => ({
    env: {
        prod: PHASE_PRODUCTION_BUILD === phase,
        // Will be available on both server and client
        staticFolder,
    },
    devIndicators: {
        autoPrerender: false,
    },
    assetPrefix: phase === PHASE_PRODUCTION_BUILD ? `https://jcubed.me${staticFolder}/` : '',
})