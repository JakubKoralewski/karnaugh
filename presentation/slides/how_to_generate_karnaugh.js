import {useRef, useEffect, useCallback, useState} from "react"
import styles from "./slides.module.scss"
import InputFormulaAll  from "../../components/input_formula_all"
import {BasicAnimation, SimpleOpacityAnimation} from "../animations"
import TruthTableJsx from "../../components/truth_table";

function HowToGenerateKarnaugh(props) {
    const [statement, setStatement] = useState('')
    const onStatementChange = (statement) => {
        setStatement(statement)
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
                        <SimpleOpacityAnimation>
                            <li>Second, we generate the truth table.</li>
                            <TruthTableJsx statement={statement} />
                        </SimpleOpacityAnimation>
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
