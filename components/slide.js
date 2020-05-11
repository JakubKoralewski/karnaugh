import {useEffect, useImperativeHandle, forwardRef, createRef} from "react"
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
};
export default function Slide(props) {
    let direction = props.direction ?? -1
    console.log("Slide direction: ", props.direction)

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
                x: { type: "tween", ease: "easeOut", stiffness: 300, damping: 200, duration: 0.25},
            }}
        >
            {props.children}
        </motion.div>
    )
}
/*
// https://reactjs.org/docs/react-api.html#reactforwardref
export default forwardRef((props, ref) => {

    const innerRef = createRef()
    useImperativeHandle(ref, () => ({
        prevStep() {
            console.log("prev step in slide")
            innerRef.current.prevStep()
        },
        nextStep() {
            console.log("next step in slide")
            innerRef.current.nextStep()
        }
    }))

    // https://stackoverflow.com/questions/37949981/call-child-method-from-parent
    const MotionDiv = forwardRef((props, ref) => (<motion.div
        ref={ref}
        className={styles.slide}
        initial="enter"
        animate="center"
        exit="exit"
        custom={props.direction}
        variants={variants}
        transition={{
            x: { type: "tween", ease: "easeOut", stiffness: 300, damping: 200, duration: 0.25},
        }}
    >
        {props.children}
    </motion.div>))

    // https://codesandbox.io/s/framer-motion-image-gallery-pqvx3?fontsize=14&module=%2Fsrc%2FExample.tsx
    return <MotionDiv ref={innerRef} {...props}/>
})
*/
