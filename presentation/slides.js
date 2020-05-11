import Intro from "./slides/intro"
import WhatIsKarnaugh from "./slides/what_is_karnaugh"
import WhatIsNarnia from "./slides/the_chronicles_of_narnia"

const slideOrder = [
    Intro,
    WhatIsKarnaugh,
    WhatIsNarnia
]
export default slideOrder.map(createWithRef)

import React, {forwardRef, useImperativeHandle, useState, createRef, useMemo} from "react";
function createWithRef({Slide, steps=0}) {
    console.log("creating slide")

    const SlideWithRef = forwardRef((props, ref) => {
        // https://stackoverflow.com/a/60739001/10854888
        let direction = props.direction ?? 1
        // direction > 0 is going right, and vice versa
        let [step, updateStep] = useState(direction > 0 ? 0 : steps)

        useImperativeHandle(ref, () => ({
            prevStep() {
                if(step === 0) {
                    return;
                }
                updateStep(prevStep => prevStep-1)
                console.log("prev step in intro")
                return true
            },
            nextStep() {
                if(step === steps) {
                    return;
                }
                updateStep(prevStep => prevStep+1)
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
        // let innerRef = createRef()

        return  <Slide step={step} {...props}/>
    })
    return <SlideWithRef/>
}
