import React, {useEffect, useState} from "react"
import styles from "./slides.module.scss"
import InputFormulaAll from "../../components/input_formula_all"
import {BasicAnimation, SimpleOpacityAnimation} from "../animations"
import makeTruthTable from "../../project/truth_table"
import KarnaughMapWithDNF from "../../components/karnaugh_map/karnaugh_map_with_dnf"

function DNF(props) {
    const [state, setState] = useState({statement: '', table: null})

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
                            <KarnaughMapWithDNF
                                table={state.table}
                            />
                        </SimpleOpacityAnimation>
                    </div>
                </ol>
            </main>
        </div>
    )
        ;
}

export default {
    Slide: DNF,
}
