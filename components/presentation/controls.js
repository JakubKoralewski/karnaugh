import React, {useEffect} from "react"
import styles from './controls.module.scss'
import {AnimatePresence, motion} from "framer-motion"


// https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle/24569190#24569190
function describeArc(x, y, radius, startAngle, endAngle) {
    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", start.x, start.y,
        "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
    ].join(" ");
}

let lastStepsAmt = 0

const arcVariants = {
    hidden: {
        pathOffset: 1,
        pathLength: 0,
    }
    ,
    visible: ({isFull, lastChanged}) => {
        let anim = {
            // opacity: 1,
            // pathSpacing: 1,
            pathLength: 1,
            pathOffset: 0,
            transition: {duration: lastChanged ? 0.5 : isFull ? 1 : 1}
            // fill: "rgba(255, 255, 255, 1)"
        }
        // console.log("visible variant args: isFull",isFull, "lastChanged: ", lastChanged, "anim: ", anim)
        return anim
    }
};

function AvailableSteps(props) {
    // https://stackoverflow.com/questions/29864022/drawing-parts-of-circles-circumference-in-svg
    // https://codesandbox.io/s/rutrh?module=%2Fsrc%2FExample.tsx
    console.log(`AvailableSteps ${props.back ? 'back' : 'forward'} drawing ${props.active} of ${props.steps}. `)
    let paths = []
    const fullArc = (i, steps = props.steps) => {
        return describeArc(
            20,
            20,
            15,
            360 * i / steps,
            360 * (i + 1) / steps - 0.00001
        )
    }
    const normalArc = (i, steps = props.steps) => {
        return describeArc(
            20,
            20,
            15,
            360 * i / steps,
            360 * (i + 1) / steps - 20
        )
    }
    const createPath = (d, classes, i = 0) => (
        <motion.path
            fill="none"
            strokeWidth="2"
            initial="hidden"
            animate="visible"
            variants={arcVariants}
            custom={{isFull: props.active === props.steps, lastChanged: props.steps !== lastStepsAmt}}
            className={classes}
            key={`${i}${props.active === props.steps}${props.steps}`}
            d={d}
        />
    )
    if (props.steps === 0) {
        paths.push(createPath(fullArc(0, 1), [styles.stepActive, styles.stepArc].join(' ')))
    } else {
        for (let i = 0; i < props.steps; i++) {
            let arc
            if (props.active === props.steps) {
                arc = fullArc(i)
            } else {
                arc = normalArc(i)
            }
            let condition
            if (props.back) {
                condition = i >= props.active || props.active === props.steps
            } else {
                condition = i < props.active
            }
            let classes = [condition ? styles.stepActive : "", styles.stepArc].join(' ')
            paths.push(
                createPath(arc, classes, i)
            )
        }
    }
    return (
        <motion.svg className={styles.availableSteps} width="40" height="40">
            {paths}
        </motion.svg>
    )
}

export default function Controls(props) {
    // https://remixicon.com/
    useEffect(() => {
        return () => lastStepsAmt = props.stepsInSlide()
    })
    return (
        <div className={`${props.className} ${styles.controls}`}>
            <AnimatePresence>
                {
                    props.errorMessage !== null &&
                    <motion.div
                        initial={{y: "100%", opacity: 0}}
                        animate={{y: 0, opacity: 1}}
                        exit={{y: "100%", opacity: 0}}
                        transition={{ease: "easeOut", duration: 3}}
                        className={styles.errorAlert}
                    >
                        <span>
                            {
                                props.errorMessage
                            }
                        </span>
                        <motion.svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" d="M0 0h24v24H0z"/>
                            <path
                                d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9.414l2.828-2.829 1.415 1.415L13.414 12l2.829 2.828-1.415 1.415L12 13.414l-2.828 2.829-1.415-1.415L10.586 12 7.757 9.172l1.415-1.415L12 10.586z"
                            />
                        </motion.svg>
                    </motion.div>
                }
            </AnimatePresence>
            <div
                className={[styles.controlButton, props.canGoBack() ? styles.active : ''].join(' ')}
                onClick={props.goBack}
            >
                <AvailableSteps
                    steps={props.stepsInSlide()}
                    back={true}
                    active={props.stepsInSlide() - props.currentStep}
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M12 13v7l-8-8 8-8v7h8v2z"/>
                </svg>
            </div>
            <div
                className={[styles.controlButton, props.canGoForward() ? styles.active : ''].join(' ')}
                onClick={props.goForward}
            >

                <AvailableSteps
                    steps={props.stepsInSlide()}
                    back={false}
                    active={props.currentStep}
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M12 13H4v-2h8V4l8 8-8 8z"/>
                </svg>
            </div>
        </div>
    )
}
