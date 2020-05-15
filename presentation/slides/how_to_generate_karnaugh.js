import {useRef, useEffect, useCallback, useState} from "react"
import styles from "./slides.module.scss"
import InputFormulaAll from "../../components/input_formula_all"
import {BasicAnimation, SimpleOpacityAnimation} from "../animations"
import TruthTableJsx from "../../components/truth_table"
import KarnaughMap from "../../components/karnaugh_map"

function HowToGenerateKarnaugh(props) {
    const [statement, setStatement] = useState('')
    let [table, setTable] = useState(null)
    const onStatementChange = (statement) => {
        setStatement(statement)
    }
    const onTableGenerate = (t) => {
        console.log("setting table")
        setTable(t)
    }
    useEffect(() => {
        if(!statement) {
            props.canGoForward("Please input a formula")
        } else {
            props.canGoForward(true)
        }
    }, [props.step, statement])


    return (
        <div className={styles.titular} style={{background: "pink"}}>
            <BasicAnimation>
                <h2>How do we generate the Karnaugh Map?</h2>
            </BasicAnimation>
            <main>
                <ol>
                    <SimpleOpacityAnimation delay={0.2} duration={1}>
                        <li>First, we parse the formula.</li>
                        <InputFormulaAll
                            onChange={onStatementChange}
                            shouldGenerateParseTree={props.step >= 1}
                            animate={children => <SimpleOpacityAnimation>{children}</SimpleOpacityAnimation>}
                        />
                    </SimpleOpacityAnimation>
                    {
                        props.step >= 2 &&
                        <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)"}}>
                            <SimpleOpacityAnimation>
                                <div>
                                    <li>Second, we generate the truth table.</li>
                                    <TruthTableJsx onChange={onTableGenerate} statement={statement}/>
                                </div>
                            </SimpleOpacityAnimation>

                        {
                                props.step >=3 &&
                                <SimpleOpacityAnimation>
                                    <div>

                                    <li>And finally, we generate the Karnaugh map.</li>
                                    <KarnaughMap table={table} symbols={{t: "T", f: "F", na: "*"}}/>
                                    </div>
                                </SimpleOpacityAnimation>
                            }
                        </div>
                    }
                </ol>
            </main>
        </div>
    );
}

export default {
    Slide: HowToGenerateKarnaugh,
    steps: 3
}
