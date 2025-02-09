import styles from './slides.module.scss'
import React from "react"
import {BasicAnimation, ScrollIntoViewAnimation} from "../animations"


function Intro(props) {
    // https://stackoverflow.com/a/60739001/10854888

    return (
        <div className={[styles.intro].join(' ')}>
            <a href="https://git.io/karnaugh" style={{position: "fixed", top: "2rem"}}>git.io/karnaugh</a>
            {
                props.step >= 1 &&
                <BasicAnimation>
                    <h2>
                        Hello there!
                    </h2>
                </BasicAnimation>
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
                                Hasan Hür
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
