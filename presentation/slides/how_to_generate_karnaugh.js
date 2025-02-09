import React, {useEffect, useState} from "react"
import styles from "./slides.module.scss"
import InputFormulaAll from "../../components/input_formula"
import {BasicAnimation, SimpleOpacityAnimation} from "../animations"
import TruthTableJsx from "../../components/truth_table"
import KarnaughMap from "../../components/karnaugh_map/karnaugh_map"

const steps = 4

function HowToGenerateKarnaugh(props) {
    const [statement, setStatement] = useState('')
    let [table, setTable] = useState(null)
    let [tableRefs, setTableRefs] = useState('placeholder')
    const onStatementChange = (statement) => {
        setStatement(statement)
    }
    const onTableGenerate = (t) => {
        console.log("setting table")
        setTable(t)
    }
    const onReturnedTableRefs = (refs) => {
        console.log("Truth table returned these refs: ", refs)
        setTableRefs(refs)
    }
    useEffect(() => {
        if (!statement) {
            props.canGoForward("Please input a formula")
        } else {
            props.canGoForward(true)
        }
    }, [props.step, statement])

    const getKarnaughHeader = () => {
        if (props.step === 3) {
            return "We generate the headers."
        } else if (props.step >= 4) {
            return "And then copy the values!"
        }
    }
    useEffect(() => {
        let prevBG = document.body.style.backgroundColor
        document.body.style.background = "pink"
        return () => document.body.style.backgroundColor = prevBG
    }, [])

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
                                    {
                                        statement &&
                                        <TruthTableJsx
                                            onChange={onTableGenerate}
                                            statement={statement}
                                            returnRefs={onReturnedTableRefs}
                                        />
                                    }
                                </div>
                            </SimpleOpacityAnimation>

                            {
                                props.step >= 3 &&
                                <SimpleOpacityAnimation>
                                    <div style={{width: "50%"}}>

                                        <li>{getKarnaughHeader()}</li>
                                        {
                                            table &&
                                            <KarnaughMap
                                                table={table}
                                                symbols={{t: "T", f: "F", na: "*"}}
                                                tableRefs={
                                                    props.direction === -1 && props.step === steps
                                                        ? null : tableRefs
                                                }
                                                onlyHeaders={props.step < 4}
                                                style={
                                                    {
                                                        background: props.step >= 4 ? "white" : "none",
                                                        width: "66.6%",
                                                        transition: "background 1s"
                                                    }
                                                }
                                            />
                                        }

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
    steps
}
