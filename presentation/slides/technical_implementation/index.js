import React, {useEffect, usex, useState, createRef, useRef} from "react"
import slideStyles from "../slides.module.scss"
import moduleStyles from "./styles.module.scss"
import {Animation, BasicAnimation, SimpleOpacityAnimation} from "../../animations"
import {motion} from "framer-motion";
import ReactLogo from "./react.svg"
import NextLogo from "./next.svg"

import TestingCodeBlocks from "./code_blocks/testing"
import Code from "./code"

const steps = 6

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
                                <motion.div
                                    style={{width: "50%"}}
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    transition={{delay: 0.2}}
                                >
                                    <NextLogo width="100%"/>
                                </motion.div>

                                <p>
                                    Each slide is each own statically generated HTML file<br/>
                                    that is
                                    <a
                                        href="https://nextjs.org/docs/advanced-features/automatic-static-optimization"
                                        target="_blank"
                                    > hydrated and loaded with React code
                                    </a> to accomplish both dynamic behavior and fast load times.
                                </p>

                                <p>
                                    Changing slides was implemented using the
                                    <a
                                        target="_blank"
                                        href="https://developer.mozilla.org/en-US/docs/Web/API/History_API"
                                    > History API
                                    </a>,
                                </p>
                                <Code>
                                    {
'window.history.pushState(<span data-info="The new state.">{sid: newSlide}</span>' +
', <span data-info="The title (currently ignored by most browsers)">\'\'</span>' +
', <span data-info="The new URL">newPath</span>)'
                                    }
                                </Code>
                                <p>
                                    so you can change slides both with the custom controls, <br/>
                                    left and right arrow keypresses as well as using the back and forward
                                    browser buttons.
                                </p>
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
                                <p>
                                    Formula parsing, truth table and parse tree generation <br/>
                                    was accomplished thanks to the
                                    <a
                                        target="_blank"
                                        href="https://github.com/jdkato/Tombstone.js"
                                    > tombstone.js
                                    </a> library by
                                    <a
                                        target="_blank"
                                        href="https://github.com/jdkato"
                                    > Joseph Kato
                                    </a>.
                                </p>
                                <p>
                                    <code>user input</code> -> <code>tombstone.js</code> -> <code>UI update</code>
                                </p>
                                <Code>
                                    {
                                        `
    let isValid = true
    let statement
    try {
        statement = new Statement(text.trim());
        // if no error we update the UI
    } catch (error) {
        // throws error if formula invalid
        isValid = false
    }
`
                                    }
                                </Code>
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
                                <p>
                                    The parse tree generation was possible thanks to the
                                    <a
                                        target="_blank"
                                        href="https://d3js.org/"
                                    > D3.js framework
                                    </a>, <br/> which given the tree generated by tombstone.js
                                    provided us with the necessary <br/>
                                    x, y coordinates of a nicely visualized tree.
                                </p>
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
                                <p>
                                    The transition from the truth table to the Karnaugh map
                                    was done using vanilla JavaScript, but for almost everything else, <br/>
                                    including the slide (route) transitions

                                    <a
                                        target="_blank"
                                        href="https://www.framer.com/motion/"
                                    > framer-motion
                                    </a> was used.
                                </p>
                            </div>
                        </section>
                    </SimpleOpacityAnimation>
                }
                {
                    props.step >= 5 &&
                    <SimpleOpacityAnimation>
                        <section>
                            <h3>Local storage</h3>
                            <div>
                                <p>
                                    You may have noticed that the text inside the formula
                                    input element stays the same even when you change slides. <br/>
                                    Thanks to the browser's
                                    <a
                                        target="_blank"
                                        href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API"
                                    > Web Storage API
                                    </a> it is saved not only when you change slides, <br/> but also
                                    when you refresh the page, restart the browser, or even
                                    your device.
                                </p>
                            </div>
                        </section>
                    </SimpleOpacityAnimation>
                }
                {
                    props.step >= 6 &&
                    <SimpleOpacityAnimation>
                        <section>
                            <h3>Testing</h3>
                            <div>
                                <p>
                                    To make sure our algorithms were working as expected we <br/>
                                    created unit tests with the
                                    <a
                                        target="_blank"
                                        href="https://jestjs.io/"
                                    > jest
                                    </a> testing framework.

                                </p>
                                <p>
                                    Here's how we would define a test checking whether wrapping
                                    horizontally is working as expected:
                                </p>
                                <Code>
                                    {TestingCodeBlocks}
                                </Code>
                            </div>
                        </section>
                    </SimpleOpacityAnimation>
                }
                <motion.div
                    className={moduleStyles.svgBGContainer}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.1}}
                >
                    <ReactLogo
                        width="100%"
                        style={{
                            opacity: 0.1,
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
