import React, {useState, useEffect, useRef, useCallback} from 'react'
import {AnimatePresence} from "framer-motion"

import Slide from './slide'
import Controls from './controls'
import styles from './presentation.module.scss'

const staticFolder = process.env.prod ? process.env.staticFolder : ''

// https://css-tricks.com/snippets/javascript/javascript-keycodes/
const LEFT_ARROW = 37
const RIGHT_ARROW = 39

export default function Presentation(props) {
    const slides = props.children
    let [currentData, setData] = useState([props.slideID ?? 0, null])
    let [currentSlideNumber, direction] = currentData
    let slideRef = useRef(null)
    // https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
    let callbackSlideRef = useCallback(
        (node) => {
            if(!node) {
                console.log("callback ref no node")
            } else {
                console.log("callback ref node step " ,node.step())
                setStepNumber(node.step())
                slideRef.current = node
            }
        },
        []
    );

    let maybeCurrent = (slide) => slide.current ? slide.current.step() : null
    let [stepNumber, setStepNumber] = useState(maybeCurrent(slideRef))

    let [errorMessage, setErrorMessage] = useState(null)

    // https://stackoverflow.com/questions/55326406/react-hooks-value-is-not-accessible-in-event-listener-function
    useEffect(() => {
        const onKeyDown = event => {
            console.log("keydown", event)
            if(event.target !== window.document.body) {
                return; //previous `composed` check did not work
            }
            if(event.keyCode === RIGHT_ARROW) {
                goForward()
            } else if (event.keyCode === LEFT_ARROW) {
                goBack()
            }
        }
        setStepNumber(slideRef.current.step())

        window.addEventListener("keydown", onKeyDown)
        const onPopState = event => {
            // https://developer.mozilla.org/en-US/docs/Web/API/History_API
            let popSlideNumber
            if(event.state.as) {
                console.log("Next event state: ", event)
                popSlideNumber = 0
            } else {
                popSlideNumber = event.state.sid
            }
            console.log("popstate new slide number: ", event)
            setData(oldData => [popSlideNumber, oldData[1]])
        }
        window.addEventListener("popstate", onPopState)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("popstate", onPopState)
        }
    }, [currentData])

    const updateRoute = (newSlideDelta) => {
        console.log("new direction: ", newSlideDelta)
        let newSlide = currentSlideNumber+newSlideDelta
        setData([newSlide, newSlideDelta])
        console.log("new slide: ", newSlide)
        let newPath = staticFolder
        if(newSlide === 0) {
            newPath += '/'
        } else {
            newPath +=`/${newSlide}`
        }
        // https://nextjs.org/docs/routing/shallow-routing
        window.history.pushState({sid: newSlide}, '', newPath)
    }

    const canGoBackASlide = () =>
        currentSlideNumber !== 0
    const canGoForwardASlide = () =>
        currentSlideNumber !== slides.length - 1

    const canGoBack =
        () => canGoBackASlide()
            || stepNumber !== 0

    const canGoForward =
        () =>
            canGoForwardASlide()
            ||
            stepNumber
                !== (slideRef.current ? slideRef.current.steps() : 0)

    const goBack = () => {
        console.log("currentSlideNumber", currentSlideNumber)
        setErrorMessage(null)
        if(slideRef.current.prevStep()) {
            console.log(
                `Slide had more prev steps, not changing slideRef (${slideRef.current.step()}/${slideRef.current.steps()})`,
            )
            setStepNumber(slideRef.current.step())
            return;
        }
        if(!canGoBackASlide()) {
            console.log("can't go back")
            return;
        }
        updateRoute(-1)
    }
    const goForward = () => {
        console.log("currentSlideNumber", currentSlideNumber)
        const next_step = slideRef.current.nextStep()
        if(typeof next_step === 'string') {
            console.log("error going next step: ", next_step)
            setErrorMessage(next_step)
            return;
        }
        setErrorMessage(null)

        if(next_step) {
            console.log(
                `Slide had more next steps, not changing slideRef (${slideRef.current.step()}/${slideRef.current.steps()})`,
            )
            setStepNumber(slideRef.current.step())
            return;
        }
        if(!canGoForwardASlide()) {
            console.log("can't go forward")
            return;
        }
        updateRoute(+1)
    }

    return (
        <div className={styles.presentation}>
            <Controls
                className={styles.controls}
                goBack={goBack}
                goForward={goForward}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                stepsInSlide={slideRef.current ? slideRef.current.steps() : 0}
                currentStep={stepNumber}
                errorMessage={errorMessage}
            />
            <AnimatePresence initial={false} exitBeforeEnter custom={direction*-1}>
                <Slide key={currentSlideNumber} direction={direction}>
                    {React.cloneElement(slides[currentSlideNumber], {ref: callbackSlideRef, direction:direction})}
                </Slide>
            </AnimatePresence>
        </div>
    )
}