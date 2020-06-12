import React from "react"

const Cite = React.forwardRef((props, ref) => {
    console.log("CIte props: ", props)
    let quote
    if (props.children.length) {
        quote = new Array(props.children).map((elem,i) => (
            <q key={i}>{elem.props ? elem.props.children : elem}</q>
        ))
    } else if (props.children.props) {
        quote = <q>{props.children.props.children}</q>
    } else {
        quote = <q>props.children</q>
    }
    return (
        <div ref={ref}>
            {quote}
            <small>
                <a href={props.link}> - {props.prettyLink ?? props.link}</a>
            </small>
        </div>
    )
})

export default Cite
