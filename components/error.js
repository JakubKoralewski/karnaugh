import * as Sentry from "@sentry/browser"
import React from "react"

export default function Error({eventId}) {
    return (
        <div>
            Oh no! You broke our app, please behave and input only what we tell you.
            <button onClick={() => Sentry.showReportDialog({eventId})}>
                Report feedback
            </button>
        </div>
    );
}
