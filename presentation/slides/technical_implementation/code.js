import React, {useRef, useEffect} from "react"
import Prism from 'prismjs'

export default function Code({children}) {
    const codeBlockRef = useRef(null)

    useEffect(() => {
        if (typeof document !== undefined && codeBlockRef.current !== null) {
            Prism.highlightAllUnder(codeBlockRef.current)
        }
    }, [])

    return (
        <>
            <div ref={codeBlockRef}>
                <pre
                    className="language-javascript"
                >
                  <code
                      className="language-javascript"
                  >
                      {children}
                  </code>
                </pre>
            </div>
        </>
    )
}
