import React, {useEffect, useState} from "react"
import styles from "./slides.module.scss"
import InputFormulaAll from "../../components/input_formula"
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
        let prevBG = document.body.style.background
        document.body.style.background = "coral"
        return () => {
            if (props.direction === -1) {
                document.body.style.background = `linear-gradient(45deg, lightblue, coral)`
            } else {
                document.body.style.background = prevBG
            }
        }
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
                            dropdown={true}
                            arrowColor={"coral"}
                            dropDownStyle={{
                                "--arrow-color": "rgb(255, 127, 80)",
                                // "--secondary-color": "rgb(245,119,77)",
                                "--secondary-color": "rgb(224,224,224)",
                                "--separator-color": "rgb(255,247,247)",
                                "--font-heading-color": "black"
                            }}
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
    steps: 0
}
