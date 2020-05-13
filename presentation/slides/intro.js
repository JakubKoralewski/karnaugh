import styles from './slides.module.scss'
import {motion} from "framer-motion"
import InputFormula from "../../components/input_formula"
import React, {useRef, useEffect} from "react"

const Animation = React.forwardRef((props, ref) => {
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

const ScrollIntoViewAnimation = React.forwardRef((props, ref) => {
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

function BasicAnimation(props) {
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


function Intro(props) {
    // https://stackoverflow.com/a/60739001/10854888
    let ref = useRef()

    return (
        <div className={[styles.intro].join(' ')}>
            <InputFormula shouldGenerateParseTree={true} shouldGenerateTruthTable={true}/>
            {
                props.step >= 1 &&
                <BasicAnimation>
                    <h2>
                        Hello there!
                    </h2>
                </BasicAnimation>
                /*
                                <motion.h2
                                initial={{y: 100, opacity: 0}}
                                animate={{y: 0, opacity: 1}}
                                ref={ref}
                                onAnimationStart={(x) => ref.current.scrollIntoView()}
                                >
                                Hello there!
                                </motion.h2>
                */
            }
            {
                props.step >= 2 &&
                <div>
                    <ScrollIntoViewAnimation>
                        <p>
                            This is a presentation by:
                        </p>
                    </ScrollIntoViewAnimation>
                    {
                        props.step >= 3 &&
                        <ScrollIntoViewAnimation>
                            <p>
                                Jakub Koralewski
                            </p>
                        </ScrollIntoViewAnimation>
                    }
                    {
                        props.step >= 4 &&
                        <ScrollIntoViewAnimation>
                            <p>
                                and
                            </p>
                        </ScrollIntoViewAnimation>
                    }
                    {
                        props.step >= 5 &&
                        <ScrollIntoViewAnimation>
                            <p>
                                Hasan Hur
                            </p>
                        </ScrollIntoViewAnimation>
                    }
                </div>
            }
        </div>
    )
}

const steps = 5

export default {
    Slide: Intro,
    steps
}
