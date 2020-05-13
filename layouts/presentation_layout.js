import Head from 'next/head'

export default function PresentationLayout(props) {
    return (
        <div className="container" style={{height: "100%"}}>
            <Head>
                <title>Karnaugh Map to DNF</title>
                <link rel="icon" href="/favicon.ico" />
                <style>{`
                    #__next { min-height: 100% }
                `}
                </style>
            </Head>

            {props.children}

        </div>
    )
}
