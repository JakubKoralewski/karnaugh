import React, {useRef, useEffect} from "react"
import Prism from 'prismjs'

export default function Code({children}) {
    const codeBlockRef = useRef(null)

    useEffect(() => {
        if (typeof document !== undefined && codeBlockRef.current !== null) {
            Prism.highlightElement(codeBlockRef.current.firstChild.firstChild)
        }
    }, [])

    return (
        <>
            <div ref={codeBlockRef} style={{maxWidth: "calc(100px + 50vw)", fontSize: "1.2rem", position: "relative"}}>
                <pre
                    style={{overflow: "auto", wordWrap: "normal", whiteSpace: "pre", maxWidth: "100%"}}
                >
                  <code
                      className="language-javascript"
                      dangerouslySetInnerHTML={{__html: children}}
                  >
                  </code>
                </pre>
            </div>
        </>
    )
}
