import Head from 'next/head'
import React, {Component} from 'react'
import get_url from "../components/get_url"
import * as Sentry from "@sentry/browser"
import Error from "../components/error"


/** @author https://docs.sentry.io/platforms/javascript/react/
 * https://reactjs.org/docs/error-boundaries.html
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {eventId: null}
    }

    static getDerivedStateFromError() {
        return {hasError: true}
    }

    componentDidCatch(error, errorInfo) {
        Sentry.withScope((scope) => {
            scope.setExtras(errorInfo)
            const eventId = Sentry.captureException(error)
            this.setState({eventId})
        });
    }

    render() {
        if (this.state.hasError) {
            //render fallback UI
            return <Error eventId={this.state.eventId} />
        }

        //when there's not an error, render children untouched
        return this.props.children;
    }
}

export default function PresentationLayout(props) {
    return (
        <ErrorBoundary>
            <div className="container" style={{height: "100%"}}>
                <Head>
                    <title>Karnaugh Map to DNF</title>
                    <link rel="icon" href={get_url("/favicon.ico")}/>
                    <style>{`
                    #__next { min-height: 100% }
                `}
                    </style>
                </Head>

                {props.children}

            </div>
        </ErrorBoundary>
    )
}
