import styles from "./slides.module.scss"
import {BasicAnimation, SimpleOpacityAnimation} from "../animations";
import Cite from "../../components/cite"

function WhatIsKarnaugh(props) {
    return (
        <div className={styles.titular}>
            <BasicAnimation>
                <h2>What is a Karnaugh map?</h2>
            </BasicAnimation>
            <main>
                {
                    props.step >= 1 &&
                    <SimpleOpacityAnimation duration={0.5} style={{float: "left", width: "33%"}}>

                        <figure style={{float: "left", width: "33%"}}>
                            <img alt="Karnaugh map example"

                                 src="/kmap.svg"
                            />
                            <figcaption>
                                Karnaugh Map example - Wikipedia <a
                                href="https://creativecommons.org/licenses/by-sa/3.0/"> CC
                                BY-SA 3.0 </a>GFDL
                                <div style={{fontSize: "1rem"}}>
                                    colored - minterms (DNF) <br/>
                                    gray - maxterms (CNF)
                                </div>
                            </figcaption>
                        </figure>
                    </SimpleOpacityAnimation>
                }
                {
                    props.step >= 2 &&
                    <SimpleOpacityAnimation duration={0.5}>
                        <Cite
                            prettyLink="Surrey University"
                            link="http://www.ee.surrey.ac.uk/Projects/Labview/minimisation/karnaugh.html"
                        >
                            <div>
                                A Karnaugh map provides a pictorial method of grouping together expressions with common
                                factors and
                                therefore eliminating unwanted variables. The Karnaugh map can also be described as a
                                special
                                arrangement of a truth table.
                            </div>
                            &nbsp;
                            <div>
                                The diagram below illustrates the correspondence between the Karnaugh map and the truth
                                table
                                for the general case of a two variable problem.
                                <br/>
                                <img
                                    src="/karintro1.gif"/>
                            </div>
                        </Cite>
                    </SimpleOpacityAnimation>
                }
            </main>
        </div>
    );
}

export default {
    Slide: WhatIsKarnaugh,
    steps: 2
}
