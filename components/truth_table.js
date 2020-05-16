import React, {useEffect, useRef} from "react"
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

const TruthTableJsx = React.memo(({statement, onChange, symbols={t: "T", f: "F"}, returnRefs}) => {
    console.group("generating truth table", statement)
    let truthTable = generateTable(initialState, statement).table
    console.log("truthTable: ", truthTable)
    const headerEvalRef = useRef()
    const refs = {evals: {}, headers: {}}
    useEffect(
        () => {
            onChange(truthTable)
            if(returnRefs) {
                returnRefs(refs)
            }
        },
        [statement]
    )

    let rows = []
    for (let i = 0; i < truthTable.rows.length; ++i) {
        let row = []
        for (let j = 0; j < truthTable.variables.length; ++j) {
            const variableName = truthTable.variables[j]
            row.push({name: variableName, eval: truthTable.rows[i][variableName]})
        }
        let rowEval = truthTable.rows[i].eval
        row.push({name: `eval${row.map(r => r.eval ? symbols.t : symbols.f).join('')}`, eval: rowEval})
        rows.push((
            <tr key={i} className={!rowEval ? styles.tableFalseRow : ''}>
                {
                    row.map((someEval, j) => {
                        let newRef = useRef()
                        let newRefKey = `${someEval.name}${someEval.eval ? symbols.t : symbols.f}`
                        if(!refs.evals[newRefKey]) {
                            refs.evals[newRefKey] = []
                        }
                        refs.evals[newRefKey].push(newRef)
                        return (<td ref={newRef}>
                            {
                                someEval.eval ? symbols.t : symbols.f
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
                            let newRef = useRef()
                            refs.headers[variable] = newRef

                            return (<th key={i} ref={newRef}>{variable}</th>)
                        })
                    }
                    <th ref={headerEvalRef}>{truthTable.statement}</th>
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
