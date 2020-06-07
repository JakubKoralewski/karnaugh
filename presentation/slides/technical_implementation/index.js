import React, {useEffect, usex, useState, createRef} from "react"
import slideStyles from "../slides.module.scss"
import moduleStyles from "./styles.module.scss"
import {Animation, BasicAnimation, SimpleOpacityAnimation} from "../../animations"
import {motion} from "framer-motion";
import ReactLogo from "./react.svg"
import NextLogo from "./next.svg"

const steps = 4

function TechnicalImplementation(props) {
    const backgroundLightBlue = `linear-gradient(45deg, lightblue, coral)`
    const styles = {
        background: `linear-gradient(45deg,coral,coral)`,
        backgroundSize: "400% 400%"
    }
    useEffect(() => {
        let prevBG = document.body.style.background
        document.body.style.background = backgroundLightBlue
        return () => document.body.style.background = prevBG
    }, [])

    return (
        <motion.div
            className={[slideStyles.titular, moduleStyles.slide].join(' ')}
            initial={{
                background: styles.background,
            }}
            animate={{
                background: backgroundLightBlue,
            }}
        >
            <BasicAnimation>
                <header>
                    <h2>Technical implementation</h2>
                    <span
                        style={{opacity: props.step >= 1 ? 1 : 0}}
                    >
                        This is a webpage!
                    </span>
                </header>
            </BasicAnimation>

            <motion.main>
                {

                    props.step >= 1 &&
                    <SimpleOpacityAnimation>

                        <section>
                            <h3>Slides</h3>
                            <div>
                                <motion.span>
                                    <p>
                                        This presentation is a
                                        <a
                                            target="_blank"
                                            href="https://reactjs.org/"
                                        > React
                                        </a> app
                                        using the
                                        <a
                                            target="_blank"
                                            href="https://nextjs.org/"
                                        > Next.js
                                        </a> framework.
                                    </p>

                                    <p>
                                        Each slide is each own statically pre-generated HTML file
                                        that is hydrated and loaded with React code to accomplish dynamic
                                        behavior.
                                    </p>

                                    <p>
                                        Changing slides was implemented using the
                                        <a
                                            target="_blank"
                                            href="https://developer.mozilla.org/en-US/docs/Web/API/History_API"
                                        > History API
                                        </a>, so you can change slides both with the custom controls,
                                        left and right arrow keypresses as well as using the back and forward
                                        browser buttons.
                                    </p>
                                </motion.span>
                                <motion.div
                                    style={{width: "50%"}}
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    transition={{delay: 0.2}}
                                >
                                    <NextLogo width="100%"/>
                                </motion.div>
                            </div>
                        </section>
                    </SimpleOpacityAnimation>
                }
                {
                    props.step >= 2 &&
                    <SimpleOpacityAnimation>
                        <section>
                            <h3>Parsing formulas</h3>
                            <div>
                                <motion.span>
                                    Formula parsing, truth table and parse tree generation
                                    was accomplished thanks to the
                                    <a target="_blank" href="https://github.com/jdkato/Tombstone.js"> tombstone.js </a>
                                    library by
                                    <a target="_blank" href="https://github.com/jdkato"> Joseph Kato</a>
                                </motion.span>
                            </div>
                        </section>
                    </SimpleOpacityAnimation>
                }
                {
                    props.step >= 3 &&
                    <SimpleOpacityAnimation>
                        <section>
                            <h3>Parse Tree</h3>
                            <div>
                                <motion.span>
                                    The parse tree generation was possible because of the
                                    <a
                                        target="_blank"
                                        href="https://d3js.org/"
                                    > D3.js framework,
                                    </a> which given the tree generated by tombstone.js
                                    provided us with the necessary
                                    x, y coordinates of a nicely visualized parse tree.
                                </motion.span>
                            </div>
                        </section>
                    </SimpleOpacityAnimation>
                }
                {
                    props.step >= 4 &&
                    <SimpleOpacityAnimation>
                        <section>
                            <h3>Animations</h3>
                            <div>
                                <motion.span>
                                    The truth table to Karnaugh map animation was done by hand,
                                    but for almost everything else, including
                                    the route transitions,

                                    <a
                                        target="_blank"
                                        href="https://www.framer.com/motion/"
                                    > framer-motion
                                    </a> was used.
                                </motion.span>
                            </div>
                        </section>
                    </SimpleOpacityAnimation>
                }
                <motion.div
                    class={moduleStyles.svgBGContainer}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.1}}
                >
                    <ReactLogo
                        width="100%"
                        style={{
                            opacity: 0.2,
                            mixBlendMode: `color-burn`,
                        }}
                    />
                </motion.div>
            </motion.main>
        </motion.div>
    );
}

export default {
    Slide: TechnicalImplementation,
    steps
}
