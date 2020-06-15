import React, {useRef, useEffect} from "react"
import {motion} from "framer-motion"

/**
 * This is an *abstract* element that makes it easy to build upon,
 * since it will become any element you pass in as the child.
 */
export const Animation = React.forwardRef((props, ref) => {
    let child = props.children
    let type = child.type
    let toRender
    let SomeTag
    if (typeof type === "string") {
        SomeTag = motion[type]
        toRender = child.props.children
    } else {
        SomeTag = motion.div
        toRender = child
    }

    // https://stackoverflow.com/questions/35152522/react-transferring-props-except-one
    const {onMount, ...otherProps} = props
    if (onMount) {
        useEffect(onMount, [])
    }
    return (
        <SomeTag
            {...otherProps}
            ref={ref}
        >
            {toRender}
        </SomeTag>
    )
})

export const ScrollIntoViewAnimation = React.forwardRef((props, ref) => {
    let scrollObj
    /** @param {HTMLElement} elem*/
    const scrollIntoView = (elem, backwards = false) => {
        console.log("scrollintoview: ", elem)
        if (backwards) {
            const margin = 50
            window.document.body.scrollTo(0, Math.max(0, elem.offsetTop - margin))
        } else {
            window.document.body.scrollTo(0, Math.max(0, elem.offsetTop - elem.offsetHeight / 2))
        }
    }
    scrollObj = {
        onAnimationStart: () => {
            console.log("ref on animation start", ref)
            scrollIntoView(ref.current)
        },
        onMount: () => {
            if(ref) {
                return () => {
                    scrollIntoView(ref.current, true)
                }
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

/**
 * Simple opacity animation that also scrolls the animation into view.
 */
export function SimpleOpacityAnimation(props) {
    let ref = useRef()
    return (
        <ScrollIntoViewAnimation
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: props.duration ?? 1, delay: props.delay ?? 0}}
            ref={ref}
            {...props}
        >
            {props.children}
        </ScrollIntoViewAnimation>
    )
}

/** Both opacity and small `y` direction animation. */
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
