import React, {useRef, useEffect, useCallback, useState} from "react"
import styles from "./slides.module.scss"
import InputFormulaAll from "../../components/input_formula_all"
import {BasicAnimation, SimpleOpacityAnimation} from "../animations"
import KarnaughMap from "../../components/karnaugh_map/karnaugh_map"
import makeTruthTable from "../../project/truth_table";

function DNF(props) {
    const [state, setState] = useState({statement: '', table: null})
    const [DNF, setDNF] = useState('')
    const onStatementChange = (statement) => {
        setState(oldState => {
                const truthTable = makeTruthTable(statement)
                return {
                    ...oldState,
                    statement,
                    table: truthTable,
                }
            }
        )
    }

    const onReturnDNF = (dnf) => {
        setDNF(dnf)
    }

    useEffect(() => {
        if (!state.statement) {
            props.canGoForward("Please input a formula")
        } else {
            props.canGoForward(true)
        }
    }, [props.step, state.statement])

    useEffect(() => {
        let prevBG = document.body.style.backgroundColor
        document.body.style.background = "coral"
        return () => document.body.style.backgroundColor = prevBG
    }, [])

    return (
        <div className={styles.titular} style={{background: "coral"}}>
            <BasicAnimation>
                <h2>Generating DNF</h2>
            </BasicAnimation>
            <main style={{height: "100%", marginTop: "calc(2rem + 5vh)"}}>
                <ol>
                    <SimpleOpacityAnimation delay={0.2} duration={1}>
                        <InputFormulaAll
                            onChange={onStatementChange}
                            animate={children => <SimpleOpacityAnimation>{children}</SimpleOpacityAnimation>}
                        />
                    </SimpleOpacityAnimation>
                    <div style={{display: "flex", width: "100%", justifyContent: "center"}}>
                        <SimpleOpacityAnimation style={{width: "66.6%"}}>
                            <div>
                                {
                                    state.table &&
                                    <KarnaughMap
                                        table={state.table}
                                        symbols={{t: "T", f: "F", na: "*"}}
                                        returnDNF={onReturnDNF}
                                        dnf={true}
                                        style={
                                            {
                                                width: "100%",
                                                tableLayout: "fixed"
                                            }
                                        }
                                    />
                                }
                                {
                                    state.table && DNF &&
                                    <div>{DNF}</div>
                                }
                            </div>
                        </SimpleOpacityAnimation>
                    </div>
                </ol>
            </main>
        </div>
    );
}

export default {
    Slide: DNF,
}
