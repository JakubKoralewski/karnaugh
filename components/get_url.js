const staticFolder = process.env.prod ? process.env.staticFolder : ''
const get_url = (url) => {
    return `${staticFolder}${url}`
}
export default get_url
