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

const initialState = {
    statement: null,
    isValid: null,
    errorMessage: "text",
    showErrorMessage: false
}

function reducer(state, {type, text, show}) {
    switch(type) {
        case 'add': {
            let errorMessage
            let isValid = true
            let statement
            try {
                statement = new Statement(text)
            } catch(error) {
                isValid = false
                errorMessage = error
            }
            return {
                statement: statement ?? state.statement,
                isValid,
                errorMessage: errorMessage ?? state.errorMessage
            }
        }
        case 'show_error': {
            return {
                ...state,
                showErrorMessage: show
            }
        }
    }
}

export default function InputFormula() {
    let [text, setText] = useState("")
    const [state, dispatch] = useReducer(reducer, initialState)

    // https://reactjs.org/docs/hooks-reference.html#usereducer
    const [tableState, tableDispatch] = useReducer(tableReducer, tableInitialState);
    useEffect(() => {
        if (!text) return;
        dispatch({type: 'add', text})
    }, [text])


    const generateTruthTable = () => {
        if (!state.statement) return;
        tableDispatch({type: 'generate', statement:state.statement})
    }

    // debounce
    // https://stackoverflow.com/questions/59358092/set-input-value-with-a-debounced-onchange-handler
    // https://stackoverflow.com/a/58594348/10854888
    const debouncedHandler = useCallback(debounce((text) => {setText(text)}, 200),[])

    return (
        <div className={styles.container}>
            <div className={styles.formulaButtonRow}>
                <div className={styles.formulaWrapper}>
                    <div className={[styles.error, state.showError && isValid === false ? styles.showError : ''].join(' ')}>
                        {state.errorMessage.toString()}
                    </div>
                    <input
                        className={[state.isValid ? styles.valid : styles.invalid, styles.inputFormula].join(' ')}
                        onChange={(event) => {
                            debouncedHandler(event.target.value)
                        }}
                        onMouseEnter={() => {
                            dispatch({type: 'show_error', show: true})
                        }}
                        onMouseLeave={() => {
                            dispatch({type: 'show_error', show: false})
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