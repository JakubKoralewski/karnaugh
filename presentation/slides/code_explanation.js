import styles from './slides.module.scss'
import React from "react"
import {BasicAnimation, ScrollIntoViewAnimation, SimpleOpacityAnimation} from "../animations"
import technicalStyles from "./technical_implementation/styles.module.scss"
import {AnimatePresence, motion} from "framer-motion";
import Code from "./technical_implementation/code"

const steps = 2

function CodeExplanation(props) {
    return (
        <div className={[styles.titular, technicalStyles.slide, styles.otherMethods].join(' ')}>
            <h2>How It Works?</h2>
            <SimpleOpacityAnimation>
                <main>
                    <section>
                        <h3>Rules of Simplification</h3>
                        <p>Rectangles may not include any cell containing a zero.</p>
                        <p>Rectangles may be horizontal or vertical, but not diagonal.</p>
                        <p>Rectangles must contain 1, 2, 4, 8, or in general 2^n cells.</p>
                        <p>Each rectangle should be as large as possible.</p>
                        <p>Each cell containing a one must be in at least one rectangle.</p>
                        <p>Rectangles may overlap.</p>
                        <p>Rectangles may wrap around the table.</p>
                        <p>There should be as few rectangles as possible, as long as this does not contradict any of the
                            previous rules.</p>
                    </section>

                    {
                        props.step >= 1 &&
                        <section>
                            <h3>Step by step</h3>

                            <motion.p animate={{opacity: 1}} initial={{opacity: 0}} transition={{duration: 2}}>
                                <p>
                                    The program starts with checking cells containing ones then checks the adjacent
                                    cells to make
                                    the rectangle larger.
                                    If it doesn't run into a zero while forming a new rectangle whose both edge lengths
                                    are 2<sup>n</sup> it adds
                                    all the cells that are checked.
                                    It repeats the same process until running into a zero or adding all the cells of the
                                    Karnaugh map to
                                    the rectangle.
                                    It repeats this whole process for every single cell in the Karnaugh map.
                                    Therefore, the program is a while loop that checks whether it is possible
                                    to form a
                                    rectangle containing one particular cell each time it is run and stops when each
                                    cell in
                                    the Karnaugh map is checked.
                                </p>

                                <p>
                                    After generating all the rectangles the program checks row and column headers for
                                    each rectangle to see which variables are consistently true or false in all the
                                    cells of the rectangle, then generates the Disjunctive Normal Form of the statement
                                    based on them.
                                </p>
                            </motion.p>
                        </section>
                    }{
                    props.step >= 2 &&
                    <section>
                        <h3>
                            Disjunctive Normal Form
                        </h3>

                        <p>
                            In boolean logic, a propositional formula is in disjunctive normal
                            form if it consists of a number of disjuncts (at least 1) that consist of conjunction of
                            atomic formulas. It can also be described as a sum of products or OR of ANDs.
                        </p>
                    </section>
                }
                </main>
            </SimpleOpacityAnimation>
        </div>
    )
}


export default {
    Slide: CodeExplanation,
    steps
}
