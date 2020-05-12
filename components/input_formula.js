import React, {useState, useEffect, useCallback, useReducer} from "react"
import Statement from "../project/statement";
import makeTruthTable from "../project/truth_table"
import styles from './input_formula.module.scss'
import {debounce} from "lodash"


const tableInitialState = {
    truthTable: null,
    truthTableJsx: null
}

function tableReducer(state, {type, statement}) {
    switch(type) {
        case 'generate': {
            let truthTable = makeTruthTable(statement)
            let truthTableJsx = generateTruthTableJsx(truthTable)
            return {truthTable, truthTableJsx}
        }
    }
}

export default function InputFormula() {
    let [text, setText] = useState("")
    let [statement, setStatement] = useState(null)
    let [isValid, setIsValid] = useState(null)
    let [showError, setShowError] = useState(false)
    let [errorMessage, setErrorMessage] = useState("text")


    // https://reactjs.org/docs/hooks-reference.html#usereducer
    const [tableState, tableDispatch] = useReducer(tableReducer, tableInitialState);
    useEffect(() => {
        if (!text) return;
        try {
            setStatement(new Statement(text))
            setIsValid(true)
        } catch (error) {
            setIsValid(false)
            setErrorMessage(error)
        }
    }, [text])


    const generateTruthTable = () => {
        if (!statement) return;
        tableDispatch({type: 'generate', statement})
    }

    // debounce
    // https://stackoverflow.com/questions/59358092/set-input-value-with-a-debounced-onchange-handler
    // https://stackoverflow.com/a/58594348/10854888
    const debouncedHandler = useCallback(debounce((text) => {setText(text)}, 200),[])

    return (
        <div className={styles.container}>
            <div className={styles.formulaButtonRow}>
                <div className={styles.formulaWrapper}>
                    <div className={[styles.error, showError && isValid === false ? styles.showError : ''].join(' ')}>
                        {errorMessage.toString()}
                    </div>
                    <input
                        className={[isValid ? styles.valid : styles.invalid, styles.inputFormula].join(' ')}
                        onChange={(event) => {
                            debouncedHandler(event.target.value)
                        }}
                        onMouseEnter={() => {
                            setShowError(true)
                        }}
                        onMouseLeave={() => {
                            setShowError(false)
                        }}
                    >
                    </input>
                </div>
                <button
                    className={styles.generateTruthTableButton}
                    onClick={generateTruthTable}
                >
                    Generate truth table
                </button>
            </div>

            {
                tableState.truthTable && tableState.truthTableJsx
            }
        </div>
    )
}

function generateTruthTableJsx(truthTable) {
    let rows = []
    for (let i = 0; i < truthTable.rows.length; ++i) {
        let row = []
        for (let j = 0; j < truthTable.variables.length; ++j) {
            row.push(truthTable.rows[i][truthTable.variables[j]])
        }
        row.push(truthTable.rows[i].eval)
        rows.push((
            <tr key={i}>
                {
                   row.map((someEval, j) => {
                       return (<td key={j}>
                           {
                                someEval ? "T" : "F"
                           }
                       </td>)
                   })
                }
            </tr>
        ))
    }

    return (
        <table className={styles.truthTable}>
            <thead>
            <tr>
                {
                    truthTable.variables.map((variable, i) => {

                        return (<th key={i}>{variable}</th>)
                    })
                }
                <th>{truthTable.statement}</th>
            </tr>
            </thead>
            <tbody>
            {
                rows
            }
            </tbody>
        </table>
    )
}