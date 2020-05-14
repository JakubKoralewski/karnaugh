import React, {useState, useEffect, useCallback, useReducer, useRef, useMemo} from "react"
import styles from './input_formula.module.scss'
import InputFormula from "./input_formula_only"
import TruthTableJsx from "./truth_table"
import ParseTree from "./parse_tree"

const ConditionalWrapper = ({ condition, wrapper, children }) =>
    condition ? wrapper(children) : children;

export default function InputFormulaAll(
    {
        shouldGenerateParseTree = false,
        shouldGenerateTruthTable = false,
        shouldShowInput = true,
        onChange,
        animate = false
    }) {
    let [statement, setStatement] = useState()
    console.log("rendering inputformulaall statement: ", statement)
    const onInnerChange = (stat) => {
        setStatement(stat)
        if(onChange)
            onChange(stat)
    }

    return (
        <div className={styles.container}>
            <div className={styles.formulaButtonRow}>
                <div className={styles.formulaWrapper}>
                    {
                        shouldShowInput && <InputFormula onChange={onInnerChange}/>
                    }
                </div>
            </div>

            {
                shouldGenerateParseTree && statement &&
                <ConditionalWrapper condition={!!animate} wrapper={animate}>
                    <ParseTree statement={statement}/>
                </ConditionalWrapper>
            }
            {
                shouldGenerateTruthTable && statement &&
                <ConditionalWrapper condition={!!animate} wrapper={animate}>
                    <TruthTableJsx statement={statement}/>
                </ConditionalWrapper>
            }

        </div>
    )
}
