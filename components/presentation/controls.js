import React from "react"
import styles from './controls.module.scss'
import {motion} from "framer-motion"


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

const arcVariants = {
    hidden: {
        // opacity: 0,
        pathOffset: 1,
        // pathSpacing: 0,
        pathLength: 0,
        // fill: "rgba(255, 255, 255, 0)"
    },
    visible: {
        // opacity: 1,
        // pathSpacing: 1,
        pathLength: 1,
        pathOffset: 0
        // fill: "rgba(255, 255, 255, 1)"
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
    const createPath = (d, classes, i=0) => (
        <motion.path
            fill="none"
            strokeWidth="2"
            initial="hidden"
            animate="visible"
            variants={arcVariants}
            transition={{default: {duration: 2}}}
            className={classes}
            key={i}
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
                condition = i >= props.active
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

const Controls = function Controls(props) {
    // https://remixicon.com/
    return (
        <div className={`${props.className} ${styles.controls}`}>
            <div className={[styles.controlButton, props.canGoBack() ? styles.active : ''].join(' ')}
                 onClick={props.goBack}>
                <AvailableSteps steps={props.stepsInSlide} back={true} active={props.stepsInSlide - props.currentStep}/>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M12 13v7l-8-8 8-8v7h8v2z"/>
                </svg>
            </div>
            <div className={[styles.controlButton, props.canGoForward() ? styles.active : ''].join(' ')}
                 onClick={props.goForward}>
                <AvailableSteps steps={props.stepsInSlide} back={false} active={props.currentStep}/>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M12 13H4v-2h8V4l8 8-8 8z"/>
                </svg>
            </div>
        </div>
    )
}

export default Controls
