import React from 'react'
import App from 'next/app'
import PresentationLayout from "../layouts/presentation_layout"
import '../global.scss'
import '../node_modules/prismjs/themes/prism.css'

export default class PresentationApp extends App {
    render() {
        const { Component, pageProps, router } = this.props

        return (
            <PresentationLayout>
                  <Component {...pageProps}  />
            </PresentationLayout>
        )
    }
}
