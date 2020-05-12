import styles from './slides.module.scss'
import {motion} from "framer-motion"
import InputFormula from "../../components/input_formula"
import React from "react"

function Intro(props) {
    // https://stackoverflow.com/a/60739001/10854888

    return (
        <div className={[styles.intro].join(' ')}>
            <InputFormula />
            {
                props.step >= 1 &&
                <motion.h2
                    initial={{y: 100, opacity: 0}}
                    animate={{y:0, opacity: 1}}
                >
                    Hello there!
                </motion.h2>
            }
            {
                props.step >= 2 &&
                    <div>
                    <motion.p>
                        This is a presentation by:
                    </motion.p>
                        {
                            props.step >= 3 &&
                            <motion.p>
                                Jakub Koralewski
                            </motion.p>
                        }
                        {
                            props.step >= 4 &&
                            <motion.p>
                                and
                            </motion.p>
                        }
                        {
                            props.step >= 5 &&
                            <motion.p>
                                Hasan Hur
                            </motion.p>
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
