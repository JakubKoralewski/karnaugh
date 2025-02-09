import React, {useState} from "react"
import styles from './styles.module.scss'
import InputFormula from "./input_formula"
import TruthTableJsx from "../truth_table"
import ParseTree from "../parse_tree"
import {DropDown} from "./dropdown"
import dropDownOptions from "./dropdown_options"

/** @author https://blog.hackages.io/conditionally-wrap-an-element-in-react-a8b9a47fab2 */
const ConditionalWrapper = ({condition, wrapper, children}) =>
    condition ? wrapper(children) : children;

/**
 * Wrapper around `InputFormula`, `TruthTable` and `ParseTree`, making it
 *  easy to show them all as one component.
 *
 *  @param {Object} obj - input object
 *  @param {boolean} obj.animate - a function that will return an animation object, so you can
 *      specify from parent what animation you want to be used
 */
export default function InputFormulaAll(
    {
        shouldGenerateParseTree = false,
        shouldGenerateTruthTable = false,
        shouldShowInput = true,
        onChange,
        animate = false,
        dropdown = false,
        dropDownStyle,
        arrowColor
    }) {
    let [statement, setStatement] = useState('')
    let [dropDownInfusedStatement, setDropDownInfusedStatement] = useState({refreshIndex: 0, value: ''})
    console.log("rendering inputformulaall statement: ", statement)
    /** @param {string} stat*/
    const onInnerChange = (stat) => {
        setStatement(stat)
        if (onChange) {
            onChange(stat)
        }
    }
    const onOptionClick = (text) => {
        setDropDownInfusedStatement(old => ({refreshIndex: ++old.refreshIndex, value: text}))
    }

    return (
        <div className={styles.container}>
            <div className={styles.formulaButtonRow}>
                <div className={styles.formulaWrapper}>
                    {
                        shouldShowInput &&
                        <InputFormula
                            onChange={onInnerChange}
                            dropDownInfusedStatement={dropdown ? dropDownInfusedStatement.value : null}
                        />
                    }
                    {
                        dropdown &&
                        <DropDown
                            currentText={statement.statement}
                            arrowColor={arrowColor}
                            options={dropDownOptions}
                            style={dropDownStyle}
                            onOptionClick={onOptionClick}
                        />
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
