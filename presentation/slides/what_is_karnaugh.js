import styles from "./slides.module.scss"
import {BasicAnimation, SimpleOpacityAnimation} from "../animations";
import Cite from "../../components/cite"
import get_url from "../../components/get_url"

function WhatIsKarnaugh(props) {
    return (
        <div className={styles.titular}>
            <BasicAnimation>
                <h2>What is a Karnaugh map?</h2>
            </BasicAnimation>
            <main>
                {
                    <SimpleOpacityAnimation delay={0.25} duration={1} style={{float: "left", width: "33%"}}>

                        <figure style={{float: "left", width: "33%"}}>
                            <img alt="Karnaugh map example"

                                 src={get_url('/kmap.svg')}
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
                    props.step >= 1 &&
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
                                    src={get_url('/karintro1.gif')}
                                    alt="Truth table and Karnaugh map"
                                />
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
    steps: 1
}
