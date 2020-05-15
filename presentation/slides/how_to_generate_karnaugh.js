import {useRef, useEffect, useCallback, useState} from "react"
import styles from "./slides.module.scss"
import InputFormulaAll from "../../components/input_formula_all"
import {BasicAnimation, SimpleOpacityAnimation} from "../animations"
import TruthTableJsx from "../../components/truth_table"
import KarnaughMap from "../../components/karnaugh_map"

function HowToGenerateKarnaugh(props) {
    const [statement, setStatement] = useState('')
    const [table, setTable] = useState(null)
    const onStatementChange = (statement) => {
        setStatement(statement)
    }
    const onTableGenerate = (t) => {
        setTable(t)
    }

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
                        <>
                            <SimpleOpacityAnimation>
                                <li>Second, we generate the truth table.</li>
                                <TruthTableJsx onChange={onTableGenerate} statement={statement}/>
                            </SimpleOpacityAnimation>

                            {
                                table &&
                                <SimpleOpacityAnimation>
                                    <li>And finally, we generate the Karnaugh map.</li>
                                    <KarnaughMap table={table} symbols={{t: "T", f: "F"}}/>
                                </SimpleOpacityAnimation>
                            }
                        </>
                    }
                </ol>
            </main>
        </div>
    );
}

export default {
    Slide: HowToGenerateKarnaugh,
    steps: 2
}
