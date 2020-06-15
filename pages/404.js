import React from "react"
import NextErrorComponent from 'next/error'
import * as Sentry from '@sentry/node'
import Error from "../components/error"

const MyError = ({ statusCode, err }) => {
    const eventId = Sentry.captureException({err, location: process.browser ? window.location : null, statusCode})

    return <Error eventId={eventId} />
}

export default MyError
