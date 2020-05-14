import React, {useReducer} from "react"
import styles from "./input_formula.module.scss"
import makeTruthTable from "../project/truth_table"

const localStorageKey = `${process.env.staticFolder}-input-formula-truth-table`

const initialState = {
    memoTruthTable:
        !process.browser ?
            null : window ? (
                JSON.parse(window.localStorage.getItem(localStorageKey)) || ''
            ) : ''
}

function generateTable(state, statement) {
    if (state.memoTruthTable && state.memoTruthTable.input === statement.statement.trim()) {
        console.log("truth table same as last time, abort")
        return state.memoTruthTable
    }
    let table = makeTruthTable(statement)
    let memoTruthTable = {input: statement.statement.trim(), table}
    window.localStorage.setItem(
        localStorageKey,
        JSON.stringify(memoTruthTable)
    )
    console.log("saving table: ",)
    return memoTruthTable
}

const TruthTableJsx = React.memo(({statement}) => {
    console.group("generating truth table", statement)
    // let truthTable, setTruthTable
    let truthTable = generateTable(initialState, statement).table
    console.log("truthTable: ", truthTable)

    let rows = []
    for (let i = 0; i < truthTable.rows.length; ++i) {
        let row = []
        for (let j = 0; j < truthTable.variables.length; ++j) {
            row.push(truthTable.rows[i][truthTable.variables[j]])
        }
        let rowEval = truthTable.rows[i].eval
        row.push(rowEval)
        rows.push((
            <tr key={i} className={!rowEval ? styles.tableFalseRow : ''}>
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
    console.groupEnd()
    return (
        <div className={styles.truthTableContainer}>
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
        </div>
    )
})
export default TruthTableJsx
