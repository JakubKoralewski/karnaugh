import React, {useEffect, useState} from "react"
import {motion} from "framer-motion"
import styles from './slide.module.scss'

const variants = {
    enter: (direction) => {
        console.log("Entering direction: ", direction)
        return {
            x: direction > 0 ? "100%" : "-100%",
        };
    },
    center: {
        x: 0,
    },
    exit: (direction) => {
        console.log("Exiting direction: ", direction)
        return {
            x: direction < 0 ? "-100%" : "100%",
        };
    }
}
let ticking = false

export default function Slide(props) {
    // console.log("Slide props: ", props)
    const localStorageKey = `${process.env.staticFolder}-slide-scroll-pos-${props.children.key}`
    let scroll, setScroll
    if (process.browser) {
        [scroll, setScroll] =
            useState(
                window.localStorage.getItem(localStorageKey) || null
            )
    }
    let direction = props.direction ?? -1
    useEffect(() => {
        console.log("scroll is", scroll)
        if (scroll) {
            window.document.body.scrollTo(0, scroll)
        }

        const scrollReactor = (e) => {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    const value = window.document.body.scrollTop
                    // console.log("setting scroll pos", value)
                    window.localStorage.setItem(localStorageKey, value);
                    ticking = false;
                });

                ticking = true;
            }
        }
        window.document.body.addEventListener("scroll", scrollReactor)
        return () => window.document.body.removeEventListener("scroll", scrollReactor)
    }, [])

    // https://codesandbox.io/s/framer-motion-image-gallery-pqvx3?fontsize=14&module=%2Fsrc%2FExample.tsx
    return (
        <motion.div
            className={styles.slide}
            initial="enter"
            animate="center"
            exit="exit"
            custom={direction}
            variants={variants}
            transition={{
                x: {type: "tween", ease: "easeOut", stiffness: 300, damping: 200, duration: 0.25},
            }}
        >
            {props.children}
        </motion.div>
    )
}
