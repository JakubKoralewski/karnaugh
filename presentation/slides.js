import Intro from "./slides/intro"
import WhatIsKarnaugh from "./slides/what_is_karnaugh"
import HowToGenerateKarnaugh from "./slides/how_to_generate_karnaugh"
import DNF from "./slides/dnf"
import OtherMethods from "./slides/other_methods"
import TechnicalImplementation from "./slides/technical_implementation"

const slideOrder = [
    Intro,
    WhatIsKarnaugh,
    HowToGenerateKarnaugh,
    DNF,
    OtherMethods,
    TechnicalImplementation
]
export default slideOrder.map(createWithRef)

import React, {forwardRef, useImperativeHandle, useState, createRef, useMemo} from "react";

function createWithRef({Slide, steps = 0}) {

    const SlideWithRef = forwardRef((props, ref) => {
        // https://stackoverflow.com/a/60739001/10854888
        let direction = props.direction ?? 1
        // direction > 0 is going right, and vice versa
        let [step, updateStep] = useState(direction > 0 ? 0 : steps)
        let [slideAllowsMeToGoForward, setSlideAllowsMeToGoForward] = useState(true)

        const canGoForward = (x) => {
            setSlideAllowsMeToGoForward(x)
        }

        useImperativeHandle(ref, () => ({
            /** Return true if does not allow to go to next slide. */
            prevStep() {
                if (step === 0) {
                    return;
                }
                updateStep(prevStep => prevStep - 1)
                console.log("prev step in intro")
                return true
            },
            /** Return true if does not allow to go to next slide.
             *  `slideAllowsMeToGoForward` allows the slide itself to decide whether all
             */
            nextStep() {
                if (slideAllowsMeToGoForward !== true) {
                    return slideAllowsMeToGoForward;
                }
                if (step === steps) {
                    return;
                }
                updateStep(prevStep => prevStep + 1)
                console.log("next step in intro")
                return true
            },
            steps() {
                return steps
            },
            step() {
                return step
            }
        }))

        return <Slide
            step={step}
            canGoForward={canGoForward}
            {...props}
        />
    })
    return <SlideWithRef/>
}
