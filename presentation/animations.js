import React, {useRef, useEffect} from "react"
import {motion} from "framer-motion"

export const Animation = React.forwardRef((props, ref) => {
    let child = props.children
    let type = child.type
    let SomeTag = motion[type]

    // https://stackoverflow.com/questions/35152522/react-transferring-props-except-one
    const {onMount, onUnMount, ...otherProps} = props
    if(onMount) {
        useEffect(onMount, [])
    }
    return (
        <SomeTag
            {...otherProps}
            ref={ref}
        >
            {child.props.children}
        </SomeTag>
    )
})

export const ScrollIntoViewAnimation = React.forwardRef((props, ref) => {
    console.log("scroll into view animation props refs: ", props, ref)
    let scrollObj
    if (!ref) {
        ref = useRef()
        scrollObj = {
            onMount: () => {
                ref.current.scrollIntoView()
                return () => ref.current.scrollIntoView()
            },
        }
    } else {
        scrollObj = {
            onAnimationStart: () => {
                console.log("ref on animation start", ref)
                ref.current.scrollIntoView()
            }
        }
    }
    return (
        <Animation
            ref={ref}
            {...scrollObj}
            {...props}
        >
            {props.children}
        </Animation>
    )
})

export function BasicAnimation(props) {
    let ref = useRef()
    return (
        <ScrollIntoViewAnimation
            initial={{y: 100, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            ref={ref}
        >
            {props.children}
        </ScrollIntoViewAnimation>
    )
}
